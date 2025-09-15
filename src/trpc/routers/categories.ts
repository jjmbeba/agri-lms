import { createCategorySchema } from "@/components/features/courses/schema";
import { category } from "@/db/schema";
import { createTRPCRouter, publicProcedure } from "../init";

export const categoriesRouter = createTRPCRouter({
  create: publicProcedure
    .input(createCategorySchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(category).values({
        name: input.name,
        slug: input.slug,
      });
    }),
});
