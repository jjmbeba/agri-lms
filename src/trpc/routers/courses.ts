import { TRPCError } from "@trpc/server";
import { count, eq } from "drizzle-orm";
import { z } from "zod";
import {
  createCourseSchema,
  editCourseSchema,
} from "@/components/features/courses/schema";
import { course, department } from "@/db/schema";
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
  getCourse: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db
      .select()
      .from(course)
      .leftJoin(department, eq(course.departmentId, department.id))
      .where(eq(course.id, input))
      .limit(1);
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
