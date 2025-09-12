import { IconPlant, IconTrendingUp } from "@tabler/icons-react";

import { ChartAreaInteractive } from "@/components/features/dashboard/chart-area-interactive";
import { DataTable } from "@/components/features/dashboard/data-table";
import { SectionCards } from "@/components/features/dashboard/section-cards";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import data from "./data.json" with { type: "json" };

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header Section */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="hidden h-12 w-12 items-center justify-center rounded-lg bg-green-100 lg:flex dark:bg-green-900/20">
                  <IconPlant className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="font-bold text-2xl tracking-tight">
                    Agriculture LMS Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Monitor courses, students, and farm partnerships
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className="border-green-200 text-green-700"
                  variant="outline"
                >
                  <IconTrendingUp className="mr-1 h-3 w-3" />
                  System Healthy
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <SectionCards />

          {/* Learning Activity Chart */}
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>

          {/* Course Management Table */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconPlant className="h-5 w-5 text-green-600" />
                  Course Management
                </CardTitle>
                <CardDescription>
                  Manage agricultural courses, track student progress, and
                  monitor instructor performance
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <DataTable data={data} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
