/** biome-ignore-all lint/style/noMagicNumbers: Easier for MVP */
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";

export async function ensureCourseEnrollment(
  ctx: MutationCtx,
  courseId: Id<"course">,
  userId: string
) {
  const existingEnrollment = await ctx.db
    .query("enrollment")
    .filter((q) =>
      q.and(
        q.eq(q.field("courseId"), courseId),
        q.eq(q.field("userId"), userId)
      )
    )
    .first();

  if (existingEnrollment) {
    const existingProgress = await ctx.db
      .query("courseProgress")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("courseId"), courseId),
          q.eq(q.field("enrollmentId"), existingEnrollment._id)
        )
      )
      .first();

    if (!existingProgress) {
      await ctx.db.insert("courseProgress", {
        courseId,
        userId,
        enrollmentId: existingEnrollment._id,
        status: "inProgress",
        progressPercentage: 0,
      });
    }

    return existingEnrollment._id;
  }

  const enrollmentId = await ctx.db.insert("enrollment", {
    courseId,
    userId,
    enrolledAt: new Date().toISOString(),
  });

  await ctx.db.insert("courseProgress", {
    courseId,
    userId,
    enrollmentId,
    status: "inProgress",
    progressPercentage: 0,
  });

  return enrollmentId;
}

export const createEnrollment = mutation({
  args: {
    courseId: v.id("course"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    await ensureCourseEnrollment(ctx, args.courseId, identity.subject);

    if (identity.email) {
      const siteUrl = (process.env.SITE_URL ?? "").replace(/\/$/, "");
      const contentUrl = `${siteUrl}/courses/${course.slug}`;
      const studentName =
        (identity.metadata as { name?: string })?.name ??
        identity.name ??
        identity.email;

      await ctx.scheduler.runAfter(0, api.emails.sendEmail, {
        studentName,
        studentEmail: identity.email,
        scope: "course",
        courseName: course.title,
        contentUrl,
      });
    }
  },
});

export const getEnrollmentsByUserId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("enrollment")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();
  },
});

export const getStudentsCount = query({
  args: {},
  handler: async (ctx) => {
    const enrollments = await ctx.db.query("enrollment").collect();
    return enrollments.length;
  },
});

export const getUserEnrollmentStats = query({
  args: {},
  handler: async (ctx) => {
    // console.log("server identity", await ctx.auth.getUserIdentity());
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      // throw new ConvexError("Not authenticated");
      return null;
    }

    // Get all enrollments for the user
    const enrollments = await ctx.db
      .query("enrollment")
      .filter((q) => q.eq(q.field("userId"), identity?.subject))
      .collect();

    // Get all course progress records for the user
    const courseProgress = await ctx.db
      .query("courseProgress")
      .filter((q) => q.eq(q.field("userId"), identity?.subject))
      .collect();

    // Calculate statistics
    const totalEnrolled = enrollments.length;
    const completed = courseProgress.filter(
      (progress) => progress.status === "completed"
    ).length;
    const inProgress = courseProgress.filter(
      (progress) => progress.status === "inProgress"
    ).length;

    return {
      totalEnrolled,
      completed,
      inProgress,
    };
  },
});

