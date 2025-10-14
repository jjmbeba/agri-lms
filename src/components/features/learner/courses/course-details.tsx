"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { type Preloaded, usePreloadedQuery, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { EnrolledCourseView } from "./enrolled-course-view";
import { NonEnrolledCourseView } from "./non-enrolled-course-view";

type Props = {
  preloadedCourse: Preloaded<typeof api.courses.getCourse>;
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

  if (course.isEnrolled) {
    return (
      <EnrolledCourseView
        course={course}
        modules={modules ? [...modules] : []}
        progress={
          progress ?? {
            progressPercentage: 0,
            modulesCompleted: 0,
            totalModules: 0,
            modulesProgress: [],
          }
        }
      />
    );
  }

  return (
    <NonEnrolledCourseView
      course={course}
      courseId={course.course._id}
      isEnrolled={course.isEnrolled}
      modules={modules ? [...modules] : []}
    />
  );
};
