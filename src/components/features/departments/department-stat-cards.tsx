import {
  IconBook,
  IconBuilding,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import type { api } from "../../../../convex/_generated/api";
import DepartmentHeaderCard from "./department-header-card";

type Props = {
  preloadedDepartments: Preloaded<
    typeof api.departments.getAllDepartmentsWithCounts
  >;
};

const DepartmentStatCards = ({ preloadedDepartments }: Props) => {
  const departments = usePreloadedQuery(preloadedDepartments);

  const totalCourses = departments.reduce(
    (sum, dept) => sum + dept.courseCount,
    0
  );

  return (
    <div className="px-4 lg:px-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DepartmentHeaderCard
          description={`${departments.length} active departments`}
          icon={IconBuilding}
          title="Total Departments"
          value={departments.length}
        />
        <DepartmentHeaderCard
          description="Across all departments"
          icon={IconUsers}
          title="Total Students"
          value={11}
        />
        <DepartmentHeaderCard
          description="Available programs"
          icon={IconBook}
          title="Total Courses"
          value={totalCourses}
        />
        <DepartmentHeaderCard
          description="Student enrollment this month"
          icon={IconTrendingUp}
          title="Growth Rate"
          value={12.5}
        />
      </div>
    </div>
  );
};

export default DepartmentStatCards;
