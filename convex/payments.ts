import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { type MutationCtx, mutation } from "./_generated/server";
import { ensureCourseEnrollment } from "./enrollments";

async function assertModuleBelongsToCourse(
  ctx: MutationCtx,
  moduleId: Id<"module">,
  courseId: Id<"course">
) {
  const module = await ctx.db.get(moduleId);
  if (!module) {
    throw new Error("Module not found for payment");
  }
  const courseVersion = await ctx.db.get(module.courseVersionId);
  if (!courseVersion || courseVersion.courseId !== courseId) {
    throw new Error("Module does not belong to the provided course");
  }
}

async function grantModuleAccess(
  ctx: MutationCtx,
  params: {
    userId: string;
    courseId: Id<"course">;
    moduleId: Id<"module">;
    transactionId: Id<"transaction">;
  }
) {
  const existingAccess = await ctx.db
    .query("moduleAccess")
    .withIndex("user_module", (q) =>
      q.eq("userId", params.userId).eq("moduleId", params.moduleId)
    )
    .first();

  if (existingAccess) {
    return existingAccess._id;
  }

  return await ctx.db.insert("moduleAccess", {
    userId: params.userId,
    courseId: params.courseId,
    moduleId: params.moduleId,
    transactionId: params.transactionId,
    grantedAt: new Date().toISOString(),
  });
}

export const recordPaystackTransaction = mutation({
  args: {
    reference: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("success"),
      v.literal("failed"),
      v.literal("abandoned")
    ),
    amountShillings: v.number(),
    currency: v.string(),
    userId: v.string(),
    courseId: v.id("course"),
    moduleId: v.optional(v.id("module")),
    accessScope: v.union(v.literal("course"), v.literal("module")),
    metadata: v.optional(v.any()),
    rawEvent: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    if (args.accessScope === "module" && !args.moduleId) {
      throw new Error("moduleId is required when accessScope is module");
    }

    if (args.accessScope === "module" && args.moduleId) {
      await assertModuleBelongsToCourse(ctx, args.moduleId, args.courseId);
    }

    const now = new Date().toISOString();
    const existingTransaction = await ctx.db
      .query("transaction")
      .withIndex("reference", (q) => q.eq("reference", args.reference))
      .first();

    let transactionId: Id<"transaction">;
    if (existingTransaction) {
      transactionId = existingTransaction._id;
      await ctx.db.patch(existingTransaction._id, {
        status: args.status,
        amountShillings: args.amountShillings,
        currency: args.currency,
        userId: args.userId,
        courseId: args.courseId,
        moduleId: args.moduleId,
        accessScope: args.accessScope,
        metadata: args.metadata,
        rawEvent: args.rawEvent,
        updatedAt: now,
        verifiedAt:
          args.status === "success" ? now : existingTransaction.verifiedAt,
      });
    } else {
      transactionId = await ctx.db.insert("transaction", {
        reference: args.reference,
        provider: "paystack",
        status: args.status,
        amountShillings: args.amountShillings,
        currency: args.currency,
        userId: args.userId,
        courseId: args.courseId,
        moduleId: args.moduleId,
        accessScope: args.accessScope,
        metadata: args.metadata,
        rawEvent: args.rawEvent,
        verifiedAt: args.status === "success" ? now : undefined,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (args.status === "success") {
      if (args.accessScope === "course") {
        await ensureCourseEnrollment(ctx, args.courseId, args.userId);
      } else if (args.moduleId) {
        await grantModuleAccess(ctx, {
          courseId: args.courseId,
          moduleId: args.moduleId,
          transactionId,
          userId: args.userId,
        });
      }
    }

    return { success: true, transactionId } as const;
  },
});

export const grantFreeModuleAccess = mutation({
  args: {
    courseId: v.id("course"),
    moduleId: v.id("module"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await assertModuleBelongsToCourse(ctx, args.moduleId, args.courseId);

    const now = new Date().toISOString();
    const reference = `free-${Date.now()}-${args.moduleId}`;

    const transactionId = await ctx.db.insert("transaction", {
      reference,
      provider: "paystack",
      status: "success",
      amountShillings: 0,
      currency: "KES",
      userId: identity.subject,
      courseId: args.courseId,
      moduleId: args.moduleId,
      accessScope: "module",
      verifiedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await grantModuleAccess(ctx, {
      courseId: args.courseId,
      moduleId: args.moduleId,
      transactionId,
      userId: identity.subject,
    });

    return { success: true, transactionId } as const;
  },
});
