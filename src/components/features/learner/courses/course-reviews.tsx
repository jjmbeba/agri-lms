"use client";

import { useMutation, useQuery } from "convex/react";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

type CourseReviewsProps = {
  courseId: Id<"course">;
  isEnrolled: boolean;
};

const StarRating = ({
  rating,
  onRatingChange,
  readonly = false,
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= (hoverRating || rating);
        return (
          <button
            aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
            className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer"}`}
            disabled={readonly}
            key={value}
            onClick={() => handleClick(value)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !readonly) {
                e.preventDefault();
                handleClick(value);
              }
            }}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            tabIndex={readonly ? -1 : 0}
            type="button"
          >
            <Star
              className={`size-6 ${
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-none text-gray-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

const ReviewForm = ({
  courseId,
  existingReview,
}: {
  courseId: Id<"course">;
  existingReview: {
    _id: Id<"courseReview">;
    rating: number;
    comment: string;
  } | null;
}) => {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReview = useMutation(api.reviews.submitReview);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Please write at least 10 characters in your review");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReview({
        courseId,
        rating,
        comment: comment.trim(),
      });
      toast.success(
        existingReview ? "Review updated successfully" : "Review submitted successfully"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit review"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="font-medium text-sm" htmlFor="rating">
          Your Rating
        </label>
        <StarRating onRatingChange={setRating} rating={rating} />
      </div>

      <div className="space-y-2">
        <label className="font-medium text-sm" htmlFor="comment">
          Your Review
        </label>
        <Textarea
          className="min-h-[120px]"
          id="comment"
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this course..."
          value={comment}
        />
      </div>

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting
          ? "Submitting..."
          : existingReview
            ? "Update Review"
            : "Submit Review"}
      </Button>
    </form>
  );
};

const ReviewItem = ({
  review,
}: {
  review: {
    _id: Id<"courseReview">;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
  };
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-2 border-b pb-4 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-medium text-sm">{review.userName}</p>
          <p className="text-muted-foreground text-xs">
            {formatDate(review.createdAt)}
            {review.updatedAt !== review.createdAt && " (edited)"}
          </p>
        </div>
        <StarRating rating={review.rating} readonly />
      </div>
      <p className="text-sm">{review.comment}</p>
    </div>
  );
};

export const CourseReviews = ({ courseId, isEnrolled }: CourseReviewsProps) => {
  const summary = useQuery(api.reviews.getCourseReviewSummary, { courseId });
  const reviews = useQuery(api.reviews.getCourseReviews, {
    courseId,
    limit: 20,
  });
  const userReview = useQuery(api.reviews.getUserReview, { courseId });

  if (!summary || !reviews) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Course Rating</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.totalReviews === 0 ? (
            <p className="text-muted-foreground">
              No reviews yet. Be the first to review this course!
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-bold text-4xl">
                    {summary.averageRating.toFixed(1)}
                  </div>
                  <StarRating rating={Math.round(summary.averageRating)} readonly />
                  <p className="mt-1 text-muted-foreground text-sm">
                    {summary.totalReviews} review{summary.totalReviews !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div className="flex items-center gap-2" key={star}>
                      <span className="text-sm">{star}</span>
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-yellow-400"
                          style={{
                            width: `${summary.totalReviews > 0 ? (summary.ratingDistribution[star as 1 | 2 | 3 | 4 | 5] / summary.totalReviews) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground text-xs">
                        {summary.ratingDistribution[star as 1 | 2 | 3 | 4 | 5]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form for enrolled users */}
      {isEnrolled && (
        <Card>
          <CardHeader>
            <CardTitle>
              {userReview ? "Edit Your Review" : "Write a Review"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm courseId={courseId} existingReview={userReview} />
          </CardContent>
        </Card>
      )}

      {/* List of Reviews */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reviews ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewItem key={review._id} review={review} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

