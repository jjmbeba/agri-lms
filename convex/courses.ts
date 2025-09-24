import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { ROLES } from "./constants";

export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    departmentId: v.id("department"),
  },
  handler: async (ctx, args) => {
    const session = await authComponent.getAuthUser(ctx);

    if (!session) {
      throw new Error("Not authenticated");
    }

    if (session.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("course", {
      title: args.title,
      description: args.description,
      tags: args.tags,
      departmentId: args.departmentId,
      status: "draft",
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

    const departmentById = new Map(
      departments.map((d) => [d._id as unknown as string, d])
    );

    return courses.map((c) => ({
      course: c,
      department:
        departmentById.get(c.departmentId as unknown as string) ?? null,
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

    return { course, department, modulesCount } as const;
  },
});

export const deleteCourse = mutation({
  args: { id: v.id("course") },
  handler: async (ctx, args) => {
    const session = await authComponent.getAuthUser(ctx);

    if (!session) {
      throw new Error("Not authenticated");
    }

    if (session.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized");
    }

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
  },
  handler: async (ctx, args) => {
    const session = await authComponent.getAuthUser(ctx);

    if (!session) {
      throw new Error("Not authenticated");
    }

    if (session.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      tags: args.tags,
      departmentId: args.departmentId,
    });
    return await ctx.db.get(args.id);
  },
});
