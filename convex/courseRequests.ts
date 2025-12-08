import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { restrictRoles } from "./auth";

export const submitCourseRequest = mutation({
  args: {
    title: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const title = args.title.trim();
    const reason = args.reason.trim();

    if (!title) {
      throw new ConvexError("Course title is required");
    }

    if (!reason) {
      throw new ConvexError("Reason is required");
    }

    const now = new Date(Date.now()).toISOString();
    const userName = identity.name ?? identity.email ?? "Anonymous";

    await ctx.db.insert("courseRequest", {
      title,
      reason,
      userId: identity.subject,
      userName,
      createdAt: now,
    });

    return { success: true } as const;
  },
});

export const listCourseRequests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    const requests = await ctx.db.query("courseRequest").collect();
    return [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
});