export const getUserCourseProgress = query({
  args: {
    courseId: v.id("course"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      // throw new Error("Not authenticated");
      return null;
    }

    // Get course progress
    const courseProgress = await ctx.db
      .query("courseProgress")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("courseId"), args.courseId)
        )
      )
      .first();

    if (!courseProgress) {
      return {
        progressPercentage: 0,
        modulesCompleted: 0,
        totalModules: 0,
        modulesProgress: [],
      };
    }

    // Get the latest course version to get modules
    const versions = await ctx.db
      .query("courseVersion")
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .collect();

    if (versions.length === 0) {
      return {
        progressPercentage: courseProgress.progressPercentage,
        modulesCompleted: 0,
        totalModules: 0,
        modulesProgress: [],
      };
    }

    // Get the latest version
    versions.sort((a, b) => b.versionNumber - a.versionNumber);
    const latestVersion = versions[0];

    // Get all modules for the latest version
    const modules = await ctx.db
      .query("module")
      .filter((q) => q.eq(q.field("courseVersionId"), latestVersion._id))
      .collect();

    modules.sort((a, b) => a.position - b.position);

    // Get module progress for each module
    const modulesProgress = await Promise.all(
      modules.map(async (module) => {
        const moduleProgress = await ctx.db
          .query("moduleProgress")
          .filter((q) =>
            q.and(
              q.eq(q.field("userId"), identity.subject),
              q.eq(q.field("moduleId"), module._id),
              q.eq(q.field("enrollmentId"), courseProgress.enrollmentId)
            )
          )
          .first();

        return {
          moduleId: module._id,
          title: module.title,
          position: module.position,
          status: moduleProgress?.status || "notStarted",
          progressPercentage: moduleProgress?.progressPercentage || 0,
          completedAt: moduleProgress?.completedAt,
        };
      })
    );

    // Calculate completed modules
    const modulesCompleted = modulesProgress.filter(
      (m) => m.status === "completed"
    ).length;

    return {
      progressPercentage: courseProgress.progressPercentage,
      modulesCompleted,
      totalModules: modules.length,
      modulesProgress,
    };
  },
});

export const getUserEnrolledCourses = query({
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

    // Get course details and progress for each enrollment
    const enrolledCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        const courseProgress = await ctx.db
          .query("courseProgress")
          .filter((q) =>
            q.and(
              q.eq(q.field("userId"), identity.subject),
              q.eq(q.field("courseId"), enrollment.courseId)
            )
          )
          .first();

        return {
          enrollment,
          course,
          progress: courseProgress,
        };
      })
    );

    return enrolledCourses;
  },
});

// Admin: list progress across all students and courses
export const getAllStudentsProgress = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    // Reuse role guard from modules.ts pattern
    const role = (identity?.metadata as { role?: string })?.role ?? "learner";
    if (!identity || role !== "admin") {
      throw new Error("Unauthorized");
    }

    const enrollments = await ctx.db.query("enrollment").collect();

    const results = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        const progress = await ctx.db
          .query("courseProgress")
          .filter((q) =>
            q.and(
              q.eq(q.field("userId"), enrollment.userId),
              q.eq(q.field("courseId"), enrollment.courseId),
              q.eq(q.field("enrollmentId"), enrollment._id)
            )
          )
          .first();

        return {
          enrollmentId: enrollment._id,
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          courseTitle: course?.title ?? "Unknown",
          progressPercentage: progress?.progressPercentage ?? 0,
          status: progress?.status ?? "inProgress",
          completedAt: progress?.completedAt,
        } as const;
      })
    );

    return results;
  },
});

// Learner: return completion details for a course (if any)
export const getCourseCompletionDetails = query({
  args: { courseId: v.id("course") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const enrollment = await ctx.db
      .query("enrollment")
      .filter((q) =>
        q.and(
          q.eq(q.field("courseId"), args.courseId),
          q.eq(q.field("userId"), identity.subject)
        )
      )
      .first();

    if (!enrollment) {
      return null;
    }

    const progress = await ctx.db
      .query("courseProgress")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("courseId"), args.courseId),
          q.eq(q.field("enrollmentId"), enrollment._id)
        )
      )
      .first();

    if (!progress) {
      return null;
    }

    return {
      courseTitle: course.title,
      completedAt: progress.completedAt,
      status: progress.status,
      progressPercentage: progress.progressPercentage,
      user: {
        id: identity.subject,
        name: (identity.metadata as { name?: string })?.name,
        email: identity.email,
      },
    } as const;
  },
});

export const getModuleProgress = query({
  args: { moduleId: v.id("module") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get module to find course
    const module = await ctx.db.get(args.moduleId);
    if (!module) {
      return null;
    }

    const courseVersion = await ctx.db.get(module.courseVersionId);
    if (!courseVersion) {
      return null;
    }

    // Get enrollment
    const enrollment = await ctx.db
      .query("enrollment")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("courseId"), courseVersion.courseId)
        )
      )
      .first();

    if (!enrollment) {
      return null;
    }

    // Get module progress
    return await ctx.db
      .query("moduleProgress")
      .filter((q) =>
        q.and(
          q.eq(q.field("moduleId"), args.moduleId),
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("enrollmentId"), enrollment._id)
        )
      )
      .first();
  },
});

