"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { useCallback, useState } from "react";
import type { api } from "../../../../../convex/_generated/api";
import { CourseFilters } from "./course-filters";
import { CourseGrid } from "./course-grid";
import { CourseStats } from "./course-stats";

type CourseManagerProps = {
  preloadedCourses: Preloaded<typeof api.courses.getCourses>;
};

export function CourseManager({ preloadedCourses }: CourseManagerProps) {
  const coursesWithCategory = usePreloadedQuery(preloadedCourses);

  const [filteredCourses, setFilteredCourses] =
    useState<typeof coursesWithCategory>(coursesWithCategory);

  const handleFiltersChange = useCallback(
    (filters: {
      searchTerm: string;
      selectedDepartment: string;
      selectedStatus: string;
      sortBy: string;
    }) => {
      let filtered = coursesWithCategory.filter((courseWithCategory) => {
        const matchesSearch = courseWithCategory.course.title
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase());
        const matchesDepartment =
          filters.selectedDepartment === "All Departments" ||
          courseWithCategory.department?.name.toLowerCase() ===
            filters.selectedDepartment.toLowerCase();
        const matchesStatus =
          filters.selectedStatus === "All Status" ||
          courseWithCategory.course?.status?.toLowerCase() ===
            filters.selectedStatus.toLowerCase();

        return matchesSearch && matchesDepartment && matchesStatus;
      });

      // Sort the filtered results
      filtered = [...filtered].sort((a, b) => {
        switch (filters.sortBy) {
          case "title":
            return a.course.title.localeCompare(b.course.title);
          // case "students":
          //   return b.course.enrolledStudents - a.course.enrolledStudents;
          // case "completion":
          //   return b.course.completionRate - a.course.completionRate;
          case "updated":
            return (
              new Date(b.course._creationTime).getTime() -
              new Date(a.course._creationTime).getTime()
            );
          default:
            return 0;
        }
      });

      setFilteredCourses(filtered);
    },
    [coursesWithCategory]
  );

  return (
    <>
      <CourseStats coursesCount={coursesWithCategory.length} />

      <div className="px-4 lg:px-6">
        <CourseFilters onFiltersChange={handleFiltersChange} />
      </div>

      <div className="px-4 lg:px-6">
        <CourseGrid coursesWithDepartment={filteredCourses} />
      </div>
    </>
  );
}
