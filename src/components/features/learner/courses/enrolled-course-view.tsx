"use client";

import { BookOpen, Clock, Play } from "lucide-react";
import Link from "next/link";
import { AssignmentItem } from "@/components/features/learner/assignments/assignment-item";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";

type CourseContentItem = {
  _id: Id<"module">;
  title: string;
  description: string;
  position: number;
  content: Array<{
    type: string;
    title: string;
    content?: string;
    orderIndex: number;
    position: number;
    // Assignment-specific fields
    assignmentId?: Id<"assignment">;
    dueDate?: string;
    maxScore?: number;
    submissionType?: "file" | "text" | "url";
    instructions?: string;
  }>;
};

type EnrolledCourseViewProps = {
  course: {
    course: Doc<"course">;
    department: Doc<"department"> | null;
    modulesCount: number;
  };
  modules: CourseContentItem[];
  progress: {
    progressPercentage: number;
    modulesCompleted: number;
    totalModules: number;
    modulesProgress: {
      moduleId: Id<"module">;
      title: string;
      position: number;
      status: "inProgress" | "completed" | "notStarted";
      progressPercentage: number;
      completedAt: string | undefined;
    }[];
  };
};

// Extracted helpers to reduce cognitive complexity
type ModuleItem = CourseContentItem["content"][number];

function ModuleListItem({
  courseId,
  moduleId,
  item,
  isCompleted,
}: {
  courseId: Id<"course">;
  moduleId: Id<"module">;
  item: ModuleItem;
  isCompleted: boolean;
}) {
  if (item.type === "assignment" && item.assignmentId) {
    return (
      <AssignmentItem
        assignmentId={item.assignmentId}
        content={item.content || ""}
        isCompleted={isCompleted}
        key={`${moduleId}-${item.position}`}
        orderIndex={item.orderIndex}
        position={item.position}
        title={item.title}
      />
    );
  }

  return (
    <Link
      className={`flex items-start justify-between gap-3 px-4 py-3 ${
        isCompleted ? "bg-green-50" : ""
      }`}
      href={`/courses/${String(courseId)}/modules/${String(moduleId)}`}
      key={`${moduleId}-${item.position}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div
            className={`flex size-6 items-center justify-center rounded-full text-xs ${
              isCompleted
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {isCompleted ? "✓" : item.orderIndex + 1}
          </div>
          <p className="text-sm">
            <span className="font-medium">{item.title}</span>
          </p>
        </div>
        {item.type === "text" && item.content && (
          <p className="mt-1 text-muted-foreground text-xs">{item.content}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground uppercase tracking-wide">
          {item.type}
        </span>
        {isCompleted && (
          <Badge
            className="border-green-200 bg-green-50 text-green-700 text-xs"
            variant="outline"
          >
            Done
          </Badge>
        )}
      </div>
    </Link>
  );
}

function ModuleAccordionItem({
  moduleData,
  moduleProgress,
  courseId,
}: {
  moduleData: CourseContentItem;
  moduleProgress: EnrolledCourseViewProps["progress"]["modulesProgress"];
  courseId: Id<"course">;
}) {
  const items = (moduleData.content ?? [])
    .slice()
    .sort((a, b) => a.position - b.position);
  const isCompleted =
    moduleProgress.find((mp) => mp.moduleId === moduleData._id)?.status ===
    "completed";

  return (
    <AccordionItem
      className={`rounded-md border ${isCompleted ? "border-green-200 bg-green-50" : ""}`}
      key={moduleData._id}
      value={moduleData._id}
    >
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <AccordionTrigger className="text-left">
            <div className="flex items-center gap-3">
              <div
                className={`flex size-8 items-center justify-center rounded-full font-medium text-xs ${
                  isCompleted
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isCompleted ? "✓" : moduleData.position}
              </div>
              <h3 className="font-medium text-sm">{moduleData.title}</h3>
            </div>
          </AccordionTrigger>
          {moduleData.description && (
            <p className="mt-1 text-muted-foreground text-xs">
              {moduleData.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground text-xs">
            {items.length} lesson{items.length === 1 ? "" : "s"}
          </span>
          {isCompleted && (
            <Badge
              className="border-green-200 bg-green-50 text-green-700"
              variant="outline"
            >
              Completed
            </Badge>
          )}
        </div>
      </div>
      <AccordionContent>
        {items.length > 0 ? (
          <ol
            aria-label={`Items in module ${moduleData.position}`}
            className="divide-y divide-border"
          >
            {items.map((it) => {
              const isItemCompleted = false; // This would come from progress data
              return (
                <ModuleListItem
                  courseId={courseId}
                  isCompleted={isItemCompleted}
                  item={it}
                  key={`${moduleData._id}-${it.position}`}
                  moduleId={moduleData._id}
                />
              );
            })}
          </ol>
        ) : (
          <div
            aria-live="polite"
            className="px-4 pb-4 text-muted-foreground text-xs"
          >
            No content available in this module yet.
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function CourseContentAccordion({
  modules,
  modulesProgress,
  courseId,
}: {
  modules: CourseContentItem[];
  modulesProgress: EnrolledCourseViewProps["progress"]["modulesProgress"];
  courseId: Id<"course">;
}) {
  if (modules.length === 0) {
    return (
      <div className="py-8 text-center">
        <BookOpen className="mx-auto mb-4 size-12 text-muted-foreground" />
        <p className="text-muted-foreground">No modules available yet.</p>
      </div>
    );
  }

  return (
    <Accordion className="flex flex-col space-y-4" collapsible type="single">
      {modules
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((m) => (
          <ModuleAccordionItem
            courseId={courseId}
            key={m._id}
            moduleData={m}
            moduleProgress={modulesProgress}
          />
        ))}
    </Accordion>
  );
}

export const EnrolledCourseView = ({
  course,
  modules,
  progress,
}: EnrolledCourseViewProps) => {
  const c = course.course;
  const d = course.department;
  const {
    progressPercentage,
    modulesCompleted,
    totalModules,
    modulesProgress,
  } = progress;

  return (
    <div className="space-y-6">
      {/* Course Header with Progress */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="font-bold text-2xl tracking-tight">{c.title}</h1>
              <Badge
                className="border-green-200 bg-green-50 text-green-700"
                variant="outline"
              >
                Enrolled
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground">{c.description}</p>
          </div>
        </div>

        {/* Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <Progress className="h-2" value={progressPercentage} />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="font-bold text-2xl text-green-600">
                  {modulesCompleted}
                </div>
                <p className="text-muted-foreground text-sm">
                  Modules Completed
                </p>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-blue-600">
                  {totalModules}
                </div>
                <p className="text-muted-foreground text-sm">Total Modules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Info */}
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Department:</span>
            <span>{d?.name || "Uncategorized"}</span>
          </div>
          <Separator className="h-4" orientation="vertical" />
          <div className="flex items-center gap-2">
            <span className="font-medium">Modules:</span>
            <span>{course.modulesCount}</span>
          </div>
          <Separator className="h-4" orientation="vertical" />
          <div className="flex items-center gap-2">
            <Clock className="size-4" />
            <span>~{Math.max(1, course.modulesCount)}h estimated</span>
          </div>
        </div>
      </div>

      {/* Course Content with Enhanced UI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="size-5" />
            Course Content
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Continue your learning journey. Click on modules to access content.
          </p>
        </CardHeader>
        <CardContent>
          <CourseContentAccordion
            courseId={course.course._id}
            modules={modules}
            modulesProgress={modulesProgress}
          />
        </CardContent>
      </Card>
    </div>
  );
};
