import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { restrictRoles } from "./auth";
import {
  generateDraftModuleContentSlug,
  generateDraftModuleSlug,
  generateModuleContentSlug,
  generateModuleSlug,
} from "./utils/slug";

// -----------------------------
// Validators
// -----------------------------
const basicInformationValidator = v.object({
  title: v.string(),
  description: v.string(),
  priceShillings: v.number(),
});

// Constants
const DEFAULT_MAX_SCORE = 100;
const DEFAULT_SUBMISSION_TYPE = "file" as const;

const contentItemValidator = v.object({
  type: v.string(),
  title: v.string(),
  content: v.string(),
  metadata: v.optional(v.any()),
  // Assignment-specific fields (optional)
  dueDate: v.optional(v.string()),
  maxScore: v.optional(v.number()),
  submissionType: v.optional(
    v.union(v.literal("file"), v.literal("text"), v.literal("url"))
  ),
});

const contentValidator = v.object({
  content: v.optional(v.array(contentItemValidator)),
});

// -----------------------------
// Helpers
// -----------------------------
const MAX_DEBUG_COURSES = 5;

async function validateCourseExists(ctx: MutationCtx, courseId: Id<"course">) {
  if (!courseId) {
    throw new ConvexError("Course ID is required");
  }

  const course = await ctx.db.get(courseId);
  if (!course) {
    // Verify the ID format and check if any courses exist
    const allCourses = await ctx.db.query("course").take(MAX_DEBUG_COURSES);
    const courseIds = allCourses.map((c) => c._id);
    throw new ConvexError(
      `Course not found with ID: ${courseId}. Available course IDs: ${courseIds.join(", ")}`
    );
  }
  return course;
}

async function getDraftModules(ctx: MutationCtx, courseId: Id<"course">) {
  const drafts = await ctx.db
    .query("draftModule")
    .filter((q) => q.eq(q.field("courseId"), courseId))
    .collect();
  drafts.sort((a, b) => a.position - b.position);
  if (drafts.length === 0) {
    throw new Error("No draft modules to publish");
  }
  return drafts;
}

async function fixModulePositions(
  ctx: MutationCtx,
  draftModulesData: Pick<Doc<"draftModule">, "_id" | "position">[]
) {
  const sorted = [...draftModulesData].sort((a, b) => a.position - b.position);
  for (let i = 0; i < sorted.length; i++) {
    const newPosition = i + 1;
    if (sorted[i].position !== newPosition) {
      await ctx.db.patch(sorted[i]._id, { position: newPosition });
    }
  }
}

async function userHasCourseEnrollment(
  ctx: QueryCtx,
  courseId: Id<"course">,
  userId: string
) {
  const enrollment = await ctx.db
    .query("enrollment")
    .filter((q) =>
      q.and(
        q.eq(q.field("courseId"), courseId),
        q.eq(q.field("userId"), userId)
      )
    )
    .first();
  return Boolean(enrollment);
}

async function getModuleAccessSet(
  ctx: QueryCtx,
  courseId: Id<"course">,
  userId: string
) {
  const rows = await ctx.db
    .query("moduleAccess")
    .withIndex("user_course", (q) =>
      q.eq("userId", userId).eq("courseId", courseId)
    )
    .collect();

  return new Set(rows.map((row) => row.moduleId));
}

async function userHasModuleAccess(
  ctx: QueryCtx,
  moduleId: Id<"module">,
  userId: string
) {
  const access = await ctx.db
    .query("moduleAccess")
    .withIndex("user_module", (q) =>
      q.eq("userId", userId).eq("moduleId", moduleId)
    )
    .first();
  return Boolean(access);
}

function validateModulePositions(
  draftModulesData: Array<{ position: number }>
) {
  const positions = draftModulesData
    .map((m) => m.position)
    .sort((a, b) => a - b);
  for (let i = 0; i < positions.length; i++) {
    if (positions[i] !== i + 1) {
      throw new Error("Module positions must be sequential starting from 1");
    }
  }
}

async function getNextVersionNumber(ctx: MutationCtx, courseId: Id<"course">) {
  const versions = await ctx.db
    .query("courseVersion")
    .filter((q) => q.eq(q.field("courseId"), courseId))
    .collect();
  const maxVersion = versions.reduce(
    (max: number, version: Doc<"courseVersion">) =>
      version.versionNumber > max ? version.versionNumber : max,
    0
  );
  return maxVersion + 1;
}

