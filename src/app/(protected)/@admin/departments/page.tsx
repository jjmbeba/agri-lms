import {
  IconBook,
  IconBuilding,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import CreateDepartmentButton from "@/components/features/departments/create-department-btn";
import EditDepartmentButton from "@/components/features/departments/edit-department-btn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Total Departments
                  </CardTitle>
                  <IconBuilding className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">{departments.length}</div>
                  <p className="text-muted-foreground text-xs">
                    {activeDepartments} active departments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Total Students
                  </CardTitle>
                  <IconUsers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">
                    {totalStudents.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Across all departments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Total Courses
                  </CardTitle>
                  <IconBook className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">{totalCourses}</div>
                  <p className="text-muted-foreground text-xs">
                    Available programs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Growth Rate
                  </CardTitle>
                  <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">+12.5%</div>
                  <p className="text-muted-foreground text-xs">
                    Student enrollment this month
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Departments Grid */}
          <div className="px-4 lg:px-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {departments.map((department) => (
                <Card
                  className="transition-shadow hover:shadow-md"
                  key={department.id}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {department.name}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">
                          {department.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="font-medium text-muted-foreground text-sm">
                            Students
                          </p>
                          <p className="font-bold text-2xl">{0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-muted-foreground text-sm">
                            Courses
                          </p>
                          <p className="font-bold text-2xl">
                            {department.courseCount}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-muted-foreground text-xs">
                          Updated{" "}
                          {new Date(department.updatedAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          {/* <Button size="sm" variant="outline">
                            View Details
                          </Button> */}
                          <EditDepartmentButton
                            departmentDetails={department}
                            id={department.id}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Empty State (if no departments) */}
          {departments.length === 0 && (
            <div className="px-4 lg:px-6">
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <IconBuilding className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold text-lg">
                    No departments yet
                  </h3>
                  <p className="mb-4 text-center text-muted-foreground">
                    Get started by creating your first department to organize
                    courses and students.
                  </p>
                  <Button className="gap-2">
                    <IconBuilding className="h-4 w-4" />
                    Create Your First Department
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentsPage;
