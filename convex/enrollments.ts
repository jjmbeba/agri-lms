import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createEnrollment = mutation({
  args: {
    courseId: v.id("course"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("enrollment", {
      courseId: args.courseId,
      userId: identity.subject,
    });
  },
});
