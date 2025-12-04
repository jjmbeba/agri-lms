import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

const sanitizeTitle = (title: string): string => {
  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (normalized.length > 0) {
    return normalized;
  }
  return "course";
};

const findUniqueSlug = async (
  ctx: MutationCtx,
  base: string,
  suffix: number,
  currentCourseId?: Id<"course">
): Promise<string> => {
  const candidate = suffix === 0 ? base : `${base}-${suffix}`;
  const existing = await ctx.db
    .query("course")
    .filter((q) => q.eq(q.field("slug"), candidate))
    .first();
  if (!existing || existing._id === currentCourseId) {
    return candidate;
  }
  return findUniqueSlug(ctx, base, suffix + 1, currentCourseId);
};

export const generateCourseSlug = async (
  ctx: MutationCtx,
  title: string,
  currentCourseId?: Id<"course">
): Promise<string> => {
  const base = sanitizeTitle(title);
  return findUniqueSlug(ctx, base, 0, currentCourseId);
};

const findUniqueModuleSlug = async (
  ctx: MutationCtx | QueryCtx,
  base: string,
  suffix: number,
  courseVersionId: Id<"courseVersion">,
  currentModuleId?: Id<"module">
): Promise<string> => {
  const candidate = suffix === 0 ? base : `${base}-${suffix}`;
  const existing = await ctx.db
    .query("module")
    .withIndex("slug", (q) => q.eq("slug", candidate))
    .first();
  if (
    !existing ||
    existing._id === currentModuleId ||
    existing.courseVersionId !== courseVersionId
  ) {
    return candidate;
  }
  return findUniqueModuleSlug(
    ctx,
    base,
    suffix + 1,
    courseVersionId,
    currentModuleId
  );
};

export const generateModuleSlug = async (
  ctx: MutationCtx,
  title: string,
  courseVersionId: Id<"courseVersion">,
  currentModuleId?: Id<"module">
): Promise<string> => {
  const base = sanitizeTitle(title);
  return findUniqueModuleSlug(ctx, base, 0, courseVersionId, currentModuleId);
};

const findUniqueModuleContentSlug = async (
  ctx: MutationCtx | QueryCtx,
  base: string,
  suffix: number,
  moduleId: Id<"module">,
  currentModuleContentId?: Id<"moduleContent">
): Promise<string> => {
  const candidate = suffix === 0 ? base : `${base}-${suffix}`;
  const existing = await ctx.db
    .query("moduleContent")
    .withIndex("module_slug", (q) =>
      q.eq("moduleId", moduleId).eq("slug", candidate)
    )
    .first();
  if (
    !existing ||
    existing._id === currentModuleContentId ||
    existing.moduleId !== moduleId
  ) {
    return candidate;
  }
  return findUniqueModuleContentSlug(
    ctx,
    base,
    suffix + 1,
    moduleId,
    currentModuleContentId
  );
};

export const generateModuleContentSlug = async (
  ctx: MutationCtx | QueryCtx,
  title: string,
  moduleId: Id<"module">,
  currentModuleContentId?: Id<"moduleContent">
): Promise<string> => {
  const base = sanitizeTitle(title);
  return findUniqueModuleContentSlug(
    ctx,
    base,
    0,
    moduleId,
    currentModuleContentId
  );
};

const findUniqueDraftModuleContentSlug = async (
  ctx: MutationCtx | QueryCtx,
  base: string,
  suffix: number,
  draftModuleId: Id<"draftModule">,
  currentDraftModuleContentId?: Id<"draftModuleContent">
): Promise<string> => {
  const candidate = suffix === 0 ? base : `${base}-${suffix}`;
  const existing = await ctx.db
    .query("draftModuleContent")
    .filter((q) =>
      q.and(
        q.eq(q.field("draftModuleId"), draftModuleId),
        q.eq(q.field("slug"), candidate)
      )
    )
    .first();
  if (
    !existing ||
    existing._id === currentDraftModuleContentId ||
    existing.draftModuleId !== draftModuleId
  ) {
    return candidate;
  }
  return findUniqueDraftModuleContentSlug(
    ctx,
    base,
    suffix + 1,
    draftModuleId,
    currentDraftModuleContentId
  );
};

export const generateDraftModuleContentSlug = async (
  ctx: MutationCtx | QueryCtx,
  title: string,
  draftModuleId: Id<"draftModule">,
  currentDraftModuleContentId?: Id<"draftModuleContent">
): Promise<string> => {
  const base = sanitizeTitle(title);
  return findUniqueDraftModuleContentSlug(
    ctx,
    base,
    0,
    draftModuleId,
    currentDraftModuleContentId
  );
};

const findUniqueDraftModuleSlug = async (
  ctx: MutationCtx | QueryCtx,
  base: string,
  suffix: number,
  courseId: Id<"course">,
  currentDraftModuleId?: Id<"draftModule">
): Promise<string> => {
  const candidate = suffix === 0 ? base : `${base}-${suffix}`;
  const existing = await ctx.db
    .query("draftModule")
    .withIndex("course_slug", (q) =>
      q.eq("courseId", courseId).eq("slug", candidate)
    )
    .first();
  if (
    !existing ||
    existing._id === currentDraftModuleId ||
    existing.courseId !== courseId
  ) {
    return candidate;
  }
  return findUniqueDraftModuleSlug(
    ctx,
    base,
    suffix + 1,
    courseId,
    currentDraftModuleId
  );
};

export const generateDraftModuleSlug = async (
  ctx: MutationCtx | QueryCtx,
  title: string,
  courseId: Id<"course">,
  currentDraftModuleId?: Id<"draftModule">
): Promise<string> => {
  const base = sanitizeTitle(title);
  return findUniqueDraftModuleSlug(ctx, base, 0, courseId, currentDraftModuleId);
};

