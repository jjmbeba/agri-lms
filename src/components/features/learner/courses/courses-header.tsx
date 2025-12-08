"use client";

import { CourseRequestDialog } from "./course-request-dialog";

export const CoursesHeader = () => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">
          Browse Courses
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Explore available courses and start learning.
        </p>
      </div>
      <CourseRequestDialog />
    </div>
  );
};
