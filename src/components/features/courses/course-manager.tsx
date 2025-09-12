"use client";

import { useState } from "react";

import { CourseFilters } from "./course-filters";
import { CourseGrid } from "./course-grid";
import { CourseStats } from "./course-stats";

type Course = {
  id: number;
  title: string;
  instructor: string;
  category: string;
  status: string;
  enrolledStudents: number;
  completionRate: number;
  duration: string;
  lastUpdated: string;
  thumbnail: string;
  description: string;
};

type CourseManagerProps = {
  courses: Course[];
};

export function CourseManager({ courses }: CourseManagerProps) {
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(courses);

  const handleFiltersChange = (filters: {
    searchTerm: string;
    selectedCategory: string;
    selectedStatus: string;
    sortBy: string;
  }) => {
    let filtered = courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        course.instructor
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase());
      const matchesCategory =
        filters.selectedCategory === "All Categories" ||
        course.category === filters.selectedCategory;
      const matchesStatus =
        filters.selectedStatus === "All Status" ||
        course.status === filters.selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort the filtered results
    filtered = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "students":
          return b.enrolledStudents - a.enrolledStudents;
        case "completion":
          return b.completionRate - a.completionRate;
        case "updated":
          return (
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  };

  return (
    <>
      <CourseStats courses={courses} />

      <div className="px-4 lg:px-6">
        <CourseFilters onFiltersChange={handleFiltersChange} />
      </div>

      <div className="px-4 lg:px-6">
        <CourseGrid courses={filteredCourses} />
      </div>
    </>
  );
}
