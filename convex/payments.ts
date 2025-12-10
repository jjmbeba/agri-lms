import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { type MutationCtx, mutation } from "./_generated/server";
import { ensureCourseEnrollment } from "./enrollments";

const buildContentUrl = (courseSlug: string, moduleSlug?: string) => {
  const siteUrl = (process.env.SITE_URL ?? "").replace(/\/$/, "");
  const basePath = `/courses/${courseSlug}`;
  if (moduleSlug) {
    return `${siteUrl}${basePath}/modules/${moduleSlug}`;
  }
  return `${siteUrl}${basePath}`;
};

const scheduleEnrollmentEmail = async (
  ctx: MutationCtx,
  params: {
    accessScope: "course" | "module";
    course: Doc<"course">;
    moduleDoc?: Doc<"module"> | null;
    studentEmail: string;
    studentName: string;
  }
) => {
  const contentUrl = buildContentUrl(
    params.course.slug,
    params.moduleDoc?.slug
  );

  await ctx.scheduler.runAfter(0, api.emails.sendEmail, {
    studentName: params.studentName,
    studentEmail: params.studentEmail,
    scope: params.accessScope,
    courseName: params.course.title,
    moduleName: params.moduleDoc?.title,
    contentUrl,
  });
};

const toTrimmed = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const resolveStudentContact = (
  args: {
    metadata?: unknown;
    rawEvent?: unknown;
    userId: string;
  }
): { studentEmail?: string; studentName?: string } => {
  const meta =
    args.metadata && typeof args.metadata === "object"
      ? (args.metadata as Record<string, unknown>)
      : {};
  const raw =
    args.rawEvent && typeof args.rawEvent === "object"
      ? (args.rawEvent as { data?: unknown })
      : {};
  const data =
    raw.data && typeof raw.data === "object"
      ? (raw.data as Record<string, unknown>)
      : undefined;
  const customer =
    data &&
    "customer" in data &&
    data.customer &&
    typeof data.customer === "object"
      ? (data.customer as Record<string, unknown>)
      : undefined;

  const email =
    toTrimmed(meta.studentEmail) ??
    toTrimmed(meta.email) ??
    toTrimmed(customer?.email);

  const firstName =
    toTrimmed(meta.studentFirstName) ?? toTrimmed(customer?.first_name);
  const lastName =
    toTrimmed(meta.studentLastName) ?? toTrimmed(customer?.last_name);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  const name =
    toTrimmed(meta.studentName) ??
    (fullName ? fullName : undefined) ??
    toTrimmed(customer?.name) ??
    email ??
    args.userId;

  return { studentEmail: email, studentName: name };
};

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
    amountCents: v.number(),
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
    const wasAlreadySuccess = existingTransaction?.status === "success";

    if (existingTransaction) {
      transactionId = existingTransaction._id;
      await ctx.db.patch(existingTransaction._id, {
        status: args.status,
        amountCents: args.amountCents,
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
        amountCents: args.amountCents,
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

      const course = await ctx.db.get(args.courseId);
      if (!course) {
        throw new Error("Course not found for transaction email");
      }

      const moduleDoc = args.moduleId
        ? await ctx.db.get(args.moduleId)
        : undefined;

      const contact = resolveStudentContact({
        metadata: args.metadata,
        rawEvent: args.rawEvent,
        userId: args.userId,
      });

      if (!wasAlreadySuccess && contact.studentEmail) {
        await scheduleEnrollmentEmail(ctx, {
          accessScope: args.accessScope,
          course,
          moduleDoc,
          studentEmail: contact.studentEmail,
          studentName: contact.studentName ?? "Learner",
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
      amountCents: 0,
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

    const course = await ctx.db.get(args.courseId);
    const moduleDoc = await ctx.db.get(args.moduleId);

    if (course && moduleDoc && identity.email) {
      const studentName =
        (identity.metadata as { name?: string })?.name ??
        identity.name ??
        identity.email;

      await scheduleEnrollmentEmail(ctx, {
        accessScope: "module",
        course,
        moduleDoc,
        studentEmail: identity.email,
        studentName,
      });
    }

    return { success: true, transactionId } as const;
  },
});
