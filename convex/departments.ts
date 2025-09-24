import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { ROLES } from "./constants";

export const getDepartments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("department").collect();
  },
});

export const createDepartment = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await authComponent.getAuthUser(ctx);

    if (!session) {
      throw new Error("Not authenticated");
    }

    if (session.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("department", {
      name: args.name,
      slug: args.slug,
      description: args.description,
    });
  },
});

export const getAllDepartmentsWithCounts = query({
  args: {},
  handler: async (ctx) => {
    const [departments, courses] = await Promise.all([
      ctx.db.query("department").collect(),
      ctx.db.query("course").collect(),
    ]);

    const courseCountByDepartmentId = new Map<Id<"department">, number>();
    for (const course of courses) {
      const key = course.departmentId;
      const current = courseCountByDepartmentId.get(key) ?? 0;
      courseCountByDepartmentId.set(key, current + 1);
    }

    return departments.map((dept) => ({
      ...dept,
      courseCount: courseCountByDepartmentId.get(dept._id) ?? 0,
    }));
  },
});

export const getDepartmentById = query({
  args: { id: v.id("department") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const editDepartment = mutation({
  args: {
    id: v.id("department"),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
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
      name: args.name,
      slug: args.slug,
      description: args.description,
    });
    return await ctx.db.get(args.id);
  },
});

export const deleteDepartment = mutation({
  args: { id: v.id("department") },
  handler: async (ctx, args) => {
    const session = await authComponent.getAuthUser(ctx);

    if (!session) {
      throw new Error("Not authenticated");
    }

    if (session.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
    return { success: true } as const;
  },
});
