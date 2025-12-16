import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

// Pagination defaults
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_NUMBER = 1;

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
  if (!dueDate) {
    return false;
  }
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

async function getUserRole(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return (identity.metadata as { role?: string })?.role ?? "learner";
}

async function isInstructorOrAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  const role = await getUserRole(ctx);
  return role === "instructor" || role === "admin";
}

async function getSubmissionWithCourseDataHelper(
  ctx: QueryCtx | MutationCtx,
  submissionId: Id<"assignmentSubmission">
) {
  const submission = await ctx.db.get(submissionId);
  if (!submission) {
    throw new Error("Submission not found");
  }

  const assignment = await ctx.db.get(submission.assignmentId);
  if (!assignment) {
    throw new Error("Assignment not found");
  }

  const moduleContent = await ctx.db.get(assignment.moduleContentId);
  if (!moduleContent) {
    throw new Error("Module content not found");
  }

  const module = await ctx.db.get(moduleContent.moduleId);
  if (!module) {
    throw new Error("Module not found");
  }

  const courseVersion = await ctx.db.get(module.courseVersionId);
  if (!courseVersion) {
    throw new Error("Course version not found");
  }

  const enrollment = await ctx.db.get(submission.enrollmentId);
  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  return {
    submission,
    assignment,
    moduleContent,
    module,
    courseVersion,
    enrollment,
  };
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

export const getUpcomingDeadlines = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get all enrollments for the user
    const enrollments = await ctx.db
      .query("enrollment")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    if (enrollments.length === 0) {
      return [];
    }

    const courseIds = enrollments.map((e) => e.courseId);
    const courses = await Promise.all(
      courseIds.map((id) => ctx.db.get(id))
    );
    const validCourses = courses.filter((c) => c !== null);

    if (validCourses.length === 0) {
      return [];
    }

    // Get all course versions for enrolled courses
    const courseVersions = await ctx.db
      .query("courseVersion")
      .filter((q) =>
        q.or(...validCourses.map((c) => q.eq(q.field("courseId"), c._id)))
      )
      .collect();

    if (courseVersions.length === 0) {
      return [];
    }

    // Get the latest version for each course
    const latestVersionsByCourse = new Map<Id<"course">, Doc<"courseVersion">>();
    for (const version of courseVersions) {
      const existing = latestVersionsByCourse.get(version.courseId);
      if (!existing || version.versionNumber > existing.versionNumber) {
        latestVersionsByCourse.set(version.courseId, version);
      }
    }

    const latestVersionIds = Array.from(latestVersionsByCourse.values()).map(
      (v) => v._id
    );

    // Get all modules for the latest versions
    const modules = await ctx.db
      .query("module")
      .filter((q) =>
        q.or(...latestVersionIds.map((id) => q.eq(q.field("courseVersionId"), id)))
      )
      .collect();

    if (modules.length === 0) {
      return [];
    }

    const moduleIds = modules.map((m) => m._id);

    // Get all assignment-type module content
    const assignmentContents = await ctx.db
      .query("moduleContent")
      .filter((q) =>
        q.and(
          q.or(...moduleIds.map((id) => q.eq(q.field("moduleId"), id))),
          q.eq(q.field("type"), "assignment")
        )
      )
      .collect();

    if (assignmentContents.length === 0) {
      return [];
    }

    const contentIds = assignmentContents.map((c) => c._id);

    // Get all assignments
    const allAssignments = await ctx.db
      .query("assignment")
      .filter((q) =>
        q.or(...contentIds.map((id) => q.eq(q.field("moduleContentId"), id)))
      )
      .collect();

    // Filter to only those with due dates
    const assignments = allAssignments.filter((a) => a.dueDate !== undefined);

    if (assignments.length === 0) {
      return [];
    }

    // Get all assignment IDs
    const assignmentIds = assignments.map((a) => a._id);

    // Get all submissions for these assignments by the current user
    const submissions = await ctx.db
      .query("assignmentSubmission")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.or(...assignmentIds.map((id) => q.eq(q.field("assignmentId"), id)))
        )
      )
      .collect();

    // Create a Set of submitted assignment IDs for O(1) lookup
    const submittedAssignmentIds = new Set(
      submissions.map((s) => s.assignmentId)
    );

    // Filter out assignments that have been submitted
    const unsubmittedAssignments = assignments.filter(
      (a) => !submittedAssignmentIds.has(a._id)
    );

    // Build the result with course and module information
    const deadlines = await Promise.all(
      unsubmittedAssignments.map(async (assignment) => {
        const moduleContent = await ctx.db.get(assignment.moduleContentId);
        if (!moduleContent) return null;

        const module = await ctx.db.get(moduleContent.moduleId);
        if (!module) return null;

        const courseVersion = await ctx.db.get(module.courseVersionId);
        if (!courseVersion) return null;

        const course = await ctx.db.get(courseVersion.courseId);
        if (!course) return null;

        const dueDate = assignment.dueDate;
        if (!dueDate) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        const isOverdue = due < today;

        return {
          id: String(assignment._id),
          title: moduleContent.title,
          courseTitle: course.title,
          courseSlug: course.slug,
          dueDate,
          type: "assignment" as const,
          priority: isOverdue ? ("high" as const) : ("medium" as const),
          isOverdue,
        };
      })
    );

    // Filter out nulls and sort by due date
    const validDeadlines = deadlines.filter(
      (d): d is NonNullable<typeof deadlines[0]> => d !== null
    );

    // Sort by due date (overdue first, then upcoming)
    validDeadlines.sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return dateA - dateB;
    });

    return validDeadlines;
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
      userName: identity.name ?? "",
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

