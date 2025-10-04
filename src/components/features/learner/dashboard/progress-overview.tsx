"use client";

import { IconCalendar, IconTarget, IconTrendingUp } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type ProgressOverviewProps = {
  weeklyGoal: number;
  weeklyProgress: number;
  monthlyGoal: number;
  monthlyProgress: number;
  streak: number;
  lastActivity: string;
};

export function ProgressOverview({
  weeklyGoal,
  weeklyProgress,
  monthlyGoal,
  monthlyProgress,
  streak,
  lastActivity,
}: ProgressOverviewProps) {
  const weeklyPercentage = (weeklyProgress / weeklyGoal) * 100;
  const monthlyPercentage = (monthlyProgress / monthlyGoal) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTarget className="h-5 w-5" />
            Weekly Progress (dummy data)
          </CardTitle>
          <CardDescription>
            {weeklyProgress} of {weeklyGoal} hours completed this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Weekly Goal</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(weeklyPercentage)}%
              </span>
            </div>
            <Progress value={weeklyPercentage} className="h-2" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconTrendingUp className="h-4 w-4" />
              <span>
                {weeklyGoal - weeklyProgress > 0
                  ? `${weeklyGoal - weeklyProgress} hours remaining`
                  : "Goal achieved! 🎉"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCalendar className="h-5 w-5" />
            Monthly Progress (dummy data)
          </CardTitle>
          <CardDescription>
            {monthlyProgress} of {monthlyGoal} hours completed this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Monthly Goal</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(monthlyPercentage)}%
              </span>
            </div>
            <Progress value={monthlyPercentage} className="h-2" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconTrendingUp className="h-4 w-4" />
              <span>
                {monthlyGoal - monthlyProgress > 0
                  ? `${monthlyGoal - monthlyProgress} hours remaining`
                  : "Goal achieved! 🎉"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrendingUp className="h-5 w-5" />
            Learning Streak (dummy data)
          </CardTitle>
          <CardDescription>Keep the momentum going!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{streak}</div>
            <div className="text-sm text-muted-foreground">days in a row</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Last activity: {lastActivity}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCalendar className="h-5 w-5" />
            Study Calendar (dummy data)
          </CardTitle>
          <CardDescription>Track your learning schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {new Date().getDate()}
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Today's study session
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
