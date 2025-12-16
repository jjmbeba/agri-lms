"use client";

import { Loader2 } from "lucide-react";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { CourseCard } from "./course-card";
import { EmptyState } from "./empty-state";

type CourseData = {
  course: Doc<"course">;
  department: Doc<"department"> | null;
  isEnrolled: boolean;
  moduleAccess: {
    count: number;
    moduleIds: Id<"module">[];
  };
};

type CoursesGridProps = {
  courses: CourseData[];
  isLoading?: boolean;
};

export const CoursesGrid = ({ courses, isLoading }: CoursesGridProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
