import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, inArray } from "drizzle-orm";
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
  moduleContent,
  modules,
} from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "../init";

export const modulesRouter = createTRPCRouter({
  getDraftModulesByCourseId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const draftModulesData = await ctx.db
        .select()
        .from(draftModules)
        .where(eq(draftModules.courseId, input))
        .orderBy(draftModules.position);

      // Fetch content for each draft module
      const modulesWithContent = await Promise.all(
        draftModulesData.map(async (module) => {
          const content = await ctx.db
            .select()
            .from(draftModuleContent)
            .where(eq(draftModuleContent.draftModuleId, module.id))
            .orderBy(draftModuleContent.orderIndex);

          return {
            ...module,
            content,
          };
        })
      );

      return modulesWithContent;
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

      if (!latestVersion) {
        return [];
      }

      const modulesData = await ctx.db
        .select()
        .from(modules)
        .where(eq(modules.courseVersionId, latestVersion.id))
        .orderBy(modules.position);

      // Fetch content for each module
      const modulesWithContent = await Promise.all(
        modulesData.map(async (module) => {
          const content = await ctx.db
            .select()
            .from(moduleContent)
            .where(eq(moduleContent.moduleId, module.id))
            .orderBy(moduleContent.orderIndex);

          return {
            ...module,
            content,
          };
        })
      );

      return modulesWithContent;
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
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

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
            title: item.title,
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
  deleteDraftModule: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return await ctx.db
        .delete(draftModules)
        .where(eq(draftModules.id, input));
    }),
  deleteDraftModuleContent: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return await ctx.db
        .delete(draftModuleContent)
        .where(eq(draftModuleContent.id, input));
    }),

  getDraftModuleById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const [module] = await ctx.db
        .select()
        .from(draftModules)
        .where(eq(draftModules.id, input))
        .limit(1);

      if (!module) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Module not found" });
      }

      const content = await ctx.db
        .select()
        .from(draftModuleContent)
        .where(eq(draftModuleContent.draftModuleId, module.id))
        .orderBy(draftModuleContent.orderIndex);

      return {
        ...module,
        content,
      };
    }),

  updateDraftModule: protectedProcedure
    .input(
      z.object({
        moduleId: z.string(),
        basicInfo: basicInformationSchema,
        content: contentSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        // Update the draft module
        const [updatedModule] = await ctx.db
          .update(draftModules)
          .set({
            title: input.basicInfo.title,
            description: input.basicInfo.description,
          })
          .where(eq(draftModules.id, input.moduleId))
          .returning();

        // Delete existing content items
        await ctx.db
          .delete(draftModuleContent)
          .where(eq(draftModuleContent.draftModuleId, input.moduleId));

        // Insert new content items if they exist
        if (input.content.content && input.content.content.length > 0) {
          const contentItems = input.content.content.map((item, index) => ({
            draftModuleId: input.moduleId,
            type: item.type,
            title: item.title,
            content: item.content,
            orderIndex: index,
          }));

          await ctx.db.insert(draftModuleContent).values(contentItems);
        }

        return updatedModule;
      } catch (error) {
        throw new Error(
          `Failed to update draft module: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),
  updateDraftModulePositions: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        items: z
          .array(
            z.object({
              id: z.string(),
              position: z.number().int().nonnegative(),
            })
          )
          .min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Validate all ids belong to the course
      const ids = input.items.map((i) => i.id);
      const rows = await ctx.db
        .select({ id: draftModules.id })
        .from(draftModules)
        .where(
          and(
            eq(draftModules.courseId, input.courseId),
            inArray(draftModules.id, ids)
          )
        );

      const validIds = new Set(rows.map((r) => r.id));
      const hasInvalid = ids.some((id) => !validIds.has(id));
      if (hasInvalid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more modules do not belong to the course",
        });
      }

      // Neon HTTP driver does not support transactions. Perform validated batch updates.
      for (const item of input.items) {
        await ctx.db
          .update(draftModules)
          .set({ position: item.position })
          .where(eq(draftModules.id, item.id));
      }

      return { success: true } as const;
    }),
  updateModulePositions: protectedProcedure
    .input(
      z.object({
        courseVersionId: z.string(),
        items: z
          .array(
            z.object({
              id: z.string(),
              position: z.number().int().nonnegative(),
            })
          )
          .min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const ids = input.items.map((i) => i.id);
      const rows = await ctx.db
        .select({ id: modules.id })
        .from(modules)
        .where(
          and(
            eq(modules.courseVersionId, input.courseVersionId),
            inArray(modules.id, ids)
          )
        );

      const validIds = new Set(rows.map((r) => r.id));
      const hasInvalid = ids.some((id) => !validIds.has(id));
      if (hasInvalid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more modules do not belong to the course version",
        });
      }

      // Neon HTTP driver does not support transactions. Perform validated batch updates.
      for (const item of input.items) {
        await ctx.db
          .update(modules)
          .set({ position: item.position })
          .where(eq(modules.id, item.id));
      }

      return { success: true } as const;
    }),
});
