import type { NeonQueryFunction } from "@neondatabase/serverless";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, inArray, max } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
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

type DatabaseContext = {
  db: NeonHttpDatabase<typeof import("@/db/schema")> & {
    // biome-ignore lint/suspicious/noExplicitAny: Have to
    $client: NeonQueryFunction<any, any>;
  };
};

// Helper functions for publish functionality
async function validateCourseAndDrafts(ctx: DatabaseContext, courseId: string) {
  const courseDataResult = await ctx.db
    .select()
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1);
  const [courseData] = courseDataResult;

  if (!courseData) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
  }
}

async function getDraftModules(ctx: DatabaseContext, courseId: string) {
  const draftModulesData = await ctx.db
    .select()
    .from(draftModules)
    .where(eq(draftModules.courseId, courseId))
    .orderBy(draftModules.position);

  if (draftModulesData.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No draft modules to publish",
    });
  }

  return draftModulesData;
}

async function fixModulePositions(
  ctx: DatabaseContext,
  _courseId: string,
  draftModulesData: Array<{ id: string; position: number }>
) {
  // Sort modules by current position and reassign sequential positions
  const sortedModules = draftModulesData.sort(
    (a, b) => a.position - b.position
  );

  for (let i = 0; i < sortedModules.length; i++) {
    const newPosition = i + 1;
    if (sortedModules[i].position !== newPosition) {
      await ctx.db
        .update(draftModules)
        .set({ position: newPosition })
        .where(eq(draftModules.id, sortedModules[i].id));
    }
  }
}

function validateModulePositions(
  draftModulesData: Array<{ position: number }>
) {
  const positions = draftModulesData
    .map((m) => m.position)
    .sort((a, b) => a - b);
  for (let i = 0; i < positions.length; i++) {
    if (positions[i] !== i + 1) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Module positions must be sequential starting from 1",
      });
    }
  }
}

async function getNextVersionNumber(ctx: DatabaseContext, courseId: string) {
  const versionResultArray = await ctx.db
    .select({ maxVersion: max(courseVersion.versionNumber) })
    .from(courseVersion)
    .where(eq(courseVersion.courseId, courseId));
  const [versionResult] = versionResultArray;

  return (versionResult?.maxVersion ?? 0) + 1;
}

async function createCourseVersion(
  ctx: DatabaseContext,
  input: { courseId: string; changeLog?: string },
  nextVersionNumber: number
) {
  const [newCourseVersion] = await ctx.db
    .insert(courseVersion)
    .values({
      courseId: input.courseId,
      versionNumber: nextVersionNumber,
      changeLog: input.changeLog ?? `Published version ${nextVersionNumber}`,
    })
    .returning();

  return newCourseVersion;
}

async function publishModules(
  ctx: DatabaseContext,
  draftModulesData: Array<{
    id: string;
    title: string;
    description: string;
    position: number;
  }>,
  courseVersionId: string
) {
  for (const draftModule of draftModulesData) {
    const [publishedModule] = await ctx.db
      .insert(modules)
      .values({
        courseVersionId,
        title: draftModule.title,
        description: draftModule.description,
        position: draftModule.position,
      })
      .returning();

    await publishModuleContent(ctx, draftModule.id, publishedModule.id);
  }
}

async function publishModuleContent(
  ctx: DatabaseContext,
  draftModuleId: string,
  publishedModuleId: string
) {
  const draftContent = await ctx.db
    .select()
    .from(draftModuleContent)
    .where(eq(draftModuleContent.draftModuleId, draftModuleId))
    .orderBy(draftModuleContent.orderIndex);

  if (draftContent.length > 0) {
    const publishedContent = draftContent.map((content, index) => ({
      moduleId: publishedModuleId,
      type: content.type,
      title: content.title,
      content: content.content,
      metadata: content.metadata,
      orderIndex: content.orderIndex,
      position: index + 1,
    }));

    await ctx.db.insert(moduleContent).values(publishedContent);
  }
}

async function updateCourseStatus(ctx: DatabaseContext, courseId: string) {
  await ctx.db
    .update(course)
    .set({ status: "published" })
    .where(eq(course.id, courseId));
}

async function reseedDrafts(
  ctx: DatabaseContext,
  courseId: string,
  courseVersionId: string
) {
  // Clear existing drafts
  const draftModulesData = await ctx.db
    .select()
    .from(draftModules)
    .where(eq(draftModules.courseId, courseId));

  if (draftModulesData.length > 0) {
    await ctx.db.delete(draftModuleContent).where(
      inArray(
        draftModuleContent.draftModuleId,
        draftModulesData.map((m) => m.id)
      )
    );

    await ctx.db
      .delete(draftModules)
      .where(eq(draftModules.courseId, courseId));
  }

  // Reseed from published modules
  const publishedModules = await ctx.db
    .select()
    .from(modules)
    .where(eq(modules.courseVersionId, courseVersionId))
    .orderBy(modules.position);

  for (const publishedModule of publishedModules) {
    const [newDraftModule] = await ctx.db
      .insert(draftModules)
      .values({
        courseId,
        title: publishedModule.title,
        description: publishedModule.description,
        position: publishedModule.position,
      })
      .returning();

    await reseedModuleContent(ctx, publishedModule.id, newDraftModule.id);
  }
}

async function reseedModuleContent(
  ctx: DatabaseContext,
  publishedModuleId: string,
  draftModuleId: string
) {
  const publishedContent = await ctx.db
    .select()
    .from(moduleContent)
    .where(eq(moduleContent.moduleId, publishedModuleId))
    .orderBy(moduleContent.orderIndex);

  if (publishedContent.length > 0) {
    const draftContent = publishedContent.map((content) => ({
      draftModuleId,
      type: content.type,
      title: content.title,
      content: content.content,
      metadata: content.metadata,
      orderIndex: content.orderIndex,
    }));

    await ctx.db.insert(draftModuleContent).values(draftContent);
  }
}

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

  publishDraftModules: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        changeLog: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        await validateCourseAndDrafts(ctx, input.courseId);
        const draftModulesData = await getDraftModules(ctx, input.courseId);

        // Fix positions to ensure they are sequential starting from 1
        await fixModulePositions(ctx, input.courseId, draftModulesData);

        // Get updated data after fixing positions
        const updatedDraftModulesData = await getDraftModules(
          ctx,
          input.courseId
        );
        validateModulePositions(updatedDraftModulesData);

        const nextVersionNumber = await getNextVersionNumber(
          ctx,
          input.courseId
        );
        const newCourseVersion = await createCourseVersion(
          ctx,
          input,
          nextVersionNumber
        );

        await publishModules(ctx, updatedDraftModulesData, newCourseVersion.id);
        await updateCourseStatus(ctx, input.courseId);
        await reseedDrafts(ctx, input.courseId, newCourseVersion.id);

        return {
          courseVersionId: newCourseVersion.id,
          versionNumber: nextVersionNumber,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to publish modules: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        });
      }
    }),
});
