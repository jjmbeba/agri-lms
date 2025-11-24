import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

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

