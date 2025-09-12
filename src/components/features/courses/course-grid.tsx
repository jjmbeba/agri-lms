"use client";

import {
  IconBook,
  IconCalendar,
  IconClock,
  IconPlus,
  IconUsers,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

type CourseGridProps = {
  courses: Course[];
};

export function CourseGrid({ courses }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <IconBook className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 font-semibold text-lg">No courses found</h3>
          <p className="mb-4 text-center text-muted-foreground">
            Try adjusting your search criteria or create a new course.
          </p>
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid @3xl/main:grid-cols-3 @xl/main:grid-cols-2 gap-6">
      {courses.map((course) => (
        <Card
          className="group transition-shadow hover:shadow-lg"
          key={course.id}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="line-clamp-2 text-lg transition-colors group-hover:text-primary">
                  {course.title}
                </CardTitle>
                <CardDescription className="mt-1">
                  by {course.instructor}
                </CardDescription>
              </div>
              <Badge
                className={
                  course.status === "Active"
                    ? "border-green-200 text-green-700"
                    : "border-gray-200 text-gray-700"
                }
                variant="outline"
              >
                {course.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="line-clamp-2 text-muted-foreground text-sm">
              {course.description}
            </p>

            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <IconUsers className="h-4 w-4" />
                {course.enrolledStudents} students
              </div>
              <div className="flex items-center gap-1">
                <IconClock className="h-4 w-4" />
                {course.duration}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Completion Rate</span>
                <span className="font-medium">{course.completionRate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${course.completionRate}%` }}
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <IconCalendar className="h-4 w-4" />
                Updated {new Date(course.lastUpdated).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Edit
                </Button>
                <Button size="sm">View Details</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
