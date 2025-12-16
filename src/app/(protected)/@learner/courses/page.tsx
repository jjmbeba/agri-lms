"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { usePaginatedQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { type Filter, Filters } from "@/components/ui/filters";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { getCourseFilterFields } from "../../../../components/features/learner/courses/course-filter-fields";
import { CoursesGrid } from "../../../../components/features/learner/courses/courses-grid";
import { CoursesHeader } from "../../../../components/features/learner/courses/courses-header";

const ITEMS_PER_PAGE = 12;

type TitleOperator =
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "is";

const parseNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const str = String(value).trim();
  if (str === "") {
    return null;
  }
  const num = Number(str);
  return Number.isNaN(num) ? null : num;
};

const mapTitleOperator = (operator?: string): TitleOperator => {
  const allowed: TitleOperator[] = [
    "contains",
    "not_contains",
    "starts_with",
    "ends_with",
    "is",
  ];
  if (operator && allowed.includes(operator as TitleOperator)) {
    return operator as TitleOperator;
  }
  return "contains";
};

const applyTitleFilter = (filter: Filter, result: QueryFilters) => {
  const titleValue = String(filter.values[0]).trim();
  if (!titleValue) {
    return;
  }
  result.title = titleValue;
  result.titleOperator = mapTitleOperator(filter.operator);
};

const applyDepartmentFilter = (filter: Filter, result: QueryFilters) => {
  const isAllowedOperator =
    !filter.operator ||
    filter.operator === "is_any_of" ||
    filter.operator === "includes_all";

  if (!isAllowedOperator) {
    return;
  }

  const departmentIds = filter.values
    .map((value) => (typeof value === "string" ? value : String(value)))
    .filter((id): id is Id<"department"> => Boolean(id));

  if (departmentIds.length) {
    result.departmentIds = departmentIds;
  }
};

const applyStatusFilter = (filter: Filter, result: QueryFilters) => {
  result.status = filter.values[0] as "published" | "coming-soon";
};

const applyPriceFilter = (filter: Filter, result: QueryFilters) => {
  const [first, second] = filter.values;
  const min = parseNumber(first);
  const max = parseNumber(second);

  const supportsRange =
    filter.operator === "between" ||
    filter.operator === "overlaps" ||
    filter.operator === "contains";

  if (!supportsRange) {
    return;
  }

  if (min !== null) {
    result.priceMin = min;
  }
  if (max !== null) {
    result.priceMax = max;
  }
};

const applyTagsFilter = (filter: Filter, result: QueryFilters) => {
  result.tags = filter.values as string[];
};

const applyEnrollmentFilter = (filter: Filter, result: QueryFilters) => {
  result.isEnrolled = filter.values[0] as boolean;
};

const buildQueryFilters = (filters: Filter[]): QueryFilters | undefined => {
  const result: QueryFilters = {};

  for (const filter of filters) {
    if (!filter.values.length) {
      continue;
    }

    switch (filter.field) {
      case "title":
        applyTitleFilter(filter, result);
        break;
      case "department":
        applyDepartmentFilter(filter, result);
        break;
      case "status":
        applyStatusFilter(filter, result);
        break;
      case "price":
        applyPriceFilter(filter, result);
        break;
      case "tags":
        applyTagsFilter(filter, result);
        break;
      case "isEnrolled":
        applyEnrollmentFilter(filter, result);
        break;
      default:
        break;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
};

type QueryFilters = {
  title?: string;
  titleOperator?: TitleOperator;
  departmentIds?: Id<"department">[];
  status?: "published" | "coming-soon";
  priceMin?: number;
  priceMax?: number;
  tags?: string[];
  isEnrolled?: boolean;
};

const Page = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

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
  const queryFilters = useMemo(() => buildQueryFilters(filters), [filters]);

  // Fetch filtered courses with pagination
  const {
    results: courses,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.courses.getPublishedCourses,
    {
      filters: queryFilters,
    },
    { initialNumItems: ITEMS_PER_PAGE }
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [queryFilters]);

  // Load more items when navigating to a new page
  useEffect(() => {
    const itemsNeeded = currentPage * ITEMS_PER_PAGE;
    if (
      courses.length < itemsNeeded &&
      status === "CanLoadMore" &&
      !isLoading
    ) {
      const itemsToLoad = itemsNeeded - courses.length;
      loadMore(itemsToLoad);
    }
  }, [currentPage, courses.length, status, loadMore, isLoading]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
        fields={filterFields}
        filters={filters}
        onChange={setFilters}
        size="md"
        variant="outline"
      />
      <CoursesGrid
        courses={courses}
        currentPage={currentPage}
        hasNextPage={status === "CanLoadMore"}
        isLoading={isLoading}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Page;
