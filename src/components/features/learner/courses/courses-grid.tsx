"use client";

import { Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
};

const createRange = (start: number, end: number): number[] => {
  if (end < start) {
    return [];
  }
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const buildPageList = (
  currentPage: number,
  totalPages: number,
  maxVisiblePages = 5
): (number | "ellipsis")[] => {
  if (totalPages <= maxVisiblePages) {
    return createRange(1, totalPages);
  }

  const pages: (number | "ellipsis")[] = [1];
  const windowSize = 3;
  const halfWindow = Math.floor(windowSize / 2);

  let start = Math.max(2, currentPage - halfWindow);
  let end = Math.min(totalPages - 1, currentPage + halfWindow);

  if (start <= 2) {
    start = 2;
    end = Math.min(totalPages - 1, start + windowSize - 1);
  }

  if (end >= totalPages - 1) {
    end = totalPages - 1;
    start = Math.max(2, end - windowSize + 1);
  }

  if (start > 2) {
    pages.push("ellipsis");
  }

  pages.push(...createRange(start, end));

  if (end < totalPages - 1) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);
  return pages;
};

export const CoursesGrid = ({
  courses,
  isLoading,
  currentPage,
  itemsPerPage,
  hasNextPage,
  onPageChange,
}: CoursesGridProps) => {
  if (isLoading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (courses.length === 0 && !isLoading) {
    return <EmptyState />;
  }

  // Calculate pagination info
  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageCourses = courses.slice(startIndex, endIndex);

  const pageNumbers = buildPageList(currentPage, totalPages);

  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 1) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage || currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {currentPageCourses.map((item) => (
          <CourseCard data={item} key={item.course._id} />
        ))}
      </div>
      {(totalPages > 1 || hasNextPage) && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={currentPage === 1}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
                onClick={(e) => {
                  e.preventDefault();
                  handlePrevious();
                }}
              />
            </PaginationItem>

            {(() => {
              let ellipsisId = 0;
              return pageNumbers.map((page) => {
                if (page === "ellipsis") {
                  ellipsisId += 1;
                  return (
                    <PaginationItem
                      key={`ellipsis-${currentPage}-${ellipsisId}`}
                    >
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={`page-${page}`}>
                    <PaginationLink
                      className="cursor-pointer"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageClick(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              });
            })()}

            <PaginationItem>
              <PaginationNext
                aria-disabled={!hasNextPage && currentPage >= totalPages}
                className={
                  !hasNextPage && currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
                onClick={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      {isLoading && (
        <div className="flex justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};