async function publishModuleContent(
  ctx: MutationCtx,
  draftModuleId: Id<"draftModule">,
  publishedModuleId: Id<"module">
) {
  const draftContent = await ctx.db
    .query("draftModuleContent")
    .filter((q) => q.eq(q.field("draftModuleId"), draftModuleId))
    .collect();
  draftContent.sort((a, b) => a.orderIndex - b.orderIndex);

  for (let i = 0; i < draftContent.length; i++) {
    const item = draftContent[i];

    const slug = await generateModuleContentSlug(
      ctx,
      item.title,
      publishedModuleId
    );

    if (item.type === "assignment") {
      const moduleContentId = await ctx.db.insert("moduleContent", {
        moduleId: publishedModuleId,
        type: item.type,
        title: item.title,
        slug,
        content: item.content,
        orderIndex: item.orderIndex,
        position: i + 1,
      });

      // Get the corresponding draftAssignment
      const draftAssignment = await ctx.db
        .query("draftAssignment")
        .filter((q) => q.eq(q.field("draftModuleContentId"), item._id))
        .first();

      if (draftAssignment) {
        await ctx.db.insert("assignment", {
          moduleContentId,
          instructions: draftAssignment.instructions,
          maxScore: draftAssignment.maxScore,
          submissionType: draftAssignment.submissionType,
          dueDate: draftAssignment.dueDate,
        });
      }
    } else {
      await ctx.db.insert("moduleContent", {
        moduleId: publishedModuleId,
        type: item.type,
        title: item.title,
        slug,
        content: item.content,
        orderIndex: item.orderIndex,
        position: i + 1,
      });
    }
  }
}

async function publishModules(
  ctx: MutationCtx,
  draftModulesData: Doc<"draftModule">[],
  courseVersionId: Id<"courseVersion">
) {
  for (const draftModule of draftModulesData) {
    const slug = await generateModuleSlug(
      ctx,
      draftModule.title,
      courseVersionId
    );
    const moduleId = await ctx.db.insert("module", {
      courseVersionId,
      title: draftModule.title,
      slug,
      description: draftModule.description,
      position: draftModule.position,
      priceShillings: draftModule.priceShillings,
    });

    await publishModuleContent(ctx, draftModule._id, moduleId);
  }
}

async function reseedModuleContent(
  ctx: MutationCtx,
  publishedModuleId: Id<"module">,
  draftModuleId: Id<"draftModule">
) {
  const publishedContent = await ctx.db
    .query("moduleContent")
    .filter((q) => q.eq(q.field("moduleId"), publishedModuleId))
    .collect();
  publishedContent.sort((a, b) => a.orderIndex - b.orderIndex);

  for (const c of publishedContent) {
    const slug = await generateDraftModuleContentSlug(
      ctx,
      c.title,
      draftModuleId
    );

    if (c.type === "assignment") {
      const draftModuleContentId = await ctx.db.insert("draftModuleContent", {
        draftModuleId,
        type: c.type,
        title: c.title,
        slug,
        content: c.content,
        orderIndex: c.orderIndex,
        position: c.position,
      });

      // Get the corresponding published assignment
      const publishedAssignment = await ctx.db
        .query("assignment")
        .filter((q) => q.eq(q.field("moduleContentId"), c._id))
        .first();

      if (publishedAssignment) {
        await ctx.db.insert("draftAssignment", {
          draftModuleContentId,
          instructions: publishedAssignment.instructions,
          maxScore: publishedAssignment.maxScore,
          submissionType: publishedAssignment.submissionType,
          dueDate: publishedAssignment.dueDate,
        });
      }
    } else {
      await ctx.db.insert("draftModuleContent", {
        draftModuleId,
        type: c.type,
        title: c.title,
        slug,
        content: c.content,
        orderIndex: c.orderIndex,
        position: c.position,
      });
    }
  }
}

async function reseedDrafts(
  ctx: MutationCtx,
  courseId: Id<"course">,
  courseVersionId: Id<"courseVersion">
) {
  const existingDrafts = await ctx.db
    .query("draftModule")
    .filter((q) => q.eq(q.field("courseId"), courseId))
    .collect();
  for (const d of existingDrafts) {
    const contents = await ctx.db
      .query("draftModuleContent")
      .filter((q) => q.eq(q.field("draftModuleId"), d._id))
      .collect();
    for (const c of contents) {
      await ctx.db.delete(c._id);
    }
    await ctx.db.delete(d._id);
  }

  const publishedModules = await ctx.db
    .query("module")
    .filter((q) => q.eq(q.field("courseVersionId"), courseVersionId))
    .collect();
  publishedModules.sort((a, b) => a.position - b.position);

  for (const pm of publishedModules) {
    const slug = await generateDraftModuleSlug(ctx, pm.title, courseId);
    const newDraftModuleId = await ctx.db.insert("draftModule", {
      courseId,
      title: pm.title,
      slug,
      description: pm.description,
      position: pm.position,
      priceShillings: pm.priceShillings,
    });
    await reseedModuleContent(ctx, pm._id, newDraftModuleId);
  }
}