export const updateModuleProgress = mutation({
  args: {
    moduleId: v.id("module"),
    status: v.union(
      v.literal("inProgress"),
      v.literal("completed"),
      v.literal("notStarted")
    ),
    progressPercentage: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the module to find the course
    const module = await ctx.db.get(args.moduleId);
    if (!module) {
      throw new Error("Module not found");
    }

    // Get the course version to find the course
    const courseVersion = await ctx.db.get(module.courseVersionId);
    if (!courseVersion) {
      throw new Error("Course version not found");
    }

    // Get the user's enrollment for this course
    const enrollment = await ctx.db
      .query("enrollment")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("courseId"), courseVersion.courseId)
        )
      )
      .first();

    if (!enrollment) {
      throw new Error("User not enrolled in this course");
    }

    // Check if module progress already exists
    const existingProgress = await ctx.db
      .query("moduleProgress")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("moduleId"), args.moduleId),
          q.eq(q.field("enrollmentId"), enrollment._id)
        )
      )
      .first();

    let normalizedProgress: number;
    if (args.status === "completed") {
      normalizedProgress = 100;
    } else if (args.status === "notStarted") {
      normalizedProgress = 0;
    } else {
      normalizedProgress = args.progressPercentage;
    }

    if (normalizedProgress < 0 || normalizedProgress > 100) {
      throw new Error("progressPercentage must be between 0 and 100");
    }

    const patch: Record<string, unknown> = {
      status: args.status,
      progressPercentage: normalizedProgress,
    };

    if (args.status === "completed") {
      patch.completedAt = new Date().toISOString();
    } else if (existingProgress?.completedAt) {
      patch.completedAt = undefined;
    }

    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, patch);
    } else {
      await ctx.db.insert("moduleProgress", {
        moduleId: args.moduleId,
        userId: identity.subject,
        enrollmentId: enrollment._id,
        status: args.status,
        progressPercentage: normalizedProgress,
        completedAt:
          args.status === "completed" ? new Date().toISOString() : undefined,
      });
    }

    // Update course progress
    await updateCourseProgress(
      ctx,
      courseVersion.courseId,
      identity.subject,
      enrollment._id
    );

    return { success: true };
  },
});

async function updateCourseProgress(
  ctx: MutationCtx,
  courseId: string,
  userId: string,
  enrollmentId: string
) {
  // Get all modules for the latest course version
  const versions = await ctx.db
    .query("courseVersion")
    .filter((q) => q.eq(q.field("courseId"), courseId))
    .collect();

  if (versions.length === 0) {
    return;
  }

  versions.sort((a, b) => b.versionNumber - a.versionNumber);
  const latestVersion = versions[0];

  const modules = await ctx.db
    .query("module")
    .filter((q) => q.eq(q.field("courseVersionId"), latestVersion._id))
    .collect();

  // Get module progress for all modules
  const moduleProgresses = await Promise.all(
    modules.map(async (module) => {
      return await ctx.db
        .query("moduleProgress")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), userId),
            q.eq(q.field("moduleId"), module._id),
            q.eq(q.field("enrollmentId"), enrollmentId)
          )
        )
        .first();
    })
  );

  // Calculate overall progress
  const completedModules = moduleProgresses.filter(
    (p) => p?.status === "completed"
  ).length;
  const totalModules = modules.length;
  const progressPercentage =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  // Determine course status
  const courseStatus = progressPercentage === 100 ? "completed" : "inProgress";

  // Update course progress
  const courseProgress = await ctx.db
    .query("courseProgress")
    .filter((q) =>
      q.and(
        q.eq(q.field("userId"), userId),
        q.eq(q.field("courseId"), courseId),
        q.eq(q.field("enrollmentId"), enrollmentId)
      )
    )
    .first();

  if (courseProgress) {
    const patch: Record<string, unknown> = {
      status: courseStatus,
      progressPercentage,
    };

    if (courseStatus === "completed") {
      patch.completedAt = new Date().toISOString();
    } else if (courseProgress.completedAt) {
      patch.completedAt = undefined;
    }

    await ctx.db.patch(courseProgress._id, patch);
  }
}
