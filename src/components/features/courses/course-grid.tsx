"use client";

import { IconBook, IconClock, IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { capitalize } from "@/lib/utils";
import type { Doc } from "../../../../convex/_generated/dataModel";
import CreateCourseButton from "./create-course-btn";
import EditCourseButton from "./edit-course-btn";

type CourseGridProps = {
  coursesWithDepartment: {
    course: Doc<"course">;
    department: Doc<"department"> | null;
  }[];
};

export function CourseGrid({ coursesWithDepartment }: CourseGridProps) {
  if (coursesWithDepartment?.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <IconBook className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 font-semibold text-lg">No courses found</h3>
          <p className="mb-4 text-center text-muted-foreground">
            Try adjusting your search criteria or create a new course.
          </p>
          <CreateCourseButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid @3xl/main:grid-cols-3 @xl/main:grid-cols-2 gap-6">
      {coursesWithDepartment?.map((course) => (
        <Card
          className="group transition-shadow hover:shadow-lg"
          key={course.course._id}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link href={`/courses/${course.course._id}`}>
                  <CardTitle className="line-clamp-2 text-lg transition-colors group-hover:text-primary">
                    {course.course.title}
                  </CardTitle>
                </Link>
              </div>
              <Badge
                variant={
                  course.course.status === "active" ? "default" : "outline"
                }
              >
                {capitalize(course.course?.status ?? "")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="line-clamp-2 text-muted-foreground text-sm">
              {course.course.description}
            </p>

            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <IconUsers className="h-4 w-4" />
                10 students
              </div>
              <div className="flex items-center gap-1">
                <IconClock className="h-4 w-4" />
                10 hours
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Completion Rate</span>
                <span className="font-medium">100%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <EditCourseButton courseDetails={course.course} text="Edit" />
                <Button asChild size="sm">
                  <Link href={`/courses/${course.course._id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