// -----------------------------
// Queries
// -----------------------------
export const getModuleWithContentById = query({
  args: { id: v.id("module") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const m = await ctx.db.get(args.id);
    if (!m) {
      return null;
    }

    const courseVersion = await ctx.db.get(m.courseVersionId);
    if (!courseVersion) {
      return null;
    }

    const hasCourseAccess = await userHasCourseEnrollment(
      ctx,
      courseVersion.courseId,
      identity.subject
    );
    let canViewModule = hasCourseAccess;
    if (!canViewModule) {
      canViewModule = await userHasModuleAccess(ctx, args.id, identity.subject);
    }

    if (!canViewModule) {
      return null;
    }

    const content = await ctx.db
      .query("moduleContent")
      .filter((q) => q.eq(q.field("moduleId"), args.id))
      .collect();
    content.sort((a, b) => a.orderIndex - b.orderIndex);

    // Batch fetch all assignments for assignment content items
    const assignmentContentIds = content
      .filter((item) => item.type === "assignment")
      .map((item) => item._id);

    const assignments =
      assignmentContentIds.length > 0
        ? await ctx.db
            .query("assignment")
            .filter((q) =>
              q.or(
                ...assignmentContentIds.map((id) =>
                  q.eq(q.field("moduleContentId"), id)
                )
              )
            )
            .collect()
        : [];

    const assignmentMap = new Map(
      assignments.map((assignment) => [assignment.moduleContentId, assignment])
    );

    const contentWithAssignments = content.map((item) => {
      if (item.type === "assignment") {
        const assignment = assignmentMap.get(item._id);
        if (!assignment) {
          throw new Error(
            `Assignment not found for module content ${item._id}`
          );
        }

        return {
          ...item,
          assignmentId: assignment._id,
          dueDate: assignment.dueDate,
          maxScore: assignment.maxScore,
          submissionType: assignment.submissionType,
          instructions: assignment.instructions,
        };
      }
      return item;
    });

    return { ...m, content: contentWithAssignments } as const;
  },
});

export const getModuleBySlug = query({
  args: {
    courseSlug: v.string(),
    moduleSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    // First, get the course by slug
    const course = await ctx.db
      .query("course")
      .withIndex("slug", (q) => q.eq("slug", args.courseSlug))
      .first();

    if (!course) {
      return null;
    }

    // Get the latest course version
    const versions = await ctx.db
      .query("courseVersion")
      .filter((q) => q.eq(q.field("courseId"), course._id))
      .collect();

    if (versions.length === 0) {
      return null;
    }

    versions.sort((a, b) => b.versionNumber - a.versionNumber);
    const latestVersion = versions[0];

    // Find module by slug within this course version
    const module = await ctx.db
      .query("module")
      .withIndex("slug", (q) => q.eq("slug", args.moduleSlug))
      .filter((q) => q.eq(q.field("courseVersionId"), latestVersion._id))
      .first();

    if (!module) {
      return null;
    }

    // Check access if identity is available
    // If no identity, still return module data - client will handle access control
    if (identity) {
      const hasCourseAccess = await userHasCourseEnrollment(
        ctx,
        course._id,
        identity.subject
      );
      let canViewModule = hasCourseAccess;
      if (!canViewModule) {
        canViewModule = await userHasModuleAccess(
          ctx,
          module._id,
          identity.subject
        );
      }

      if (!canViewModule) {
        return null;
      }
    }

    // Get module content
    const content = await ctx.db
      .query("moduleContent")
      .filter((q) => q.eq(q.field("moduleId"), module._id))
      .collect();
    content.sort((a, b) => a.orderIndex - b.orderIndex);

    // Batch fetch all assignments for assignment content items
    const assignmentContentIds = content
      .filter((item) => item.type === "assignment")
      .map((item) => item._id);

    const assignments =
      assignmentContentIds.length > 0
        ? await ctx.db
            .query("assignment")
            .filter((q) =>
              q.or(
                ...assignmentContentIds.map((id) =>
                  q.eq(q.field("moduleContentId"), id)
                )
              )
            )
            .collect()
        : [];

    const assignmentMap = new Map(
      assignments.map((assignment) => [assignment.moduleContentId, assignment])
    );

    const contentWithAssignments = content.map((item) => {
      if (item.type === "assignment") {
        const assignment = assignmentMap.get(item._id);
        if (!assignment) {
          throw new Error(
            `Assignment not found for module content ${item._id}`
          );
        }

        return {
          ...item,
          assignmentId: assignment._id,
          dueDate: assignment.dueDate,
          maxScore: assignment.maxScore,
          submissionType: assignment.submissionType,
          instructions: assignment.instructions,
        };
      }
      return item;
    });

    return { ...module, content: contentWithAssignments } as const;
  },
});

