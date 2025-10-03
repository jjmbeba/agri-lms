"use client";

import { type Preloaded, usePreloadedQuery, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CourseContent } from "./course-content";
import { CourseHeader } from "./course-header";
import { CourseStats } from "./course-stats";

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

  return (
    <div className="space-y-6">
      <CourseHeader course={course} />
      <CourseStats course={course} />
      <CourseContent
        isEnrolled={course.isEnrolled}
        modules={modules ? [...modules] : []}
        modulesCount={course.modulesCount}
      />
    </div>
  );
};
