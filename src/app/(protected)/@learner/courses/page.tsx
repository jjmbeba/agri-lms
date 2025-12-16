"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Filters, type Filter } from "@/components/ui/filters";
import { CoursesGrid } from "../../../../components/features/learner/courses/courses-grid";
import { CoursesHeader } from "../../../../components/features/learner/courses/courses-header";
import {
  getCourseFilterFields,
} from "../../../../components/features/learner/courses/course-filter-fields";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const Page = () => {
  const [filters, setFilters] = useState<Filter[]>([]);

  // Fetch filter options
  const { data: departments = [] } = useQuery(
    convexQuery(api.departments.getDepartments, {})
  );
  const { data: tags = [] } = useQuery(
    convexQuery(api.courses.getCourseTags, {})
  );
  const { data: priceRange = { min: 0, max: 0 } } = useQuery(
    convexQuery(api.courses.getCoursePriceRange, {})
  );

  // Convert Filters component filters to query format
  const queryFilters = useMemo(() => {
    const result: {
      title?: string;
      titleOperator?: "contains" | "not_contains" | "starts_with" | "ends_with" | "is";
      departmentIds?: Id<"department">[];
      status?: "published" | "coming-soon";
      priceMin?: number;
      priceMax?: number;
      tags?: string[];
      isEnrolled?: boolean;
    } = {};

    for (const filter of filters) {
      if (filter.field === "title" && filter.values.length > 0) {
        const titleValue = String(filter.values[0]).trim();
        if (titleValue.length > 0) {
          result.title = titleValue;
          // Map text operators to title operators
          const operator = filter.operator || "contains";
          if (
            operator === "contains" ||
            operator === "not_contains" ||
            operator === "starts_with" ||
            operator === "ends_with" ||
            operator === "is"
          ) {
            result.titleOperator = operator;
          } else {
            // Default to contains for unknown operators
            result.titleOperator = "contains";
          }
        }
      } else if (filter.field === "department" && filter.values.length > 0) {
        // Process department filter - default operator for multiselect is "is_any_of"
        // Handle is_any_of, includes_all, or if operator is not set (default behavior)
        if (
          !filter.operator ||
          filter.operator === "is_any_of" ||
          filter.operator === "includes_all"
        ) {
          // Convert values to Id<"department">[] - values come as strings from the UI
          const departmentIds = filter.values
            .map((v) => {
              // Handle both string and Id types
              const value = typeof v === "string" ? v : String(v);
              return value as Id<"department">;
            })
            .filter((id): id is Id<"department"> => Boolean(id));
          
          if (departmentIds.length > 0) {
            result.departmentIds = departmentIds;
          }
        }
        // Note: is_not_any_of and excludes_all would need inverse logic
      } else if (filter.field === "status" && filter.values.length > 0) {
        result.status = filter.values[0] as "published" | "coming-soon";
      } else if (filter.field === "price") {
        // Helper to safely parse number from string
        const parseNumber = (value: unknown): number | null => {
          if (value === null || value === undefined) return null;
          const str = String(value).trim();
          if (str === "") return null;
          const num = Number(str);
          return Number.isNaN(num) ? null : num;
        };

        // numberrange type supports: between, overlaps, contains, empty, not_empty
        if (filter.operator === "between" && filter.values.length >= 2) {
          const min = parseNumber(filter.values[0]);
          const max = parseNumber(filter.values[1]);
          if (min !== null) result.priceMin = min;
          if (max !== null) result.priceMax = max;
        } else if (filter.operator === "overlaps" && filter.values.length >= 2) {
          // For overlaps: course price range overlaps with filter range
          // This means: course.min <= filter.max && course.max >= filter.min
          // We'll treat it similar to between for now
          const min = parseNumber(filter.values[0]);
          const max = parseNumber(filter.values[1]);
          if (min !== null) result.priceMin = min;
          if (max !== null) result.priceMax = max;
        } else if (filter.operator === "contains" && filter.values.length >= 2) {
          // For contains: filter range is contained within course price range
          // This means: course.min <= filter.min && course.max >= filter.max
          // We'll treat it similar to between for now
          const min = parseNumber(filter.values[0]);
          const max = parseNumber(filter.values[1]);
          if (min !== null) result.priceMin = min;
          if (max !== null) result.priceMax = max;
        }
        // empty and not_empty operators don't need price values
      } else if (filter.field === "tags" && filter.values.length > 0) {
        result.tags = filter.values as string[];
      } else if (filter.field === "isEnrolled" && filter.values.length > 0) {
        result.isEnrolled = filter.values[0] as boolean;
      }
    }

    // Only return filters object if there are any filters
    return Object.keys(result).length > 0 ? result : undefined;
  }, [filters]);

  // Fetch filtered courses
  const { data: courses = [], isLoading } = useQuery(
    convexQuery(api.courses.getPublishedCourses, {
      filters: queryFilters,
    })
  );

  // Get filter fields configuration
  const filterFields = useMemo(
    () =>
      getCourseFilterFields({
        departments,
        tags,
        priceRange,
      }),
    [departments, tags, priceRange]
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <CoursesHeader />
      <Filters
        filters={filters}
        fields={filterFields}
        onChange={setFilters}
        variant="outline"
        size="md"
      />
      <CoursesGrid courses={courses} isLoading={isLoading} />
    </div>
  );
};

export default Page;
