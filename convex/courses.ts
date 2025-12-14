import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { restrictRoles } from "./auth";
import { generateCourseSlug } from "./utils/slug";

// Helper function to calculate total price of draft modules for a course
async function getDraftModulesTotalPrice(
  ctx: MutationCtx,
  courseId: Id<"course">
): Promise<number> {
  const draftModules = await ctx.db
    .query("draftModule")
    .filter((q) => q.eq(q.field("courseId"), courseId))
    .collect();

  return draftModules.reduce(
    (total, module) => total + module.priceShillings,
    0
  );
}

// Helper function to check if a course has draft modules
async function hasDraftModules(
  ctx: MutationCtx,
  courseId: Id<"course">
): Promise<boolean> {
  const draftModule = await ctx.db
    .query("draftModule")
    .filter((q) => q.eq(q.field("courseId"), courseId))
    .first();
  return draftModule !== null;
}

async function buildCourseResponse(ctx: QueryCtx, course: Doc<"course">) {
  const department = await ctx.db.get(course.departmentId);

  const versions = await ctx.db
    .query("courseVersion")
    .filter((q) => q.eq(q.field("courseId"), course._id))
    .collect();

  let modulesCount = 0;
  if (versions.length > 0) {
    const latest = versions.reduce((acc, cur) =>
      cur.versionNumber > acc.versionNumber ? cur : acc
    );
    const modulesForLatest = await ctx.db
      .query("module")
      .filter((q) => q.eq(q.field("courseVersionId"), latest._id))
      .collect();
    modulesCount = modulesForLatest.length;
  }

  const identity = await ctx.auth.getUserIdentity();
  let isEnrolled = false;
  let moduleAccessIds: Id<"module">[] = [];
  let admissionLetterUrl: string | null = null;
  if (identity) {
    const enrollment = await ctx.db
      .query("enrollment")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("courseId"), course._id)
        )
      )
      .first();
    isEnrolled = Boolean(enrollment);
    admissionLetterUrl =
      (enrollment as { admissionLetterUrl?: string } | null)
        ?.admissionLetterUrl ?? null;

    if (!isEnrolled) {
      const accessRows = await ctx.db
        .query("moduleAccess")
        .withIndex("user_course", (q) =>
          q.eq("userId", identity.subject).eq("courseId", course._id)
        )
        .collect();
      moduleAccessIds = accessRows.map((row) => row.moduleId);
    }
  }

  return {
    course,
    department,
    modulesCount,
    isEnrolled,
    admissionLetterUrl,
    moduleAccess: {
      count: moduleAccessIds.length,
      moduleIds: moduleAccessIds,
    },
  } as const;
}

export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    departmentId: v.id("department"),
    priceShillings: v.number(),
    handout: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("coming-soon")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    // For new courses, there are no modules yet, so we allow any price >= 0
    if (args.priceShillings < 0) {
      throw new Error("Course price must be non-negative");
    }

    const slug = await generateCourseSlug(ctx, args.title);

    return await ctx.db.insert("course", {
      title: args.title,
      slug,
      description: args.description,
      tags: args.tags,
      departmentId: args.departmentId,
      status: args.status,
      priceShillings: args.priceShillings,
      handout: args.handout ?? "",
    });
  },
});

export const getCoursesCount = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("course").collect();
    return { count: courses.length } as const;
  },
});

export const getCourses = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("course").collect();
    const departments = await ctx.db.query("department").collect();

    const departmentById = new Map(departments.map((d) => [d._id, d]));

    return courses.map((c) => ({
      course: c,
      department: departmentById.get(c.departmentId) ?? null,
    }));
  },
});

export const getCourse = query({
  args: { id: v.id("course") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    if (!course) {
      return null;
    }

    return buildCourseResponse(ctx, course);
  },
});

export const getCourseBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("course")
      .withIndex("slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!course) {
      return null;
    }

    return buildCourseResponse(ctx, course);
  },
});

