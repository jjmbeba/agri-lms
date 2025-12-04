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

