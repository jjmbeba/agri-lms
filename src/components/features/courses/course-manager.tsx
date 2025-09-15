"use client";

import { useCallback, useState } from "react";
import { CourseFilters } from "./course-filters";
import { CourseGrid } from "./course-grid";
import { CourseStats } from "./course-stats";
import type { CourseWithCategory } from "./types";

// type Course = {
//   id: number;
//   title: string;
//   instructor: string;
//   category: string;
//   status: string;
//   enrolledStudents: number;
//   completionRate: number;
//   duration: string;
//   lastUpdated: string;
//   thumbnail: string;
//   description: string;
// };

type CourseManagerProps = {
  coursesWithCategory: CourseWithCategory[];
};

export function CourseManager({ coursesWithCategory }: CourseManagerProps) {
  const [filteredCourses, setFilteredCourses] =
    useState<CourseWithCategory[]>(coursesWithCategory);

  const handleFiltersChange = useCallback(
    (filters: {
      searchTerm: string;
      selectedCategory: string;
      selectedStatus: string;
      sortBy: string;
    }) => {
      let filtered = coursesWithCategory.filter((courseWithCategory) => {
        const matchesSearch = courseWithCategory.course.title
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase());
        const matchesCategory =
          filters.selectedCategory === "All Categories" ||
          courseWithCategory.category?.name.toLowerCase() ===
            filters.selectedCategory.toLowerCase();
        const matchesStatus =
          filters.selectedStatus === "All Status" ||
          courseWithCategory.course?.status?.toLowerCase() ===
            filters.selectedStatus.toLowerCase();

        return matchesSearch && matchesCategory && matchesStatus;
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
              new Date(b.course.updatedAt).getTime() -
              new Date(a.course.updatedAt).getTime()
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
      <CourseStats coursesWithCategory={coursesWithCategory} />

      <div className="px-4 lg:px-6">
        <CourseFilters onFiltersChange={handleFiltersChange} />
      </div>

      <div className="px-4 lg:px-6">
        <CourseGrid courses={filteredCourses} />
      </div>
    </>
  );
}
