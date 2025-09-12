"use client";

import {
  IconBook,
  IconTrendingUp,
  IconUsers,
  IconVideo,
} from "@tabler/icons-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Course = {
  id: number;
  title: string;
  instructor: string;
  category: string;
  status: string;
  enrolledStudents: number;
  completionRate: number;
  duration: string;
  lastUpdated: string;
  thumbnail: string;
  description: string;
};

type CourseStatsProps = {
  courses: Course[];
};

export function CourseStats({ courses }: CourseStatsProps) {
  const totalStudents = courses.reduce(
    (sum, course) => sum + course.enrolledStudents,
    0
  );
  const averageCompletion = Math.round(
    courses.reduce((sum, course) => sum + course.completionRate, 0) /
      courses.length
  );
  const activeCourses = courses.filter((c) => c.status === "Active").length;

  return (
    <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconBook className="size-4 text-blue-600" />
            Total Courses
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {courses.length}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconUsers className="size-4 text-green-600" />
            Total Students
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {totalStudents.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconTrendingUp className="size-4 text-emerald-600" />
            Avg Completion
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {averageCompletion}%
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconVideo className="size-4 text-purple-600" />
            Active Courses
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {activeCourses}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