export const deleteCourse = mutation({
  args: { id: v.id("course") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    const draftModules = await ctx.db
      .query("draftModule")
      .filter((q) => q.eq(q.field("courseId"), args.id))
      .collect();

    await Promise.all(
      draftModules.map(async (draftModule) => {
        const draftModuleContents = await ctx.db
          .query("draftModuleContent")
          .filter((q) => q.eq(q.field("draftModuleId"), draftModule._id))
          .collect();

        await Promise.all(
          draftModuleContents.map(async (draftModuleContent) => {
            const draftAssignments = await ctx.db
              .query("draftAssignment")
              .filter((q) =>
                q.eq(q.field("draftModuleContentId"), draftModuleContent._id)
              )
              .collect();

            await Promise.all(
              draftAssignments.map((draftAssignment) =>
                ctx.db.delete(draftAssignment._id)
              )
            );

            await ctx.db.delete(draftModuleContent._id);
          })
        );

        await ctx.db.delete(draftModule._id);
      })
    );

    const versions = await ctx.db
      .query("courseVersion")
      .filter((q) => q.eq(q.field("courseId"), args.id))
      .collect();

    await Promise.all(
      versions.map(async (version) => {
        const modules = await ctx.db
          .query("module")
          .filter((q) => q.eq(q.field("courseVersionId"), version._id))
          .collect();

        await Promise.all(
          modules.map(async (moduleRow) => {
            const moduleContents = await ctx.db
              .query("moduleContent")
              .filter((q) => q.eq(q.field("moduleId"), moduleRow._id))
              .collect();

            await Promise.all(
              moduleContents.map(async (moduleContent) => {
                const assignments = await ctx.db
                  .query("assignment")
                  .filter((q) =>
                    q.eq(q.field("moduleContentId"), moduleContent._id)
                  )
                  .collect();

                await Promise.all(
                  assignments.map(async (assignmentRow) => {
                    const submissions = await ctx.db
                      .query("assignmentSubmission")
                      .filter((q) =>
                        q.eq(q.field("assignmentId"), assignmentRow._id)
                      )
                      .collect();

                    await Promise.all(
                      submissions.map((submission) =>
                        ctx.db.delete(submission._id)
                      )
                    );

                    await ctx.db.delete(assignmentRow._id);
                  })
                );

                await ctx.db.delete(moduleContent._id);
              })
            );

            await ctx.db.delete(moduleRow._id);
          })
        );

        await ctx.db.delete(version._id);
      })
    );

    await ctx.db.delete(args.id);
    return { success: true } as const;
  },
});

export const editCourse = mutation({
  args: {
    id: v.id("course"),
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
    departmentId: v.id("department"),
    priceShillings: v.number(),
    handout: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("coming-soon"),
      v.literal("published")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    // Check if trying to set status to 'coming-soon' with draft modules
    if (args.status === "coming-soon") {
      const hasDrafts = await hasDraftModules(ctx, args.id);
      if (hasDrafts) {
        throw new ConvexError(
          "Cannot set course status to 'coming-soon' when draft modules exist. Please delete all draft modules first."
        );
      }
    }

    // Validate that course price does not exceed total module prices
    const moduleTotal = await getDraftModulesTotalPrice(ctx, args.id);
    if (moduleTotal > 0 && moduleTotal < args.priceShillings) {
      throw new ConvexError(
        `Course price (${args.priceShillings} KES) cannot exceed combined module prices (${moduleTotal} KES)`
      );
    }

    const existingCourse = await ctx.db.get(args.id);
    if (!existingCourse) {
      throw new ConvexError("Course not found");
    }

    const shouldRegenerateSlug =
      existingCourse.title !== args.title || !existingCourse.slug;
    const slug = shouldRegenerateSlug
      ? await generateCourseSlug(ctx, args.title, args.id)
      : existingCourse.slug;

    const isNowPublished = args.status === "published";

    await ctx.db.patch(args.id, {
      title: args.title,
      slug,
      description: args.description,
      tags: args.tags,
      departmentId: args.departmentId,
      priceShillings: args.priceShillings,
      handout: args.handout ?? existingCourse.handout ?? "",
      status: args.status,
    });

    // Trigger email notification if status is becoming published and course has subscribers
    if (isNowPublished && slug) {
      const hasSubscribers = await ctx.db
        .query("courseNotification")
        .withIndex("course", (q) => q.eq("courseId", args.id))
        .first();

      if (hasSubscribers) {
        await ctx.scheduler.runAfter(0, api.emails.notifyCourseSubscribers, {
          courseId: args.id,
          courseName: args.title,
          courseSlug: slug,
        });
      }
    }

    return await ctx.db.get(args.id);
  },
});

