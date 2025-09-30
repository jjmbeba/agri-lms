import { IconBuilding } from "@tabler/icons-react";
import { preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";
import CreateDepartmentButton from "@/components/features/admin/departments/create-department-btn";
import DepartmentGrid from "@/components/features/admin/departments/department-grid";
import DepartmentStatCards from "@/components/features/admin/departments/department-stat-cards";
import { api } from "../../../../../convex/_generated/api";

export const metadata: Metadata = {
  title: "Departments",
};

const DepartmentsPage = async () => {
  const preloadedDepartments = await preloadQuery(
    api.departments.getAllDepartmentsWithCounts,
    {}
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header Section */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="hidden h-12 w-12 items-center justify-center rounded-lg bg-green-100 md:flex dark:bg-green-900/20">
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
          <DepartmentStatCards preloadedDepartments={preloadedDepartments} />

          {/* Departments Grid */}
          <DepartmentGrid preloadedDepartments={preloadedDepartments} />
        </div>
      </div>
    </div>
  );
};

export default DepartmentsPage;