// Helper function to check module content access
const checkModuleContentAccess = async (
  ctx: QueryCtx,
  identity: Awaited<ReturnType<typeof ctx.auth.getUserIdentity>>,
  courseId: Id<"course">,
  moduleId: Id<"module">
): Promise<boolean> => {
  if (!identity) {
    return true;
  }

  const hasCourseAccess = await userHasCourseEnrollment(
    ctx,
    courseId,
    identity.subject
  );

  if (hasCourseAccess) {
    return true;
  }

  return userHasModuleAccess(ctx, moduleId, identity.subject);
};

// Helper function to get navigation slugs
const getContentNavigationSlugs = (
  allContent: Doc<"moduleContent">[],
  currentContentId: Id<"moduleContent">
) => {
  allContent.sort((a, b) => a.orderIndex - b.orderIndex);

  const currentIndex = allContent.findIndex(
    (item) => item._id === currentContentId
  );

  const previousContent =
    currentIndex > 0 ? allContent[currentIndex - 1] : null;
  const nextContent =
    currentIndex < allContent.length - 1 ? allContent[currentIndex + 1] : null;

  return {
    previousContentSlug: previousContent?.slug ?? null,
    nextContentSlug: nextContent?.slug ?? null,
  };
};

// Helper function to enrich content with assignment details
const enrichContentWithAssignment = async (
  ctx: QueryCtx,
  moduleContent: Doc<"moduleContent">
) => {
  if (moduleContent.type !== "assignment") {
    return moduleContent;
  }

  const assignment = await ctx.db
    .query("assignment")
    .filter((q) => q.eq(q.field("moduleContentId"), moduleContent._id))
    .first();

  if (!assignment) {
    throw new Error(
      `Assignment not found for module content ${moduleContent._id}`
    );
  }

  return {
    ...moduleContent,
    assignmentId: assignment._id,
    dueDate: assignment.dueDate,
    maxScore: assignment.maxScore,
    submissionType: assignment.submissionType,
    instructions: assignment.instructions,
  };
};

export const getModuleContentBySlug = query({
  args: {
    courseSlug: v.string(),
    moduleSlug: v.string(),
    contentSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    // Get course by slug
    const course = await ctx.db
      .query("course")
      .withIndex("slug", (q) => q.eq("slug", args.courseSlug))
      .first();

    if (!course) {
      return null;
    }

    // Get the latest course version
    const versions = await ctx.db
      .query("courseVersion")
      .filter((q) => q.eq(q.field("courseId"), course._id))
      .collect();

    if (versions.length === 0) {
      return null;
    }

    versions.sort((a, b) => b.versionNumber - a.versionNumber);
    const latestVersion = versions[0];

    // Find module by slug
    const module = await ctx.db
      .query("module")
      .withIndex("slug", (q) => q.eq("slug", args.moduleSlug))
      .filter((q) => q.eq(q.field("courseVersionId"), latestVersion._id))
      .first();

    if (!module) {
      return null;
    }

    // Check access
    const hasAccess = await checkModuleContentAccess(
      ctx,
      identity,
      course._id,
      module._id
    );

    if (!hasAccess) {
      return null;
    }

    // Find moduleContent by slug
    const moduleContent = await ctx.db
      .query("moduleContent")
      .withIndex("module_slug", (q) =>
        q.eq("moduleId", module._id).eq("slug", args.contentSlug)
      )
      .first();

    if (!moduleContent) {
      return null;
    }

    // Get navigation content
    const allContent = await ctx.db
      .query("moduleContent")
      .filter((q) => q.eq(q.field("moduleId"), module._id))
      .collect();

    const { previousContentSlug, nextContentSlug } = getContentNavigationSlugs(
      allContent,
      moduleContent._id
    );

    // Enrich with assignment details if needed
    const enrichedContent = await enrichContentWithAssignment(
      ctx,
      moduleContent
    );

    return {
      module,
      course,
      content: enrichedContent,
      previousContentSlug,
      nextContentSlug,
      courseSlug: args.courseSlug,
      moduleSlug: args.moduleSlug,
    } as const;
  },
});

