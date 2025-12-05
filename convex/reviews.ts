import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MIN_RATING = 1;
const MAX_RATING = 5;
const DEFAULT_REVIEW_LIMIT = 20;

export const submitReview = mutation({
  args: {
    courseId: v.id("course"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Validate rating
    if (args.rating < MIN_RATING || args.rating > MAX_RATING) {
      throw new ConvexError(
        `Rating must be between ${MIN_RATING} and ${MAX_RATING}`
      );
    }

    // Check if user is enrolled
    const enrollment = await ctx.db
      .query("enrollment")
      .withIndex("user_course", (q) =>
        q.eq("userId", identity.subject).eq("courseId", args.courseId)
      )
      .first();

    if (!enrollment) {
      throw new ConvexError("You must be enrolled in this course to review it");
    }

    // Check if user already has a review
    const existingReview = await ctx.db
      .query("courseReview")
      .withIndex("user_course", (q) =>
        q.eq("userId", identity.subject).eq("courseId", args.courseId)
      )
      .first();

    const now = new Date().toISOString();
    const userName = identity.name ?? identity.email ?? "Anonymous";

    if (existingReview) {
      // Update existing review
      await ctx.db.patch(existingReview._id, {
        rating: args.rating,
        comment: args.comment,
        updatedAt: now,
      });
      return { success: true, reviewId: existingReview._id };
    }

    // Create new review
    const reviewId = await ctx.db.insert("courseReview", {
      courseId: args.courseId,
      enrollmentId: enrollment._id,
      userId: identity.subject,
      userName,
      rating: args.rating,
      comment: args.comment,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, reviewId };
  },
});

export const getCourseReviews = query({
  args: {
    courseId: v.id("course"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? DEFAULT_REVIEW_LIMIT;

    const reviews = await ctx.db
      .query("courseReview")
      .withIndex("course", (q) => q.eq("courseId", args.courseId))
      .order("desc")
      .take(limit);

    return reviews;
  },
});

export const getCourseReviewSummary = query({
  args: {
    courseId: v.id("course"),
  },
  handler: async (ctx, args) => {
    // Use the index on courseId for efficient querying
    // The index ensures we only scan reviews for this specific course
    const reviews = await ctx.db
      .query("courseReview")
      .withIndex("course", (q) => q.eq("courseId", args.courseId))
      .collect();

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          [MIN_RATING]: 0,
          2: 0,
          3: 0,
          4: 0,
          [MAX_RATING]: 0,
        },
      };
    }

    // Calculate statistics efficiently by iterating once
    let totalRating = 0;
    const ratingDistribution = {
      [MIN_RATING]: 0,
      2: 0,
      3: 0,
      4: 0,
      [MAX_RATING]: 0,
    };

    for (const review of reviews) {
      totalRating += review.rating;
      const rating = Math.floor(review.rating) as 1 | 2 | 3 | 4 | 5;
      if (rating >= MIN_RATING && rating <= MAX_RATING) {
        ratingDistribution[rating]++;
      }
    }

    const averageRating = totalRating / reviews.length;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  },
});

export const getUserReview = query({
  args: {
    courseId: v.id("course"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const review = await ctx.db
      .query("courseReview")
      .withIndex("user_course", (q) =>
        q.eq("userId", identity.subject).eq("courseId", args.courseId)
      )
      .first();

    return review;
  },
});

export const deleteReview = mutation({
  args: {
    reviewId: v.id("courseReview"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new ConvexError("Review not found");
    }

    if (review.userId !== identity.subject) {
      throw new ConvexError("You can only delete your own reviews");
    }

    await ctx.db.delete(args.reviewId);
    return { success: true };
  },
});
