import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

// -----------------------------
// Validators
// -----------------------------
const submissionValidator = v.object({
  assignmentId: v.id("assignment"),
  submissionType: v.union(
    v.literal("file"),
    v.literal("text"),
    v.literal("url")
  ),
  content: v.string(),
});

// -----------------------------
// Helpers
// -----------------------------
async function validateAssignmentExists(
  ctx: QueryCtx,
  assignmentId: Id<"assignment">
) {
  const assignment = await ctx.db.get(assignmentId);
  if (!assignment) {
    throw new Error("Assignment not found");
  }
  return assignment;
}

async function validateUserEnrollment(
  ctx: QueryCtx,
  userId: string,
  assignmentId: Id<"assignment">
) {
  const assignment = await ctx.db.get(assignmentId);
  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // Get the module content to find the module
  const moduleContent = await ctx.db.get(assignment.moduleContentId);
  if (!moduleContent) {
    throw new Error("Module content not found");
  }

  // Get the module to find the course version
  const module = await ctx.db.get(moduleContent.moduleId);
  if (!module) {
    throw new Error("Module not found");
  }

  // Get the course version to find the course
  const courseVersion = await ctx.db.get(module.courseVersionId);
  if (!courseVersion) {
    throw new Error("Course version not found");
  }

  // Check if user is enrolled in the course
  const enrollment = await ctx.db
    .query("enrollment")
    .filter((q) =>
      q.and(
        q.eq(q.field("userId"), userId),
        q.eq(q.field("courseId"), courseVersion.courseId)
      )
    )
    .first();

  if (!enrollment) {
    throw new Error("User is not enrolled in this course");
  }

  return { assignment, enrollment };
}

function calculateIsLate(
  dueDate: string | undefined,
  submittedAt: string
): boolean {
  if (!dueDate) return false;
  return new Date(submittedAt) > new Date(dueDate);
}

async function getNextAttemptNumber(
  ctx: QueryCtx,
  assignmentId: Id<"assignment">,
  userId: string
): Promise<number> {
  const submissions = await ctx.db
    .query("assignmentSubmission")
    .filter((q) =>
      q.and(
        q.eq(q.field("assignmentId"), assignmentId),
        q.eq(q.field("userId"), userId)
      )
    )
    .collect();

  return submissions.length + 1;
}

// -----------------------------
// Queries
// -----------------------------
export const getAssignmentDetails = query({
  args: { assignmentId: v.id("assignment") },
  handler: async (ctx, args) => {
    const assignment = await validateAssignmentExists(ctx, args.assignmentId);

    // Get the module content details
    const moduleContent = await ctx.db.get(assignment.moduleContentId);
    if (!moduleContent) {
      throw new Error("Module content not found");
    }

    return {
      ...assignment,
      title: moduleContent.title,
      content: moduleContent.content,
    };
  },
});

export const getAssignmentSubmissions = query({
  args: {
    assignmentId: v.id("assignment"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== args.userId) {
      throw new Error("Unauthorized");
    }

    const submissions = await ctx.db
      .query("assignmentSubmission")
      .filter((q) =>
        q.and(
          q.eq(q.field("assignmentId"), args.assignmentId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .order("desc")
      .collect();

    return submissions;
  },
});

export const getUserAssignmentSubmission = query({
  args: {
    assignmentId: v.id("assignment"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== args.userId) {
      throw new Error("Unauthorized");
    }

    const submission = await ctx.db
      .query("assignmentSubmission")
      .filter((q) =>
        q.and(
          q.eq(q.field("assignmentId"), args.assignmentId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .order("desc")
      .first();

    return submission;
  },
});

export const getAssignmentWithSubmissions = query({
  args: {
    assignmentId: v.id("assignment"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const assignment = await validateAssignmentExists(ctx, args.assignmentId);
    const moduleContent = await ctx.db.get(assignment.moduleContentId);

    if (!moduleContent) {
      throw new Error("Module content not found");
    }

    // Get user's submissions for this assignment
    const submissions = await ctx.db
      .query("assignmentSubmission")
      .filter((q) =>
        q.and(
          q.eq(q.field("assignmentId"), args.assignmentId),
          q.eq(q.field("userId"), identity.subject)
        )
      )
      .order("desc")
      .collect();

    return {
      assignment: {
        ...assignment,
        title: moduleContent.title,
        content: moduleContent.content,
      },
      submissions,
      latestSubmission: submissions[0] || null,
    };
  },
});

// -----------------------------
// Mutations
// -----------------------------
export const submitAssignment = mutation({
  args: submissionValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { assignment, enrollment } = await validateUserEnrollment(
      ctx,
      identity.subject,
      args.assignmentId
    );

    // Validate submission type matches assignment requirements
    if (assignment.submissionType !== args.submissionType) {
      throw new Error(
        `Assignment requires ${assignment.submissionType} submission, but ${args.submissionType} was provided`
      );
    }

    // Validate content based on submission type
    if (args.submissionType === "url") {
      try {
        new URL(args.content);
      } catch {
        throw new Error("Invalid URL format");
      }
    }

    if (args.submissionType === "text" && args.content.trim().length === 0) {
      throw new Error("Text submission cannot be empty");
    }

    if (args.submissionType === "file" && !args.content) {
      throw new Error("File URL is required for file submissions");
    }

    const submittedAt = new Date().toISOString();
    const isLate = calculateIsLate(assignment.dueDate, submittedAt);
    const attemptNumber = await getNextAttemptNumber(
      ctx,
      args.assignmentId,
      identity.subject
    );

    const submissionId = await ctx.db.insert("assignmentSubmission", {
      assignmentId: args.assignmentId,
      userId: identity.subject,
      enrollmentId: enrollment._id,
      submissionType: args.submissionType,
      content: args.content,
      submittedAt,
      isLate,
      attemptNumber,
      status: "submitted",
    });

    return { submissionId, isLate, attemptNumber };
  },
});

export const updateSubmissionStatus = mutation({
  args: {
    submissionId: v.id("assignmentSubmission"),
    status: v.union(v.literal("submitted"), v.literal("graded")),
    score: v.optional(v.number()),
    feedback: v.optional(v.string()),
    gradedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    const updateData: Partial<Doc<"assignmentSubmission">> = {
      status: args.status,
    };

    if (args.status === "graded") {
      updateData.gradedAt = new Date().toISOString();
      if (args.score !== undefined) {
        updateData.score = args.score;
      }
      if (args.feedback) {
        updateData.feedback = args.feedback;
      }
      if (args.gradedBy) {
        updateData.gradedBy = args.gradedBy;
      }
    }

    await ctx.db.patch(args.submissionId, updateData);

    return { success: true };
  },
});
