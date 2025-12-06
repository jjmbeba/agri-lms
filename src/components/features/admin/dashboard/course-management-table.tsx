"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/features/admin/dashboard/data-table";
import { api } from "../../../../../convex/_generated/api";

export function CourseManagementTable() {
  const { data } = useSuspenseQuery(
    convexQuery(api.courses.getCoursesWithStats, {})
  );

  return <DataTable data={data} />;
}

