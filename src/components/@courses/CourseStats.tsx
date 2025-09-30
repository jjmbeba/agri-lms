"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Doc } from "../../../convex/_generated/dataModel";

type CourseStatsProps = {
  course: {
    course: Doc<"course">;
    modulesCount: number;
    department: Doc<"department"> | null;
  };
};

export const CourseStats = ({ course }: CourseStatsProps) => {
  const stats = {
    enrolledStudents: 0,
    completionRate: 0,
    estimatedTimeHours: Math.max(1, course.modulesCount),
  } as const;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{course.modulesCount}</div>
          <p className="text-muted-foreground text-sm">Total modules</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Enrolled</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{stats.enrolledStudents}</div>
          <p className="text-muted-foreground text-sm">Learners enrolled</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">~{stats.estimatedTimeHours}h</div>
          <p className="text-muted-foreground text-sm">Estimated effort</p>
        </CardContent>
      </Card>
    </div>
  );
};
