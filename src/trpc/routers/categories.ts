import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const categoriesRouter = createTRPCRouter({
  create: baseProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.category.create({
        data: input,
      });
    }),
});