export const getModuleNavigation = query({
  args: { moduleId: v.id("module") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { previousModuleId: null, nextModuleId: null };
    }

    const currentModule = await ctx.db.get(args.moduleId);
    if (!currentModule) {
      return { previousModuleId: null, nextModuleId: null };
    }

    const courseVersion = await ctx.db.get(currentModule.courseVersionId);
    if (!courseVersion) {
      return { previousModuleId: null, nextModuleId: null };
    }

    // Get all modules in the same course version
    let candidateModules = await ctx.db
      .query("module")
      .filter((q) =>
        q.eq(q.field("courseVersionId"), currentModule.courseVersionId)
      )
      .collect();

    const hasCourseAccess = await userHasCourseEnrollment(
      ctx,
      courseVersion.courseId,
      identity.subject
    );
    if (!hasCourseAccess) {
      const accessibleSet = await getModuleAccessSet(
        ctx,
        courseVersion.courseId,
        identity.subject
      );
      if (!accessibleSet.has(currentModule._id)) {
        return { previousModuleId: null, nextModuleId: null };
      }
      candidateModules = candidateModules.filter((module) =>
        accessibleSet.has(module._id)
      );
    }

    // Sort by position
    candidateModules.sort((a, b) => a.position - b.position);

    const currentIndex = candidateModules.findIndex(
      (module) => module._id === args.moduleId
    );

    if (currentIndex === -1) {
      return { previousModuleId: null, nextModuleId: null };
    }

    const previousModule =
      currentIndex > 0 ? candidateModules[currentIndex - 1] : null;
    const nextModule =
      currentIndex < candidateModules.length - 1
        ? candidateModules[currentIndex + 1]
        : null;

    // Get course slug for navigation
    const course = await ctx.db.get(courseVersion.courseId);
    const courseSlug = course?.slug ?? null;

    const result = {
      previousModuleId: previousModule?._id ?? null,
      nextModuleId: nextModule?._id ?? null,
      previousModuleSlug: previousModule?.slug ?? null,
      nextModuleSlug: nextModule?.slug ?? null,
      courseSlug,
    };

    return result;
  },
});
export const getDraftModulesByCourseId = query({
  args: { courseId: v.id("course") },
  handler: async (ctx, args) => {
    const drafts = await ctx.db
      .query("draftModule")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .collect();
    drafts.sort((a, b) => a.position - b.position);

    const modulesWithContent = await Promise.all(
      drafts.map(async (m) => {
        const content = await ctx.db
          .query("draftModuleContent")
          .filter((q) => q.eq(q.field("draftModuleId"), m._id))
          .collect();
        content.sort((a, b) => a.orderIndex - b.orderIndex);

        // Batch fetch all draft assignments for assignment content items
        const assignmentContentIds = content
          .filter((item) => item.type === "assignment")
          .map((item) => item._id);

        const draftAssignments =
          assignmentContentIds.length > 0
            ? await ctx.db
                .query("draftAssignment")
                .filter((q) =>
                  q.or(
                    ...assignmentContentIds.map((id) =>
                      q.eq(q.field("draftModuleContentId"), id)
                    )
                  )
                )
                .collect()
            : [];

        // Create a map of draftModuleContentId to draft assignment for quick lookup
        const assignmentMap = new Map(
          draftAssignments.map((assignment) => [
            assignment.draftModuleContentId,
            assignment,
          ])
        );

        // Merge assignment data with content items
        const contentWithAssignments = content.map((item) => {
          if (item.type === "assignment") {
            const assignment = assignmentMap.get(item._id);
            if (!assignment) {
              throw new Error(
                `Draft assignment not found for module content ${item._id}`
              );
            }

            return {
              ...item,
              dueDate: assignment.dueDate,
              maxScore: assignment.maxScore,
              submissionType: assignment.submissionType,
            };
          }
          return item;
        });

        return { ...m, content: contentWithAssignments };
      })
    );

    return modulesWithContent;
  },
});

