import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const submitAdmissionForm = mutation({
  args: {
    courseId: v.id("course"),
    applicantPersonalDetails: v.object({
      title: v.string(),
      name: v.string(),
      idNo: v.string(),
      email: v.string(),
      phone: v.string(),
      county: v.string(),
      subCounty: v.string(),
      ward: v.string(),
    }),
    nextOfKinDetails: v.object({
      name: v.string(),
      relationship: v.string(),
      phoneNo: v.string(),
    }),
    declaration: v.object({
      signature: v.string(),
      date: v.string(),
    }),
    courseSelection: v.object({
      department: v.string(),
      courseName: v.string(),
      courseMode: v.union(
        v.literal("Fully virtual"),
        v.literal("Partially virtual")
      ),
      feeTerms: v.union(v.literal("per module"), v.literal("for full course")),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new ConvexError("Course not found");
    }

    // Check if admission form already exists for this user and course
    const existingForm = await ctx.db
      .query("admissionForm")
      .withIndex("user_course", (q) =>
        q.eq("userId", identity.subject).eq("courseId", args.courseId)
      )
      .first();

    const now = new Date().toISOString();

    if (existingForm) {
      // Update existing form
      await ctx.db.patch(existingForm._id, {
        applicantPersonalDetails: args.applicantPersonalDetails,
        nextOfKinDetails: args.nextOfKinDetails,
        declaration: args.declaration,
        courseSelection: args.courseSelection,
        submittedAt: now,
      });
      return { success: true, admissionFormId: existingForm._id };
    }

    // Create new admission form
    const admissionFormId = await ctx.db.insert("admissionForm", {
      userId: identity.subject,
      courseId: args.courseId,
      applicantPersonalDetails: args.applicantPersonalDetails,
      nextOfKinDetails: args.nextOfKinDetails,
      declaration: args.declaration,
      courseSelection: args.courseSelection,
      submittedAt: now,
    });

    return { success: true, admissionFormId };
  },
});

export const getAdmissionFormByCourse = query({
  args: {
    courseId: v.id("course"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const admissionForm = await ctx.db
      .query("admissionForm")
      .withIndex("user_course", (q) =>
        q.eq("userId", identity.subject).eq("courseId", args.courseId)
      )
      .first();

    return admissionForm;
  },
});

export const getAdmissionFormByEnrollment = query({
  args: {
    enrollmentId: v.id("enrollment"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const admissionForm = await ctx.db
      .query("admissionForm")
      .withIndex("enrollment", (q) =>
        q.eq("enrollmentId", args.enrollmentId)
      )
      .first();

    // Verify the form belongs to the current user
    if (admissionForm && admissionForm.userId !== identity.subject) {
      return null;
    }

    return admissionForm;
  },
});

export const linkAdmissionFormToEnrollment = mutation({
  args: {
    admissionFormId: v.id("admissionForm"),
    enrollmentId: v.id("enrollment"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const admissionForm = await ctx.db.get(args.admissionFormId);
    if (!admissionForm) {
      throw new ConvexError("Admission form not found");
    }

    if (admissionForm.userId !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      throw new ConvexError("Enrollment not found");
    }

    if (enrollment.userId !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(args.admissionFormId, {
      enrollmentId: args.enrollmentId,
    });

    return { success: true };
  },
});

