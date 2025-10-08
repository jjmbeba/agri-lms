"use client";

import { convexQuery } from "@convex-dev/react-query";
import { IconBook, IconClock, IconTrophy } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Authenticated } from "convex/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "../../../../../convex/_generated/api";

type LearnerDashboardStatsProps = {
  totalStudyTime: string;
  achievements: number;
  averageScore: number;
};

export function LearnerDashboardStats({
  totalStudyTime,
  achievements,
  averageScore,
}: LearnerDashboardStatsProps) {
  const { data: enrollments } = useSuspenseQuery(
    convexQuery(api.enrollments.getUserEnrollmentStats, {})
  );

  return (
    <Authenticated>
      <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:px-6 xl:grid-cols-3 dark:*:data-[slot=card]:bg-card">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconBook className="size-4 text-blue-600" />
              Enrolled Courses
            </CardDescription>
            <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
              {enrollments?.totalEnrolled}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>{enrollments?.completed} completed</span>
              <span>•</span>
              <span>{enrollments?.inProgress} in progress</span>
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconClock className="size-4 text-purple-600" />
              Study Time (dummy data)
            </CardDescription>
            <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
              {totalStudyTime}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>This month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconTrophy className="size-4 text-green-600" />
              Achievements (dummy data)
            </CardDescription>
            <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
              {achievements}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>Average score: {averageScore}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Authenticated>
  );
}
