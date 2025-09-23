"use client";

import {
  IconBook,
  IconClock,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course } from "./types";

type CourseDetailsStatsProps = {
  course: Course;
};

export function CourseDetailsStats({ course }: CourseDetailsStatsProps) {
  // Mock data - in real app, these would come from the database
  const stats = {
    enrolledStudents: 245,
    modules: 8,
    averageRating: 4.6,
    totalLessons: 12,
    totalDuration: "8 hours",
    lastActivity: "2 hours ago",
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">
            Enrolled Students
          </CardTitle>
          <IconUsers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{stats.enrolledStudents}</div>
          <p className="text-muted-foreground text-xs">+12% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Modules</CardTitle>
          <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{course?.modulesCount}</div>
          <p className="text-muted-foreground text-xs">
            Total published modules
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Average Rating</CardTitle>
          <IconBook className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{stats.averageRating}</div>
          <p className="text-muted-foreground text-xs">Based on 89 reviews</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Course Duration</CardTitle>
          <IconClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{stats.totalDuration}</div>
          <p className="text-muted-foreground text-xs">
            {stats.totalLessons} lessons
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