export const getModulesByLatestVersionId = query({
  args: { courseId: v.id("course") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const unlockedModuleIdsArray: Id<"module">[] = [];
    let hasCourseAccess = false;
    const hasIdentity = identity !== null;

    if (identity) {
      hasCourseAccess = await userHasCourseEnrollment(
        ctx,
        args.courseId,
        identity.subject
      );
      if (!hasCourseAccess) {
        const moduleSet = await getModuleAccessSet(
          ctx,
          args.courseId,
          identity.subject
        );
        for (const moduleId of moduleSet) {
          unlockedModuleIdsArray.push(moduleId);
        }
      }
    }

    const versions = await ctx.db
      .query("courseVersion")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .collect();
    if (versions.length === 0) {
      return [] as const;
    }
    versions.sort((a, b) => b.versionNumber - a.versionNumber);
    const latest = versions[0];

    const modules = await ctx.db
      .query("module")
      .filter((q) => q.eq(q.field("courseVersionId"), latest._id))
      .collect();
    modules.sort((a, b) => a.position - b.position);

    const modulesWithContent = await Promise.all(
      modules.map(async (m) => {
        const content = await ctx.db
          .query("moduleContent")
          .filter((q) => q.eq(q.field("moduleId"), m._id))
          .collect();
        content.sort((a, b) => a.orderIndex - b.orderIndex);

        // Batch fetch all assignments for assignment content items
        const assignmentContentIds = content
          .filter((item) => item.type === "assignment")
          .map((item) => item._id);

        const assignments =
          assignmentContentIds.length > 0
            ? await ctx.db
                .query("assignment")
                .filter((q) =>
                  q.or(
                    ...assignmentContentIds.map((id) =>
                      q.eq(q.field("moduleContentId"), id)
                    )
                  )
                )
                .collect()
            : [];

        // Create a map of moduleContentId to assignment for quick lookup
        const assignmentMap = new Map(
          assignments.map((assignment) => [
            assignment.moduleContentId,
            assignment,
          ])
        );

        // Merge assignment data with content items
        const contentWithAssignments = content.map((item) => {
          if (item.type === "assignment") {
            const assignment = assignmentMap.get(item._id);
            if (!assignment) {
              throw new Error(
                `Assignment not found for module content ${item._id}`
              );
            }

            return {
              ...item,
              assignmentId: assignment._id,
              dueDate: assignment.dueDate,
              maxScore: assignment.maxScore,
              submissionType: assignment.submissionType,
              instructions: assignment.instructions,
            };
          }
          return item;
        });

        const lessonCount = contentWithAssignments.length;
        // Check if module is accessible: either has course access or module is unlocked
        // Note: TypeScript's control flow analysis may not track array mutations,
        // but the runtime behavior is correct
        const moduleInUnlockedList = unlockedModuleIdsArray.some(
          (id) => id === m._id
        );
        const isAccessible =
          // biome-ignore lint/nursery/noUnnecessaryConditions: Works well
          hasCourseAccess || (hasIdentity && moduleInUnlockedList);

        return {
          ...m,
          content: isAccessible ? contentWithAssignments : [],
          isAccessible,
          lessonCount,
        };
      })
    );
    return modulesWithContent;
  },
});

