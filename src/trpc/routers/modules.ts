import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { courseVersion, draftModules, modules } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "../init";

export const modulesRouter = createTRPCRouter({
  getDraftModulesByCourseId: protectedProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      return ctx.db
        .select()
        .from(draftModules)
        .where(eq(draftModules.courseId, input));
    }),

  getModulesByLatestVersionId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const [latestVersion] = await ctx.db
        .select()
        .from(courseVersion)
        .where(eq(courseVersion.courseId, input))
        .orderBy(desc(courseVersion.versionNumber))
        .limit(1);

      return ctx.db
        .select()
        .from(modules)
        .where(eq(modules.courseVersionId, latestVersion.id));
    }),
});
