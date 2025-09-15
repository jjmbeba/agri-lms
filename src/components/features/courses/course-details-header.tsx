"use client";

import {
  IconEdit,
  IconSettings,
  IconShare,
  IconTrash,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { capitalize } from "@/lib/utils";
import type { CourseWithCategory } from "./types";

type CourseDetailsHeaderProps = {
  course: CourseWithCategory;
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
                    className={
                      course.course.status === "Active"
                        ? "border-green-200 text-green-700"
                        : "border-neutral-700 text-neutral-200"
                    }
                    variant="outline"
                  >
                    {capitalize(course.course?.status ?? "")}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground">
                  {course.course.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Category:</span>
                <span>{course.category?.name || "Uncategorized"}</span>
              </div>
              <Separator className="h-4" orientation="vertical" />
              <div className="flex items-center gap-2">
                <span className="font-medium">Created:</span>
                <span>
                  {new Date(course.course.createdAt).toLocaleDateString()}
                </span>
              </div>
              <Separator className="h-4" orientation="vertical" />
              <div className="flex items-center gap-2">
                <span className="font-medium">Last Updated:</span>
                <span>
                  {new Date(course.course.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {course.course.tags && (
              <div className="flex flex-wrap gap-2">
                {course.course.tags.split(",").map((tag, index) => (
                  <Badge
                    className="text-xs"
                    key={`tag-${index}-${tag.trim()}`}
                    variant="secondary"
                  >
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 lg:flex-row">
            <Button size="sm" variant="outline">
              <IconShare className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button size="sm" variant="outline">
              <IconEdit className="mr-2 h-4 w-4" />
              Edit Course
            </Button>
            <Button size="sm" variant="outline">
              <IconSettings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button size="sm" variant="destructive">
              <IconTrash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