// -----------------------------
// Mutations
// -----------------------------
export const createDraftModule = mutation({
  args: {
    basicInfo: basicInformationValidator,
    content: contentValidator,
    courseId: v.id("course"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    // Verify course exists before proceeding
    const course = await validateCourseExists(ctx, args.courseId);
    if (course.status === "coming-soon") {
      throw new ConvexError(
        "Cannot add draft modules to a course with 'coming-soon' status. Please change the course status first."
      );
    }

    const existing = await ctx.db
      .query("draftModule")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .collect();
    const position = existing.length + 1;

    const slug = await generateDraftModuleSlug(
      ctx,
      args.basicInfo.title,
      args.courseId
    );

    const draftModuleId = await ctx.db.insert("draftModule", {
      title: args.basicInfo.title,
      slug,
      description: args.basicInfo.description,
      priceShillings: args.basicInfo.priceShillings,
      courseId: args.courseId,
      position,
    });

    const items = args.content.content ?? [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      const contentSlug = await generateDraftModuleContentSlug(
        ctx,
        item.title,
        draftModuleId
      );

      if (item.type === "assignment") {
        const draftModuleContentId = await ctx.db.insert("draftModuleContent", {
          draftModuleId,
          type: item.type,
          title: item.title,
          slug: contentSlug,
          content: item.content,
          orderIndex: i,
          position: i + 1,
        });

        await ctx.db.insert("draftAssignment", {
          draftModuleContentId,
          instructions: item.content,
          maxScore: item.maxScore ?? DEFAULT_MAX_SCORE,
          submissionType: item.submissionType ?? DEFAULT_SUBMISSION_TYPE,
          dueDate: item.dueDate,
        });
      } else {
        await ctx.db.insert("draftModuleContent", {
          draftModuleId,
          type: item.type,
          title: item.title,
          slug: contentSlug,
          content: item.content,
          orderIndex: i,
          position: i + 1,
        });
      }
    }

    return await ctx.db.get(draftModuleId);
  },
});

export const deleteDraftModule = mutation({
  args: { id: v.id("draftModule") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    const module = await ctx.db.get(args.id);
    if (!module) {
      return { success: false } as const;
    }

    const contents = await ctx.db
      .query("draftModuleContent")
      .filter((q) => q.eq(q.field("draftModuleId"), args.id))
      .collect();
    for (const c of contents) {
      await ctx.db.delete(c._id);
    }
    await ctx.db.delete(args.id);
    return { success: true } as const;
  },
});

export const deleteDraftModuleContent = mutation({
  args: { id: v.id("draftModuleContent") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    const row = await ctx.db.get(args.id);
    if (!row) {
      throw new Error("Content not found");
    }
    const siblings = await ctx.db
      .query("draftModuleContent")
      .filter((q) => q.eq(q.field("draftModuleId"), row.draftModuleId))
      .collect();
    if (siblings.length <= 1) {
      throw new Error(
        "You cannot delete the last content item in a module. Add a new item before deleting."
      );
    }
    await ctx.db.delete(args.id);
    return { success: true } as const;
  },
});

export const getDraftModuleById = query({
  args: { id: v.id("draftModule") },
  handler: async (ctx, args) => {
    const m = await ctx.db.get(args.id);
    if (!m) {
      throw new Error("Module not found");
    }
    const content = await ctx.db
      .query("draftModuleContent")
      .filter((q) => q.eq(q.field("draftModuleId"), args.id))
      .collect();
    content.sort((a, b) => a.orderIndex - b.orderIndex);

    // Batch fetch all draft assignments for assignment content items
    const assignmentContentIds = content
      .filter((item) => item.type === "assignment")
      .map((item) => item._id);

    const draftAssignments =
      assignmentContentIds.length > 0
        ? await ctx.db
            .query("draftAssignment")
            .filter((q) =>
              q.or(
                ...assignmentContentIds.map((id) =>
                  q.eq(q.field("draftModuleContentId"), id)
                )
              )
            )
            .collect()
        : [];

    // Create a map of draftModuleContentId to draft assignment for quick lookup
    const assignmentMap = new Map(
      draftAssignments.map((assignment) => [
        assignment.draftModuleContentId,
        assignment,
      ])
    );

    // Merge assignment data with content items
    const contentWithAssignments = content.map((item) => {
      if (item.type === "assignment") {
        const assignment = assignmentMap.get(item._id);
        if (!assignment) {
          throw new Error(
            `Draft assignment not found for module content ${item._id}`
          );
        }

        return {
          ...item,
          dueDate: assignment.dueDate,
          maxScore: assignment.maxScore,
          submissionType: assignment.submissionType,
        };
      }
      return item;
    });

    return { ...m, content: contentWithAssignments };
  },
});

export const updateDraftModule = mutation({
  args: {
    moduleId: v.id("draftModule"),
    basicInfo: basicInformationValidator,
    content: contentValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    const existingModule = await ctx.db.get(args.moduleId);
    if (!existingModule) {
      throw new Error("Module not found");
    }

    // Generate new slug if title changed
    const slug =
      existingModule.title !== args.basicInfo.title
        ? await generateDraftModuleSlug(
            ctx,
            args.basicInfo.title,
            existingModule.courseId,
            args.moduleId
          )
        : existingModule.slug;

    await ctx.db.patch(args.moduleId, {
      title: args.basicInfo.title,
      slug,
      description: args.basicInfo.description,
      priceShillings: args.basicInfo.priceShillings,
    });

    const oldContent = await ctx.db
      .query("draftModuleContent")
      .filter((q) => q.eq(q.field("draftModuleId"), args.moduleId))
      .collect();

    // Delete existing draftAssignment records for assignment content items
    for (const c of oldContent) {
      if (c.type === "assignment") {
        const existingAssignment = await ctx.db
          .query("draftAssignment")
          .filter((q) => q.eq(q.field("draftModuleContentId"), c._id))
          .first();
        if (existingAssignment) {
          await ctx.db.delete(existingAssignment._id);
        }
      }
      await ctx.db.delete(c._id);
    }

    const items = args.content.content ?? [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      const contentSlug = await generateDraftModuleContentSlug(
        ctx,
        item.title,
        args.moduleId
      );

      if (item.type === "assignment") {
        const draftModuleContentId = await ctx.db.insert("draftModuleContent", {
          draftModuleId: args.moduleId,
          type: item.type,
          title: item.title,
          slug: contentSlug,
          content: item.content,
          orderIndex: i,
          position: i + 1,
        });

        await ctx.db.insert("draftAssignment", {
          draftModuleContentId,
          instructions: item.content,
          maxScore: item.maxScore ?? DEFAULT_MAX_SCORE,
          submissionType: item.submissionType ?? DEFAULT_SUBMISSION_TYPE,
          dueDate: item.dueDate,
        });
      } else {
        await ctx.db.insert("draftModuleContent", {
          draftModuleId: args.moduleId,
          type: item.type,
          title: item.title,
          slug: contentSlug,
          content: item.content,
          orderIndex: i,
          position: i + 1,
        });
      }
    }

    return await ctx.db.get(args.moduleId);
  },
});

export const updateDraftModulePositions = mutation({
  args: {
    courseId: v.id("course"),
    items: v.array(v.object({ id: v.id("draftModule"), position: v.number() })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    const ids = new Set(args.items.map((i) => i.id));
    const rows = await ctx.db
      .query("draftModule")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .collect();
    const validIds = new Set(rows.map((r) => r._id));
    for (const id of ids) {
      if (!validIds.has(id)) {
        throw new Error("One or more modules do not belong to the course");
      }
    }

    for (const item of args.items) {
      await ctx.db.patch(item.id, { position: item.position });
    }
    return { success: true } as const;
  },
});

export const updateModulePositions = mutation({
  args: {
    courseVersionId: v.id("courseVersion"),
    items: v.array(v.object({ id: v.id("module"), position: v.number() })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    const ids = new Set(args.items.map((i) => i.id));
    const rows = await ctx.db
      .query("module")
      .filter((q) => q.eq(q.field("courseVersionId"), args.courseVersionId))
      .collect();
    const validIds = new Set(rows.map((r) => r._id));
    for (const id of ids) {
      if (!validIds.has(id)) {
        throw new Error(
          "One or more modules do not belong to the course version"
        );
      }
    }

    for (const item of args.items) {
      await ctx.db.patch(item.id, { position: item.position });
    }
    return { success: true } as const;
  },
});

export const publishDraftModules = mutation({
  args: {
    courseId: v.id("course"),
    changeLog: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    const courseDoc = await validateCourseExists(ctx, args.courseId);

    const draftModulesData = await getDraftModules(ctx, args.courseId);
    await fixModulePositions(
      ctx,
      draftModulesData.map((m) => ({ _id: m._id, position: m.position }))
    );
    const updatedDraftModulesData = await getDraftModules(ctx, args.courseId);
    validateModulePositions(updatedDraftModulesData);

    const totalModulePrice = updatedDraftModulesData.reduce(
      (sum, module) => sum + module.priceShillings,
      0
    );
    if (totalModulePrice < courseDoc.priceShillings) {
      throw new ConvexError(
        `Cannot publish: module total ${totalModulePrice} KES must be greater than or equal to the course price ${courseDoc.priceShillings} KES.`
      );
    }

    const nextVersionNumber = await getNextVersionNumber(ctx, args.courseId);
    const courseVersionId = await ctx.db.insert("courseVersion", {
      courseId: args.courseId,
      versionNumber: nextVersionNumber,
      changeLog: args.changeLog ?? `Published version ${nextVersionNumber}`,
    });

    await publishModules(ctx, updatedDraftModulesData, courseVersionId);

    await ctx.db.patch(args.courseId, { status: "published" });
    await reseedDrafts(ctx, args.courseId, courseVersionId);

    return { courseVersionId, versionNumber: nextVersionNumber } as const;
  },
});

export const updateDraftModuleContentById = mutation({
  args: {
    contentId: v.id("draftModuleContent"),
    content: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    const existingContent = await ctx.db.get(args.contentId);
    if (!existingContent) {
      throw new Error("Content not found");
    }

    const updates: Partial<{
      content: string;
      title: string;
    }> = {
      content: args.content,
    };

    if (args.title !== undefined) {
      updates.title = args.title;
    }

    await ctx.db.patch(args.contentId, updates);

    return { success: true } as const;
  },
});

export const getDraftModuleContentById = query({
  args: { contentId: v.id("draftModuleContent") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    const content = await ctx.db.get(args.contentId);
    if (!content) {
      return null;
    }

    const draftModule = await ctx.db.get(content.draftModuleId);
    if (!draftModule) {
      return null;
    }

    return {
      ...content,
      draftModule,
    };
  },
});

export const migrateModuleContentSlugs = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    // Migrate published moduleContent
    const allModuleContent = await ctx.db.query("moduleContent").collect();
    let migratedCount = 0;

    for (const content of allModuleContent) {
      // Skip if already has a slug
      if (content.slug) {
        continue;
      }

      const slug = await generateModuleContentSlug(
        ctx,
        content.title,
        content.moduleId
      );

      await ctx.db.patch(content._id, { slug });
      migratedCount++;
    }

    // Migrate draftModuleContent
    const allDraftModuleContent = await ctx.db
      .query("draftModuleContent")
      .collect();
    let draftMigratedCount = 0;

    for (const draftContent of allDraftModuleContent) {
      // Skip if already has a slug
      if (draftContent.slug) {
        continue;
      }

      const slug = await generateDraftModuleContentSlug(
        ctx,
        draftContent.title,
        draftContent.draftModuleId
      );

      await ctx.db.patch(draftContent._id, { slug });
      draftMigratedCount++;
    }

    // Migrate draftModule
    const allDraftModules = await ctx.db.query("draftModule").collect();
    let draftModuleMigratedCount = 0;

    for (const draftModule of allDraftModules) {
      // Skip if already has a slug
      if (draftModule.slug) {
        continue;
      }

      const slug = await generateDraftModuleSlug(
        ctx,
        draftModule.title,
        draftModule.courseId,
        draftModule._id
      );

      await ctx.db.patch(draftModule._id, { slug });
      draftModuleMigratedCount++;
    }

    return {
      success: true,
      migratedModuleContent: migratedCount,
      migratedDraftModuleContent: draftMigratedCount,
      migratedDraftModule: draftModuleMigratedCount,
    } as const;
  },
});
