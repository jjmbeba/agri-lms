import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { restrictRoles } from "./auth";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_IN_WINDOW = 30;

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
    const identity = await ctx.auth.getUserIdentity();

    restrictRoles(identity, ["admin"]);

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
    const [departments, courses, enrollments] = await Promise.all([
      ctx.db.query("department").collect(),
      ctx.db.query("course").collect(),
      ctx.db.query("enrollment").collect(),
    ]);

    const courseCountByDepartmentId = new Map<Id<"department">, number>();
    const courseDepartmentMap = new Map<Id<"course">, Id<"department">>();

    for (const course of courses) {
      const key = course.departmentId;
      const current = courseCountByDepartmentId.get(key) ?? 0;
      courseCountByDepartmentId.set(key, current + 1);
      courseDepartmentMap.set(course._id, course.departmentId);
    }

    const studentIdsByDepartment = new Map<Id<"department">, Set<string>>();
    for (const enrollment of enrollments) {
      const deptId = courseDepartmentMap.get(enrollment.courseId);
      if (!deptId) {
        continue;
      }
      const set = studentIdsByDepartment.get(deptId) ?? new Set<string>();
      set.add(enrollment.userId);
      studentIdsByDepartment.set(deptId, set);
    }

    return departments.map((dept) => ({
      ...dept,
      courseCount: courseCountByDepartmentId.get(dept._id) ?? 0,
      studentCount: studentIdsByDepartment.get(dept._id)?.size ?? 0,
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
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

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
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    await ctx.db.delete(args.id);
    return { success: true } as const;
  },
});

export const getDepartmentStats = query({
  args: {},
  handler: async (ctx) => {
    const [departments, courses, enrollments] = await Promise.all([
      ctx.db.query("department").collect(),
      ctx.db.query("course").collect(),
      ctx.db.query("enrollment").collect(),
    ]);

    const totalDepartments = departments.length;
    const totalCourses = courses.length;

    const uniqueStudents = new Set(enrollments.map((enrollment) => enrollment.userId));
    const totalStudents = uniqueStudents.size;

    const now = Date.now();
    const startCurrent = now - DAYS_IN_WINDOW * MS_PER_DAY;
    const startPrevious = now - 2 * DAYS_IN_WINDOW * MS_PER_DAY;

    const currentWindowCount = enrollments.filter((enrollment) => {
      const ts = Date.parse(enrollment.enrolledAt);
      return !Number.isNaN(ts) && ts >= startCurrent;
    }).length;

    const previousWindowCount = enrollments.filter((enrollment) => {
      const ts = Date.parse(enrollment.enrolledAt);
      return !Number.isNaN(ts) && ts >= startPrevious && ts < startCurrent;
    }).length;

    const enrollmentGrowthPct =
      previousWindowCount === 0
        ? currentWindowCount > 0
          ? 100
          : 0
        : Math.round(
            ((currentWindowCount - previousWindowCount) / previousWindowCount) * 100
          );

    return {
      totalDepartments,
      totalCourses,
      totalStudents,
      enrollmentGrowthPct,
    } as const;
  },
});