async function validateSubmissionAuthorization(
  ctx: MutationCtx,
  submissionId: Id<"assignmentSubmission">,
  status: "submitted" | "graded",
  currentUserId: string
) {
  const isGrader = await isInstructorOrAdmin(ctx);
  const { submission } = await getSubmissionWithCourseDataHelper(
    ctx,
    submissionId
  );

  if (status === "submitted" && submission.userId !== currentUserId) {
    // Only the submission owner (student) can revert to "submitted"
    throw new Error("Only the submission owner can revert to submitted status");
  }

  if (status === "graded" && !isGrader) {
    // Only instructors/admins can mark as "graded"
    throw new Error(
      "Only instructors and admins can mark submissions as graded"
    );
  }

  return { isGrader };
}

function validateGradingFields(
  status: "submitted" | "graded",
  hasGradingFields: boolean,
  isGrader: boolean
) {
  if (status === "graded" && hasGradingFields && !isGrader) {
    throw new Error("Only instructors and admins can set grading fields");
  }
}

async function enforceRequiredScoreAndBounds(
  ctx: MutationCtx,
  submissionId: Id<"assignmentSubmission">,
  status: "submitted" | "graded",
  score: number | undefined
) {
  if (status !== "graded") {
    return;
  }
  const { assignment } = await getSubmissionWithCourseDataHelper(
    ctx,
    submissionId
  );
  if (score === undefined) {
    throw new Error("Score is required when marking as graded");
  }
  if (score < 0 || score > assignment.maxScore) {
    throw new Error(`Score must be between 0 and ${assignment.maxScore}`);
  }
}

function prepareUpdateData(
  args: {
    status: "submitted" | "graded";
    score?: number;
    feedback?: string;
    gradedBy?: string;
  },
  isGrader: boolean,
  currentUserId: string
): Partial<Doc<"assignmentSubmission">> {
  const updateData: Partial<Doc<"assignmentSubmission">> = {
    status: args.status,
  };

  if (args.status === "graded") {
    updateData.gradedAt = new Date().toISOString();
    if (isGrader) {
      if (args.score !== undefined) {
        updateData.score = args.score;
      }
      if (args.feedback !== undefined) {
        updateData.feedback = args.feedback;
      }
      updateData.gradedBy = args.gradedBy || currentUserId;
    }
  }

  return updateData;
}

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

    const currentUserId = identity.subject;

    // Validate authorization
    const { isGrader } = await validateSubmissionAuthorization(
      ctx,
      args.submissionId,
      args.status,
      currentUserId
    );

    // Validate grading fields
    const hasGradingFields =
      args.score !== undefined || !!args.feedback || !!args.gradedBy;
    validateGradingFields(args.status, hasGradingFields, isGrader);

    // Enforce required score and bounds
    await enforceRequiredScoreAndBounds(
      ctx,
      args.submissionId,
      args.status,
      args.score
    );

    const updateData = prepareUpdateData(args, isGrader, currentUserId);

    await ctx.db.patch(args.submissionId, updateData);

    return { success: true };
  },
});

