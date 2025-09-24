"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import type { api } from "../../../../convex/_generated/api";
import { CourseDetailsHeader } from "./course-details-header";
import { CourseDetailsStats } from "./course-details-stats";

type Props = {
  preloadedCourse: Preloaded<typeof api.courses.getCourse>;
};

const CourseDetails = ({ preloadedCourse }: Props) => {
  const course = usePreloadedQuery(preloadedCourse);

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <>
      <CourseDetailsHeader course={course} />
      <CourseDetailsStats course={course} />
    </>
  );
};

export default CourseDetails;
