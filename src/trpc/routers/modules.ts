import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  basicInformationSchema,
  contentSchema,
} from "@/components/features/modules/schema";
import {
  course,
  courseVersion,
  draftModuleContent,
  draftModules,
  modules,
} from "@/db/schema";
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

  createDraftModule: protectedProcedure
    .input(
      z.object({
        basicInfo: basicInformationSchema,
        content: contentSchema,
        courseId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify the course exists
        const courseData = await ctx.db
          .select()
          .from(course)
          .where(eq(course.id, input.courseId))
          .limit(1);

        if (courseData.length === 0) {
          throw new Error("Course not found");
        }

        const [{ count: existingCount }] = await ctx.db
          .select({ count: count() })
          .from(draftModules)
          .where(eq(draftModules.courseId, input.courseId));

        const position = existingCount + 1;

        // Insert the draft module
        const [draftModule] = await ctx.db
          .insert(draftModules)
          .values({
            ...input.basicInfo,
            position,
            courseId: input.courseId,
          })
          .returning();

        // Insert content items if they exist
        if (input.content.content && input.content.content.length > 0) {
          const contentItems = input.content.content.map((item, index) => ({
            draftModuleId: draftModule.id,
            type: item.type,
            title: item.type, // Using type as title for now
            content: item.content,
            orderIndex: index,
          }));

          await ctx.db.insert(draftModuleContent).values(contentItems);
        }

        return draftModule;
      } catch (error) {
        throw new Error(
          `Failed to create draft module: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),
});
