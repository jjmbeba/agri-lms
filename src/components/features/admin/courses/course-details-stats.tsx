"use client";

import {
  IconBook,
  IconClock,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";

type CourseDetailsStatsProps = {
  course: {
    course: Doc<"course">;
    modulesCount: number;
    department: Doc<"department"> | null;
  };
};

export function CourseDetailsStats({ course }: CourseDetailsStatsProps) {
  const reviewSummary = useQuery(api.reviews.getCourseReviewSummary, {
    courseId: course.course._id,
  });

  const enrollmentData = useQuery(api.enrollments.getCourseEnrollmentCount, {
    courseId: course.course._id,
  });

  const averageRating = reviewSummary?.averageRating ?? 0;
  const totalReviews = reviewSummary?.totalReviews ?? 0;
  const enrolledStudents = enrollmentData?.count ?? 0;
  const percentageChange = enrollmentData?.percentageChange;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">
            Enrolled Students
          </CardTitle>
          <IconUsers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{enrolledStudents}</div>
          <p className="text-muted-foreground text-xs">
            {percentageChange !== null && percentageChange !== undefined
              ? `${percentageChange > 0 ? "+" : ""}${percentageChange}% from last month`
              : "No previous data"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Modules</CardTitle>
          <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{course?.modulesCount}</div>
          <p className="text-muted-foreground text-xs">
            Total published modules
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Average Rating</CardTitle>
          <IconBook className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {totalReviews > 0 ? averageRating.toFixed(1) : "N/A"}
          </div>
          <p className="text-muted-foreground text-xs">
            {totalReviews > 0
              ? `Based on ${totalReviews} review${totalReviews === 1 ? "" : "s"}`
              : "No reviews yet"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
