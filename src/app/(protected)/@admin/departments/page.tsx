import {
  IconBook,
  IconBuilding,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import CreateDepartmentButton from "@/components/features/departments/create-department-btn";
import DepartmentCard from "@/components/features/departments/department-card";
import DepartmentHeaderCard from "@/components/features/departments/department-header-card";
import EmptyDepartmentsMessage from "@/components/features/departments/empty-departments-msg";
import { trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Departments",
};

const DepartmentsPage = async () => {
  const departments = await trpc.departments.getAll();

  const totalStudents = 0; // TODO: Calculate from student enrollments
  const totalCourses = departments.reduce(
    (sum, dept) => sum + dept.courseCount,
    0
  );
  const activeDepartments = departments.length;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header Section */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                  <IconBuilding className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="font-bold text-2xl tracking-tight">
                    Department Management
                  </h1>
                  <p className="text-muted-foreground">
                    Manage academic departments and track enrollment across
                    programs
                  </p>
                </div>
              </div>
              <CreateDepartmentButton />
            </div>
          </div>

          {/* Statistics Cards */}

          <div className="px-4 lg:px-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DepartmentHeaderCard
                description={`${activeDepartments} active departments`}
                icon={IconBuilding}
                title="Total Departments"
                value={departments.length}
              />
              <DepartmentHeaderCard
                description="Across all departments"
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
                description="Student enrollment this month"
                icon={IconTrendingUp}
                title="Growth Rate"
                value={12.5}
              />
            </div>
          </div>

          {/* Departments Grid */}
          <div className="px-4 lg:px-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {departments.map((department) => (
                <DepartmentCard department={department} key={department.id} />
              ))}
            </div>
          </div>

          {/* Empty State (if no departments) */}
          {departments.length === 0 && <EmptyDepartmentsMessage />}
        </div>
      </div>
    </div>
  );
};

export default DepartmentsPage;
