import { createCourseSchema } from "@/components/features/courses/schema";
import { course } from "@/db/schema";
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
});
