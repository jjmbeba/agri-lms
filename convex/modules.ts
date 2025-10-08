import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { restrictRoles } from "./auth";

// -----------------------------
// Validators
// -----------------------------
const basicInformationValidator = v.object({
  title: v.string(),
  description: v.string(),
});

const contentItemValidator = v.object({
  type: v.string(),
  title: v.string(),
  content: v.string(),
  metadata: v.optional(v.any()),
});

const contentValidator = v.object({
  content: v.optional(v.array(contentItemValidator)),
});

// -----------------------------
// Helpers
// -----------------------------
async function validateCourseExists(ctx: MutationCtx, courseId: Id<"course">) {
  const course = await ctx.db.get(courseId);
  if (!course) {
    throw new Error("Course not found");
  }
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

    if (item.type === "assignment") {
      const moduleContentId = await ctx.db.insert("moduleContent", {
        moduleId: publishedModuleId,
        type: item.type,
        title: item.title,
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
    const moduleId = await ctx.db.insert("module", {
      courseVersionId,
      title: draftModule.title,
      description: draftModule.description,
      position: draftModule.position,
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
    if (c.type === "assignment") {
      const draftModuleContentId = await ctx.db.insert("draftModuleContent", {
        draftModuleId,
        type: c.type,
        title: c.title,
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
    const newDraftModuleId = await ctx.db.insert("draftModule", {
      courseId,
      title: pm.title,
      description: pm.description,
      position: pm.position,
    });
    await reseedModuleContent(ctx, pm._id, newDraftModuleId);
  }
}

// -----------------------------
// Queries
// -----------------------------
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
        return { ...m, content };
      })
    );

    return modulesWithContent;
  },
});

export const getModulesByLatestVersionId = query({
  args: { courseId: v.id("course") },
  handler: async (ctx, args) => {
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
        return { ...m, content };
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

    await validateCourseExists(ctx, args.courseId);

    const existing = await ctx.db
      .query("draftModule")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .collect();
    const position = existing.length + 1;

    const draftModuleId = await ctx.db.insert("draftModule", {
      title: args.basicInfo.title,
      description: args.basicInfo.description,
      courseId: args.courseId,
      position,
    });

    const items = args.content.content ?? [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type === "assignment") {
        const draftModuleContentId = await ctx.db.insert("draftModuleContent", {
          draftModuleId,
          type: item.type,
          title: item.title,
          content: item.content,
          orderIndex: i,
          position: i + 1,
        });

        await ctx.db.insert("draftAssignment", {
          draftModuleContentId,
          instructions: item.content,
          maxScore: 100,
          submissionType: "file",
          dueDate: new Date().toISOString(),
        });
      } else {
        await ctx.db.insert("draftModuleContent", {
          draftModuleId,
          type: item.type,
          title: item.title,
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
    return { ...m, content };
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

    await ctx.db.patch(args.moduleId, {
      title: args.basicInfo.title,
      description: args.basicInfo.description,
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

      if (item.type === "assignment") {
        const draftModuleContentId = await ctx.db.insert("draftModuleContent", {
          draftModuleId: args.moduleId,
          type: item.type,
          title: item.title,
          content: item.content,
          orderIndex: i,
          position: i + 1,
        });

        await ctx.db.insert("draftAssignment", {
          draftModuleContentId,
          instructions: item.content,
          maxScore: 100,
          submissionType: "file",
          dueDate: new Date().toISOString(),
        });
      } else {
        await ctx.db.insert("draftModuleContent", {
          draftModuleId: args.moduleId,
          type: item.type,
          title: item.title,
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

    await validateCourseExists(ctx, args.courseId);

    const draftModulesData = await getDraftModules(ctx, args.courseId);
    await fixModulePositions(
      ctx,
      draftModulesData.map((m) => ({ _id: m._id, position: m.position }))
    );
    const updatedDraftModulesData = await getDraftModules(ctx, args.courseId);
    validateModulePositions(updatedDraftModulesData);

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
