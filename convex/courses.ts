import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { restrictRoles } from "./auth";
import { generateCourseSlug } from "./utils/slug";

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

async function buildCourseResponse(ctx: QueryCtx, course: Doc<"course">) {
  const department = await ctx.db.get(course.departmentId);

  const versions = await ctx.db
    .query("courseVersion")
    .filter((q) => q.eq(q.field("courseId"), course._id))
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
  let moduleAccessIds: Id<"module">[] = [];
  if (identity) {
    const enrollment = await ctx.db
      .query("enrollment")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("courseId"), course._id)
        )
      )
      .first();
    isEnrolled = Boolean(enrollment);

    if (!isEnrolled) {
      const accessRows = await ctx.db
        .query("moduleAccess")
        .withIndex("user_course", (q) =>
          q.eq("userId", identity.subject).eq("courseId", course._id)
        )
        .collect();
      moduleAccessIds = accessRows.map((row) => row.moduleId);
    }
  }

  return {
    course,
    department,
    modulesCount,
    isEnrolled,
    moduleAccess: {
      count: moduleAccessIds.length,
      moduleIds: moduleAccessIds,
    },
  } as const;
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

    const slug = await generateCourseSlug(ctx, args.title);

    return await ctx.db.insert("course", {
      title: args.title,
      slug,
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

    return buildCourseResponse(ctx, course);
  },
});

export const getCourseBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("course")
      .withIndex("slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!course) {
      return null;
    }

    return buildCourseResponse(ctx, course);
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

    const existingCourse = await ctx.db.get(args.id);
    if (!existingCourse) {
      throw new ConvexError("Course not found");
    }

    const shouldRegenerateSlug =
      existingCourse.title !== args.title || !existingCourse.slug;
    const slug = shouldRegenerateSlug
      ? await generateCourseSlug(ctx, args.title, args.id)
      : existingCourse.slug;

    await ctx.db.patch(args.id, {
      title: args.title,
      slug,
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

    const moduleAccessRows = await ctx.db
      .query("moduleAccess")
      .withIndex("user_course", (q) => q.eq("userId", identity.subject))
      .collect();
    const moduleAccessByCourse = new Map<Id<"course">, Id<"module">[]>();
    for (const row of moduleAccessRows) {
      const existing = moduleAccessByCourse.get(row.courseId) ?? [];
      existing.push(row.moduleId);
      moduleAccessByCourse.set(row.courseId, existing);
    }

    return courses.map((c) => ({
      course: c,
      department: departmentById.get(c.departmentId) ?? null,
      isEnrolled: userEnrollments.some((e) => e.courseId === c._id),
      moduleAccess: {
        count: moduleAccessByCourse.get(c._id)?.length ?? 0,
        moduleIds: moduleAccessByCourse.get(c._id) ?? [],
      },
    }));
  },
});
