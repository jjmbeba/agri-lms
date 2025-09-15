import { count, eq } from "drizzle-orm";
import { createCourseSchema } from "@/components/features/courses/schema";
import { category, course } from "@/db/schema";
import { createTRPCRouter, publicProcedure } from "../init";

export const coursesRouter = createTRPCRouter({
  create: publicProcedure
    .input(createCourseSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(course).values({
        title: input.title,
        description: input.description,
        tags: input.tags.map((tag) => tag.text).join(","),
        categoryId: input.categoryId,
      });
    }),
  getCoursesCount: publicProcedure.query(({ ctx }) => {
    return ctx.db.select({ count: count() }).from(course);
  }),
  getCourses: publicProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(course)
      .leftJoin(category, eq(course.categoryId, category.id));
  }),
});
