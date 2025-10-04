"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import type { api } from "../../../../../convex/_generated/api";
import { CourseCard } from "./course-card";
import { EmptyState } from "./empty-state";

type CoursesGridProps = {
  preloadedCourses: Preloaded<typeof api.courses.getPublishedCourses>;
};

export const CoursesGrid = ({ preloadedCourses }: CoursesGridProps) => {
  const courses = usePreloadedQuery(preloadedCourses);

  if (courses.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((item) => (
        <CourseCard data={item} key={item.course._id} />
      ))}
    </div>
  );
};
