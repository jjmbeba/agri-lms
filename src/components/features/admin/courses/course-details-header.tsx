import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { capitalize } from "@/lib/utils";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import CourseHeaderActions from "./course-header-actions";

type CourseDetailsHeaderProps = {
  course: { course: Doc<"course">; department: Doc<"department"> | null };
};

export function CourseDetailsHeader({ course }: CourseDetailsHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="font-bold text-2xl tracking-tight">
                    {course.course.title}
                  </h1>
                  <Badge
                    variant={
                      course.course.status === "published"
                        ? "default"
                        : "outline"
                    }
                  >
                    {capitalize(course.course.status ?? "")}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground">
                  {course.course.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Department:</span>
                <span>{course.department?.name || "Uncategorized"}</span>
              </div>
              <Separator className="h-4" orientation="vertical" />
              <div className="flex items-center gap-2">
                <span className="font-medium">Created:</span>
                <span>
                  {new Date(course.course._creationTime).toLocaleDateString()}
                </span>
              </div>
              <Separator className="h-4" orientation="vertical" />
            </div>

            {course.course.tags && (
              <div className="flex flex-wrap gap-2">
                {course.course.tags.map((tag, index) => (
                  <Badge
                    className="text-xs"
                    key={`tag-${index}-${tag.trim()}`}
                    variant="secondary"
                  >
                    {capitalize(tag.trim())}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <CourseHeaderActions courseDetails={course.course} />
        </div>
      </CardContent>
    </Card>
  );
}
