import { TRPCError } from "@trpc/server";
import { createCategorySchema } from "@/components/features/courses/schema";
import { category } from "@/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

export const categoriesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createCategorySchema)
    .mutation(({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return ctx.db.insert(category).values({
        name: input.name,
        slug: input.slug,
      });
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.select().from(category);
  }),
});
