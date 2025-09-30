/** biome-ignore-all lint/style/noMagicNumbers: Easier to read */
"use client";

import { IconCalendar, IconClock, IconFlag } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Deadline = {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: string;
  type: "assignment" | "quiz" | "exam" | "project";
  priority: "high" | "medium" | "low";
  isOverdue: boolean;
};

type UpcomingDeadlinesProps = {
  deadlines: Deadline[];
};

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <IconFlag className="h-4 w-4" />;
      case "quiz":
        return <IconClock className="h-4 w-4" />;
      case "exam":
        return <IconCalendar className="h-4 w-4" />;
      case "project":
        return <IconFlag className="h-4 w-4" />;
      default:
        return <IconCalendar className="h-4 w-4" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const ONE_DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / ONE_DAY_IN_MILLISECONDS);

    if (diffDays < 0) {
      return "Overdue";
    }
    if (diffDays === 0) {
      return "Due today";
    }
    if (diffDays === 1) {
      return "Due tomorrow";
    }
    return `Due in ${diffDays} days`;
  };

  if (deadlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>No upcoming deadlines</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <IconCalendar className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-center text-muted-foreground">
            You're all caught up! No deadlines approaching.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
        <CardDescription>
          Stay on track with your assignments and assessments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deadlines.map((deadline) => (
            <div
              className={`rounded-lg border p-4 ${
                deadline.isOverdue ? "border-destructive bg-destructive/10" : ""
              }`}
              key={deadline.id}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    {getTypeIcon(deadline.type)}
                    <h4 className="font-medium text-sm">{deadline.title}</h4>
                  </div>
                  <p className="mb-2 text-muted-foreground text-sm">
                    {deadline.courseTitle}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    <span
                      className={
                        deadline.isOverdue
                          ? "font-medium text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      {getDaysUntilDue(deadline.dueDate)}
                    </span>
                    <span className="text-muted-foreground">
                      • {new Date(deadline.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/courses/${deadline.id}`}>View</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