// -----------------------------
// Admin listing queries
// -----------------------------

export const listAssignmentSubmissionsForAdmin = query({
  args: {
    assignmentId: v.id("assignment"),
    status: v.optional(v.union(v.literal("submitted"), v.literal("graded"))),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const isGrader = await isInstructorOrAdmin(ctx);
    if (!isGrader) {
      throw new Error("Unauthorized");
    }

    // Base query by assignmentId
    let submissions = await ctx.db
      .query("assignmentSubmission")
      .filter((q) => q.eq(q.field("assignmentId"), args.assignmentId))
      .order("desc")
      .collect();

    if (args.status) {
      submissions = submissions.filter((s) => s.status === args.status);
    }

    const pageSize = Math.max(
      MIN_PAGE_NUMBER,
      Math.min(args.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
    );
    const page = Math.max(MIN_PAGE_NUMBER, args.page ?? MIN_PAGE_NUMBER);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const slice = submissions.slice(start, end);

    // Enrich with assignment/module/course and enrollment ref if needed by UI
    const rows = await Promise.all(
      slice.map(async (submission) => {
        const { assignment, courseVersion } =
          await getSubmissionWithCourseDataHelper(ctx, submission._id);
        return {
          submission,
          assignmentTitle:
            (await ctx.db.get(assignment.moduleContentId))?.title ?? "",
          courseId: courseVersion.courseId,
        };
      })
    );

    return {
      total: submissions.length,
      page,
      pageSize,
      rows,
    };
  },
});

export const getSubmissionWithCourseData = query({
  args: { submissionId: v.id("assignmentSubmission") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const isGrader = await isInstructorOrAdmin(ctx);
    if (!isGrader) {
      throw new Error("Unauthorized");
    }

    return await getSubmissionWithCourseDataHelper(ctx, args.submissionId);
  },
});

export const listSubmissionsInboxForAdmin = query({
  args: {
    courseId: v.optional(v.id("course")),
    assignmentId: v.optional(v.id("assignment")),
    status: v.optional(v.union(v.literal("submitted"), v.literal("graded"))),
    q: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const isGrader = await isInstructorOrAdmin(ctx);
    if (!isGrader) {
      throw new Error("Unauthorized");
    }

    // Start with all submissions or by assignment if provided
    let submissions = await ctx.db
      .query("assignmentSubmission")
      .order("desc")
      .collect();

    if (args.assignmentId) {
      submissions = submissions.filter(
        (s) => s.assignmentId === args.assignmentId
      );
    }

    if (args.status) {
      submissions = submissions.filter((s) => s.status === args.status);
    }

    // Enrich to filter by courseId and text query
    const enriched = await Promise.all(
      submissions.map(async (submission) => {
        const { assignment, courseVersion } =
          await getSubmissionWithCourseDataHelper(ctx, submission._id);
        const moduleContent = await ctx.db.get(assignment.moduleContentId);
        return {
          submission,
          assignmentTitle: moduleContent?.title ?? "",
          courseId: courseVersion.courseId,
        };
      })
    );

    let filtered = enriched;
    if (args.courseId) {
      filtered = filtered.filter((r) => r.courseId === args.courseId);
    }
    const queryText = args.q?.trim().toLowerCase();
    if (queryText) {
      filtered = filtered.filter(
        (r) =>
          r.assignmentTitle.toLowerCase().includes(queryText) ||
          r.submission.userId.toLowerCase().includes(queryText) ||
          r.submission.userName?.toLowerCase().includes(queryText)
      );
    }

    const pageSize = Math.max(
      MIN_PAGE_NUMBER,
      Math.min(args.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
    );
    const page = Math.max(MIN_PAGE_NUMBER, args.page ?? MIN_PAGE_NUMBER);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      total: filtered.length,
      page,
      pageSize,
      rows: filtered.slice(start, end),
    };
  },
});
