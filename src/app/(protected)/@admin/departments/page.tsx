import {
  IconBook,
  IconBuilding,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Departments",
};

const DepartmentsPage = () => {
  // Mock data for departments - in a real app, this would come from your database
  const departments = [
    {
      id: "1",
      name: "Crop Science",
      description:
        "Advanced crop production techniques and sustainable farming practices",
      studentCount: 245,
      courseCount: 12,
      status: "active" as const,
      lastUpdated: "2024-01-15",
    },
    {
      id: "2",
      name: "Livestock Management",
      description:
        "Comprehensive animal husbandry and veterinary care programs",
      studentCount: 189,
      courseCount: 8,
      status: "active" as const,
      lastUpdated: "2024-01-12",
    },
    {
      id: "3",
      name: "Soil & Water Conservation",
      description: "Environmental stewardship and resource management",
      studentCount: 156,
      courseCount: 6,
      status: "active" as const,
      lastUpdated: "2024-01-10",
    },
    {
      id: "4",
      name: "Agricultural Economics",
      description: "Farm business management and market analysis",
      studentCount: 98,
      courseCount: 5,
      status: "active" as const,
      lastUpdated: "2024-01-08",
    },
    {
      id: "5",
      name: "Extension Services",
      description: "Community outreach and farmer education programs",
      studentCount: 67,
      courseCount: 4,
      status: "active" as const,
      lastUpdated: "2024-01-05",
    },
  ];

  const totalStudents = departments.reduce(
    (sum, dept) => sum + dept.studentCount,
    0
  );
  const totalCourses = departments.reduce(
    (sum, dept) => sum + dept.courseCount,
    0
  );
  const activeDepartments = departments.filter(
    (dept) => dept.status === "active"
  ).length;

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
              <Button className="gap-2">
                <IconBuilding className="h-4 w-4" />
                Create Department
              </Button>
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
                      <Badge
                        variant={
                          department.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {department.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="font-medium text-muted-foreground text-sm">
                            Students
                          </p>
                          <p className="font-bold text-2xl">
                            {department.studentCount}
                          </p>
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
                          {new Date(
                            department.lastUpdated
                          ).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
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
