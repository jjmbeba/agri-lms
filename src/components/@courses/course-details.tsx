"use client";

import { type Preloaded, usePreloadedQuery, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { EnrolledCourseView } from "./enrolled-course-view";
import { NonEnrolledCourseView } from "./non-enrolled-course-view";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";

type Props = {
  preloadedCourse: Preloaded<typeof api.courses.getCourse>;
};

export const CourseDetails = ({ preloadedCourse }: Props) => {
  const course = usePreloadedQuery(preloadedCourse);
  const modules = useQuery(
    api.modules.getModulesByLatestVersionId,
    course ? { courseId: course.course._id } : "skip"
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

  const {data: progress} = useSuspenseQuery(
    convexQuery(api.enrollments.getUserCourseProgress, {
      courseId: course.course._id,
    })
  )

  if (course.isEnrolled) {
    return (
      <EnrolledCourseView
        course={course}
        modules={modules ? [...modules] : []}
        progress={progress}
      />
    );
  }

  return (
    <NonEnrolledCourseView
      course={course}
      modules={modules ? [...modules] : []}
      isEnrolled={course.isEnrolled}
      courseId={course.course._id}
    />
  );
};
