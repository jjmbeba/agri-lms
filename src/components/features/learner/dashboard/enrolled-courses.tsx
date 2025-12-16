"use client";

import { convexQuery } from "@convex-dev/react-query";
import { IconBook, IconClock, IconStar, IconVideo } from "@tabler/icons-react";
import { useQueries, useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "../../../../../convex/_generated/api";

export function EnrolledCourses() {
  const { data: courses } = useSuspenseQuery(
    convexQuery(api.enrollments.getUserEnrolledCourses, {})
  );

  // Fetch ratings for all courses in parallel
  const validCourses = courses.filter((record) => record.course?._id);
  const ratingQueries = useQueries({
    queries: validCourses.map((record) =>
      convexQuery(api.reviews.getCourseReviewSummary, {
        courseId: record.course!._id,
      })
    ),
  });

  // Create a map of courseId -> rating for quick lookup
  const ratingsMap = new Map<string, number | null>();
  validCourses.forEach((record, index) => {
    const courseId = record.course?._id;
    if (courseId) {
      const ratingData = ratingQueries[index]?.data;
      ratingsMap.set(courseId, ratingData?.averageRating ?? null);
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
          <CardDescription>
            Your enrolled courses will appear here
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <IconBook className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 font-semibold text-lg">No courses enrolled</h3>
          <p className="mb-4 text-center text-muted-foreground">
            Start your learning journey by enrolling in a course.
          </p>
          <Button asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
        <CardDescription>
          Continue your learning journey with these enrolled courses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((record) => {
            const course = record.course;
            const progress = record.progress;

            return (
              <Card
                className="group transition-shadow hover:shadow-lg"
                key={course?._id}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2 text-lg">
                        {course?.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {course?.description}
                      </CardDescription>
                    </div>
                    {course?._id && (
                      <div className="flex items-center gap-1">
                        <IconStar className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-sm">
                          {(() => {
                            const rating = ratingsMap.get(course._id);
                            return rating !== null && rating !== undefined
                              ? rating.toFixed(1)
                              : "N/A";
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {progress?.progressPercentage}%
                    </span>
                  </div>
                  <Progress
                    className="h-2"
                    value={progress?.progressPercentage}
                  />
                  {/* <div className="flex items-center justify-between text-muted-foreground text-sm">
                  <span>by {course.instructor}</span>
                </div> */}

                  <Button asChild className="w-full">
                    <Link href={`/courses/${course?.slug}`}>
                      <IconVideo className="mr-2 h-4 w-4" />
                      {progress?.progressPercentage &&
                      progress?.progressPercentage > 0
                        ? "Continue"
                        : "Start Course"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
