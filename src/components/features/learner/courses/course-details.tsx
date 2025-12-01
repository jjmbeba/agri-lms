"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { type Preloaded, usePreloadedQuery, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { EnrolledCourseView } from "./enrolled-course-view";
import { NonEnrolledCourseView } from "./non-enrolled-course-view";

type Props = {
  preloadedCourse: Preloaded<typeof api.courses.getCourseBySlug>;
  courseId: Id<"course">;
};

export const CourseDetails = ({ preloadedCourse, courseId }: Props) => {
  const course = usePreloadedQuery(preloadedCourse);

  const modules = useQuery(
    api.modules.getModulesByLatestVersionId,
    course ? { courseId: course.course._id } : "skip"
  );
  const { data: progress } = useSuspenseQuery(
    convexQuery(api.enrollments.getUserCourseProgress, {
      courseId: course?.course._id ?? courseId,
    })
  );

  if (!course) {
    return (
      <div className="py-12 text-center">
        <h3 className="mb-2 font-semibold text-lg">Course not found</h3>
        <p className="text-muted-foreground">
          The course may have been removed.
        </p>
      </div>
    );
  }

  const moduleAccessCount = course.moduleAccess?.count ?? 0;
  const hasFullAccess = course.isEnrolled;
  const hasPartialAccess = moduleAccessCount > 0;
  const shouldShowLearnerView = hasFullAccess || hasPartialAccess;
  const normalizedModules = modules ? [...modules] : [];

  if (shouldShowLearnerView) {
    return (
      <EnrolledCourseView
        course={course}
        hasFullAccess={hasFullAccess}
        modules={normalizedModules}
        progress={
          progress ?? {
            progressPercentage: 0,
            modulesCompleted: 0,
            totalModules: 0,
            modulesProgress: [],
          }
        }
        unlockedModuleCount={moduleAccessCount}
      />
    );
  }

  return (
    <NonEnrolledCourseView
      course={course}
      courseId={course.course._id}
      isEnrolled={course.isEnrolled}
      modules={normalizedModules}
    />
  );
};
