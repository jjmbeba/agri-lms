import { TRPCError } from "@trpc/server";
import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  createCourseSchema,
  editCourseSchema,
} from "@/components/features/courses/schema";
import { course, courseVersion, department, modules } from "@/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

export const coursesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createCourseSchema)
    .mutation(({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.insert(course).values({
        title: input.title,
        description: input.description,
        tags: input.tags.map((tag) => tag.text).join(","),
        departmentId: input.departmentId,
      });
    }),
  getCoursesCount: protectedProcedure.query(({ ctx }) => {
    return ctx.db.select({ count: count() }).from(course);
  }),
  getCourses: publicProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(course)
      .leftJoin(department, eq(course.departmentId, department.id));
  }),
  getCourse: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    // Get the course with department info
    const courseData = await ctx.db
      .select()
      .from(course)
      .leftJoin(department, eq(course.departmentId, department.id))
      .where(eq(course.id, input))
      .limit(1);

    if (!courseData[0]) {
      return null;
    }

    // Get the latest course version
    const latestVersion = await ctx.db
      .select()
      .from(courseVersion)
      .where(eq(courseVersion.courseId, input))
      .orderBy(desc(courseVersion.versionNumber))
      .limit(1);

    if (!latestVersion[0]) {
      return {
        ...courseData[0],
        modulesCount: 0,
      };
    }

    // Get count of modules for the latest version
    const modulesCountResult = await ctx.db
      .select({ count: count() })
      .from(modules)
      .where(eq(modules.courseVersionId, latestVersion[0].id));

    return {
      ...courseData[0],
      modulesCount: modulesCountResult[0]?.count || 0,
    };
  }),
  deleteCourse: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.delete(course).where(eq(course.id, input));
    }),
  editCourse: protectedProcedure
    .input(editCourseSchema)
    .mutation(({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db
        .update(course)
        .set({
          title: input.title,
          description: input.description,
          tags: input.tags.map((tag) => tag.text).join(","),
          departmentId: input.departmentId,
        })
        .where(eq(course.id, input.id));
    }),
});
