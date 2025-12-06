"use client";

import {
  IconBook,
  IconBuilding,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import type { api } from "../../../../../convex/_generated/api";
import DepartmentHeaderCard from "./department-header-card";

type Props = {
  preloadedDepartments: Preloaded<typeof api.departments.getDepartmentStats>;
};

const DepartmentStatCards = ({ preloadedDepartments }: Props) => {
  const stats = usePreloadedQuery(preloadedDepartments);

  const totalDepartments = stats?.totalDepartments ?? 0;
  const totalStudents = stats?.totalStudents ?? 0;
  const totalCourses = stats?.totalCourses ?? 0;
  const growthRate = stats?.enrollmentGrowthPct ?? 0;

  return (
    <div className="px-4 lg:px-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DepartmentHeaderCard
          description={`${totalDepartments} active departments`}
          icon={IconBuilding}
          title="Total Departments"
          value={totalDepartments}
        />
        <DepartmentHeaderCard
          description="Unique learners across departments"
          icon={IconUsers}
          title="Total Students"
          value={totalStudents}
        />
        <DepartmentHeaderCard
          description="Available programs"
          icon={IconBook}
          title="Total Courses"
          value={totalCourses}
        />
        <DepartmentHeaderCard
          description="Enrollment change vs last month"
          icon={IconTrendingUp}
          title="Growth Rate"
          value={growthRate}
        />
      </div>
    </div>
  );
};

export default DepartmentStatCards;