export const getPublishedCourses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const courses = await ctx.db
      .query("course")
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "published"),
          q.eq(q.field("status"), "coming-soon")
        )
      )
      .collect();
    const departments = await ctx.db.query("department").collect();

    const departmentById = new Map(departments.map((d) => [d._id, d]));

    const userEnrollments = await ctx.db
      .query("enrollment")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    const moduleAccessRows = await ctx.db
      .query("moduleAccess")
      .withIndex("user_course", (q) => q.eq("userId", identity.subject))
      .collect();
    const moduleAccessByCourse = new Map<Id<"course">, Id<"module">[]>();
    for (const row of moduleAccessRows) {
      const existing = moduleAccessByCourse.get(row.courseId) ?? [];
      existing.push(row.moduleId);
      moduleAccessByCourse.set(row.courseId, existing);
    }

    return courses.map((c) => ({
      course: c,
      department: departmentById.get(c.departmentId) ?? null,
      isEnrolled: userEnrollments.some((e) => e.courseId === c._id),
      moduleAccess: {
        count: moduleAccessByCourse.get(c._id)?.length ?? 0,
        moduleIds: moduleAccessByCourse.get(c._id) ?? [],
      },
    }));
  },
});

export const getCoursesWithStats = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("course").collect();
    const departments = await ctx.db.query("department").collect();
    const courseVersions = await ctx.db.query("courseVersion").collect();
    const modules = await ctx.db.query("module").collect();
    const enrollments = await ctx.db.query("enrollment").collect();

    const departmentById = new Map(departments.map((dept) => [dept._id, dept]));

    const enrollmentCountByCourse = new Map<Id<"course">, number>();
    for (const enrollment of enrollments) {
      const current = enrollmentCountByCourse.get(enrollment.courseId) ?? 0;
      enrollmentCountByCourse.set(enrollment.courseId, current + 1);
    }

    const versionsByCourse = new Map<Id<"course">, typeof courseVersions>();
    for (const version of courseVersions) {
      const list = versionsByCourse.get(version.courseId) ?? [];
      list.push(version);
      versionsByCourse.set(version.courseId, list);
    }

    const modulesByVersion = new Map<Id<"courseVersion">, number>();
    for (const module of modules) {
      const current = modulesByVersion.get(module.courseVersionId) ?? 0;
      modulesByVersion.set(module.courseVersionId, current + 1);
    }

    return courses.map((course) => {
      const versionsForCourse = versionsByCourse.get(course._id) ?? [];
      let modulesCount = 0;
      if (versionsForCourse.length > 0) {
        const latestVersion = versionsForCourse.reduce((latest, current) =>
          current.versionNumber > latest.versionNumber ? current : latest
        );
        modulesCount = modulesByVersion.get(latestVersion._id) ?? 0;
      }

      return {
        id: course._id,
        title: course.title,
        status: course.status,
        department: departmentById.get(course.departmentId)?.name ?? "Unknown",
        priceShillings: course.priceShillings,
        modulesCount,
        enrollments: enrollmentCountByCourse.get(course._id) ?? 0,
        updatedAt: new Date(course._creationTime).toISOString(),
      } as const;
    });
  },
});

