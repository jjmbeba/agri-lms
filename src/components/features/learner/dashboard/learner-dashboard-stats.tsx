import {
  IconBook,
  IconClock,
  IconTrendingUp,
  IconTrophy,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LearnerDashboardStatsProps = {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalStudyTime: string;
  achievements: number;
  averageScore: number;
};

export function LearnerDashboardStats({
  totalCourses,
  completedCourses,
  inProgressCourses,
  totalStudyTime,
  achievements,
  averageScore,
}: LearnerDashboardStatsProps) {
  const TOTAL_PERCENTAGE = 100;
  const completionRate =
    totalCourses > 0 ? (completedCourses / totalCourses) * TOTAL_PERCENTAGE : 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:px-6 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconBook className="size-4 text-blue-600" />
            Enrolled Courses
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {totalCourses}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span>{completedCourses} completed</span>
            <span>•</span>
            <span>{inProgressCourses} in progress</span>
          </div>
        </CardContent>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconTrophy className="size-4 text-amber-600" />
            Completion Rate
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {Math.round(completionRate)}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <IconTrendingUp className="size-4 text-green-600" />
            <span>Great progress!</span>
          </div>
        </CardContent>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconClock className="size-4 text-purple-600" />
            Study Time
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
            Achievements
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
  );
}
