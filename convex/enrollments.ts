import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createEnrollment = mutation({
  args: {
    courseId: v.id("course"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const enrollment = await ctx.db.insert("enrollment", {
      courseId: args.courseId,
      userId: identity.subject,
      enrolledAt: new Date().toISOString(),
    });

    await ctx.db.insert("courseProgress", {
      courseId: args.courseId,
      userId: identity.subject,
      enrollmentId: enrollment,
      status: "inProgress",
      progressPercentage: 0,
    });
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
    const identity = await ctx.auth.getUserIdentity();
    console.log("identity", identity);

    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get all enrollments for the user
    const enrollments = await ctx.db
      .query("enrollment")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    // Get all course progress records for the user
    const courseProgress = await ctx.db
      .query("courseProgress")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
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

export const getUserEnrolledCourses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
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
