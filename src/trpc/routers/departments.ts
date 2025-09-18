import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import {
  createDepartmentSchema,
  editDepartmentSchema,
} from "@/components/features/departments/schema";
import { department } from "@/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

export const departmentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createDepartmentSchema)
    .mutation(({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return ctx.db.insert(department).values({
        name: input.name,
        slug: input.slug,
        description: input.description,
      });
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.select().from(department);
  }),
  getById: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db
      .select()
      .from(department)
      .where(eq(department.id, input))
      .limit(1);
  }),

  editDepartment: protectedProcedure
    .input(editDepartmentSchema)
    .mutation(({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return ctx.db
        .update(department)
        .set({
          name: input.name,
          description: input.description,
          slug: input.slug,
        })
        .where(eq(department.id, input.id));
    }),
});
