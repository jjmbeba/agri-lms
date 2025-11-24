import { ConvexError, v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { restrictRoles } from "./auth";

// Helper function to calculate total price of draft modules for a course
async function getDraftModulesTotalPrice(
  ctx: MutationCtx,
  courseId: Id<"course">
): Promise<number> {
  const draftModules = await ctx.db
    .query("draftModule")
    .filter((q) => q.eq(q.field("courseId"), courseId))
    .collect();

  return draftModules.reduce(
    (total, module) => total + module.priceShillings,
    0
  );
}

export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    departmentId: v.id("department"),
    priceShillings: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    // For new courses, there are no modules yet, so we allow any price >= 0
    if (args.priceShillings < 0) {
      throw new Error("Course price must be non-negative");
    }

    return await ctx.db.insert("course", {
      title: args.title,
      description: args.description,
      tags: args.tags,
      departmentId: args.departmentId,
      status: "draft",
      priceShillings: args.priceShillings,
    });
  },
});

export const getCoursesCount = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("course").collect();
    return { count: courses.length } as const;
  },
});

export const getCourses = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("course").collect();
    const departments = await ctx.db.query("department").collect();

    const departmentById = new Map(departments.map((d) => [d._id, d]));

    return courses.map((c) => ({
      course: c,
      department: departmentById.get(c.departmentId) ?? null,
    }));
  },
});

export const getCourse = query({
  args: { id: v.id("course") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    if (!course) {
      return null;
    }

    const department = await ctx.db.get(course.departmentId);

    const versions = await ctx.db
      .query("courseVersion")
      .filter((q) => q.eq(q.field("courseId"), args.id))
      .collect();

    let modulesCount = 0;
    if (versions.length > 0) {
      const latest = versions.reduce((acc, cur) =>
        cur.versionNumber > acc.versionNumber ? cur : acc
      );
      const modulesForLatest = await ctx.db
        .query("module")
        .filter((q) => q.eq(q.field("courseVersionId"), latest._id))
        .collect();
      modulesCount = modulesForLatest.length;
    }

    const identity = await ctx.auth.getUserIdentity();

    let isEnrolled = false;
    if (identity) {
      const enrollment = await ctx.db
        .query("enrollment")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), identity.subject),
            q.eq(q.field("courseId"), args.id)
          )
        )
        .first();
      isEnrolled = Boolean(enrollment);
    }

    return { course, department, modulesCount, isEnrolled } as const;
  },
});

export const deleteCourse = mutation({
  args: { id: v.id("course") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    const versions = await ctx.db
      .query("courseVersion")
      .filter((q) => q.eq(q.field("courseId"), args.id))
      .collect();

    for (const vRow of versions) {
      const modules = await ctx.db
        .query("module")
        .filter((q) => q.eq(q.field("courseVersionId"), vRow._id))
        .collect();

      for (const m of modules) {
        const contents = await ctx.db
          .query("moduleContent")
          .filter((q) => q.eq(q.field("moduleId"), m._id))
          .collect();

        for (const c of contents) {
          await ctx.db.delete(c._id);
        }
        await ctx.db.delete(m._id);
      }
      await ctx.db.delete(vRow._id);
    }
    await ctx.db.delete(args.id);
    return { success: true } as const;
  },
});

export const editCourse = mutation({
  args: {
    id: v.id("course"),
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    departmentId: v.id("department"),
    priceShillings: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    // Validate that course price does not exceed total module prices
    const moduleTotal = await getDraftModulesTotalPrice(ctx, args.id);
    if (moduleTotal > 0 && moduleTotal < args.priceShillings) {
      throw new ConvexError(
        `Course price (${args.priceShillings} KES) cannot exceed combined module prices (${moduleTotal} KES)`
      );
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      tags: args.tags,
      departmentId: args.departmentId,
      priceShillings: args.priceShillings,
    });
    return await ctx.db.get(args.id);
  },
});

export const getPublishedCourses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const courses = await ctx.db
      .query("course")
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();
    const departments = await ctx.db.query("department").collect();

    const departmentById = new Map(departments.map((d) => [d._id, d]));

    const userEnrollments = await ctx.db
      .query("enrollment")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    return courses.map((c) => ({
      course: c,
      department: departmentById.get(c.departmentId) ?? null,
      isEnrolled: userEnrollments.some((e) => e.courseId === c._id),
    }));
  },
});
