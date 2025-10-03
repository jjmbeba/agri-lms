"use client";

import {
  IconBook,
  IconCertificate,
  IconClock,
  IconTrophy,
  IconVideo,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ActivityItem = {
  id: string;
  type:
    | "course_completed"
    | "lesson_completed"
    | "quiz_passed"
    | "certificate_earned"
    | "streak_milestone";
  title: string;
  description: string;
  timestamp: string;
  courseTitle?: string;
  score?: number;
  streak?: number;
};

type RecentActivityProps = {
  activities: ActivityItem[];
};

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "course_completed":
        return <IconBook className="h-4 w-4 text-green-600" />;
      case "lesson_completed":
        return <IconVideo className="h-4 w-4 text-blue-600" />;
      case "quiz_passed":
        return <IconTrophy className="h-4 w-4 text-yellow-600" />;
      case "certificate_earned":
        return <IconCertificate className="h-4 w-4 text-purple-600" />;
      case "streak_milestone":
        return <IconClock className="h-4 w-4 text-orange-600" />;
      default:
        return <IconBook className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "course_completed":
        return "bg-green-100 text-green-800";
      case "lesson_completed":
        return "bg-blue-100 text-blue-800";
      case "quiz_passed":
        return "bg-yellow-100 text-yellow-800";
      case "certificate_earned":
        return "bg-purple-100 text-purple-800";
      case "streak_milestone":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "course_completed":
        return "Course Completed";
      case "lesson_completed":
        return "Lesson Completed";
      case "quiz_passed":
        return "Quiz Passed";
      case "certificate_earned":
        return "Certificate Earned";
      case "streak_milestone":
        return "Streak Milestone";
      default:
        return "Activity";
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (dummy data)</CardTitle>
          <CardDescription>
            Your learning activities will appear here
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <IconBook className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-center text-muted-foreground">
            Start learning to see your activity here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity (dummy data)</CardTitle>
        <CardDescription>
          Your latest learning achievements and progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id}>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    <Badge
                      className={getActivityColor(activity.type)}
                      variant="secondary"
                    >
                      {getActivityTypeLabel(activity.type)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {activity.description}
                  </p>
                  {activity.courseTitle && (
                    <p className="text-muted-foreground text-xs">
                      Course: {activity.courseTitle}
                    </p>
                  )}
                  {activity.score && (
                    <p className="text-muted-foreground text-xs">
                      Score: {activity.score}%
                    </p>
                  )}
                  {activity.streak && (
                    <p className="text-muted-foreground text-xs">
                      {activity.streak} day streak! 🔥
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
              {index < activities.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
