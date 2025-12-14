"use client";

import { IconBook, IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capitalize } from "@/lib/utils";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import CreateCourseButton from "./create-course-btn";
import EditCourseButton from "./edit-course-btn";

type CourseGridProps = {
  coursesWithDepartment: {
    course: Doc<"course">;
    department: Doc<"department"> | null;
    enrollments: number;
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
      {coursesWithDepartment?.map((courseWithDept) => {
        const courseSlug =
          courseWithDept.course.slug ?? courseWithDept.course._id;
        return (
          <Card
            className="group transition-shadow hover:shadow-lg"
            key={courseWithDept.course._id}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link href={`/courses/${courseSlug}`}>
                    <CardTitle className="line-clamp-2 text-lg transition-colors group-hover:text-primary">
                      {courseWithDept.course.title}
                    </CardTitle>
                  </Link>
                </div>
                <Badge
                  variant={
                    courseWithDept.course.status === "published"
                      ? "default"
                      : "outline"
                  }
                >
                  {capitalize(courseWithDept.course?.status ?? "")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="line-clamp-2 text-muted-foreground text-sm">
                {courseWithDept.course.description}
              </p>

              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <IconUsers className="h-4 w-4" />
                  {courseWithDept.enrollments} student(s)
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <EditCourseButton
                    courseDetails={courseWithDept.course}
                    text="Edit"
                  />
                  <Button asChild size="sm">
                    <Link href={`/courses/${courseSlug}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