export const getCoursesWithDepartmentStats = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("course").collect();
    const departments = await ctx.db.query("department").collect();
    const enrollments = await ctx.db.query("enrollment").collect();

    const departmentById = new Map(departments.map((dept) => [dept._id, dept]));
    const enrollmentCountByCourse = new Map<Id<"course">, number>();

    for (const enrollment of enrollments) {
      const current = enrollmentCountByCourse.get(enrollment.courseId) ?? 0;
      enrollmentCountByCourse.set(enrollment.courseId, current + 1);
    }

    return courses.map((course) => ({
      course,
      department: departmentById.get(course.departmentId) ?? null,
      enrollments: enrollmentCountByCourse.get(course._id) ?? 0,
    }));
  },
});

export const getCourseStats = query({
  args: {},
  handler: async (ctx) => {
    const PERCENT_MULTIPLIER = 100;

    const courses = await ctx.db.query("course").collect();
    const enrollments = await ctx.db.query("enrollment").collect();
    const courseProgress = await ctx.db.query("courseProgress").collect();

    const totalCourses = courses.length;
    const activeCourses = courses.filter(
      (course) => course.status === "published"
    ).length;

    const uniqueStudents = new Set(
      enrollments.map((enrollment) => enrollment.userId)
    );
    const totalStudents = uniqueStudents.size;

    const totalEnrollments = enrollments.length;
    const completedEnrollments = courseProgress.filter(
      (progress) => progress.status === "completed"
    ).length;
    const completionRate =
      totalEnrollments === 0
        ? 0
        : Math.round(
            (completedEnrollments / totalEnrollments) * PERCENT_MULTIPLIER
          );

    return {
      totalCourses,
      activeCourses,
      totalStudents,
      completionRate,
    } as const;
  },
});

export const subscribeToCourseNotification = mutation({
  args: {
    courseId: v.id("course"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Verify course exists and is coming-soon
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new ConvexError("Course not found");
    }
    if (course.status !== "coming-soon") {
      throw new ConvexError("Can only subscribe to coming-soon courses");
    }

    // Check if already subscribed
    const existing = await ctx.db
      .query("courseNotification")
      .withIndex("user_course", (q) =>
        q.eq("userId", identity.subject).eq("courseId", args.courseId)
      )
      .first();

    if (existing) {
      return { success: true, alreadySubscribed: true } as const;
    }

    // Create subscription
    await ctx.db.insert("courseNotification", {
      userId: identity.subject,
      userEmail: identity.email ?? "",
      userName: identity.name ?? identity.email ?? "Learner",
      courseId: args.courseId,
      subscribedAt: new Date().toISOString(),
    });

    return { success: true, alreadySubscribed: false } as const;
  },
});

export const unsubscribeFromCourseNotification = mutation({
  args: {
    courseId: v.id("course"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const subscription = await ctx.db
      .query("courseNotification")
      .withIndex("user_course", (q) =>
        q.eq("userId", identity.subject).eq("courseId", args.courseId)
      )
      .first();

    if (subscription) {
      await ctx.db.delete(subscription._id);
    }

    return { success: true } as const;
  },
});

export const isSubscribedToCourse = query({
  args: {
    courseId: v.id("course"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const subscription = await ctx.db
      .query("courseNotification")
      .withIndex("user_course", (q) =>
        q.eq("userId", identity.subject).eq("courseId", args.courseId)
      )
      .first();

    return subscription !== null;
  },
});

export const getCourseNotificationSubscribers = query({
  args: {
    courseId: v.id("course"),
  },
  handler: async (ctx, args) => {
    // This query is only called from server-side actions (notifyCourseSubscribers)
    // No auth check needed as it's called from authenticated server context
    const subscriptions = await ctx.db
      .query("courseNotification")
      .withIndex("course", (q) => q.eq("courseId", args.courseId))
      .collect();

    return subscriptions.map((sub) => ({
      notificationId: sub._id,
      userId: sub.userId,
      userEmail: sub.userEmail,
      userName: sub.userName,
    }));
  },
});

export const deleteCourseNotification = mutation({
  args: {
    notificationId: v.id("courseNotification"),
  },
  handler: async (ctx, args) => {
    // This mutation is only called from the notification action
    // No additional auth check needed as it's called server-side
    await ctx.db.delete(args.notificationId);
  },
});
