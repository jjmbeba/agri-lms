"use client";

import { BookOpen, Clock, Play, Users } from "lucide-react";
import { AssignmentItem } from "@/components/features/learner/assignments/assignment-item";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
          {modules.length > 0 ? (
            <Accordion
              className="flex flex-col space-y-4"
              collapsible
              type="single"
            >
              {modules
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((m) => {
                  const items = (m.content ?? [])
                    .slice()
                    .sort((a, b) => a.position - b.position);

                  const isCompleted =
                    modulesProgress.find((mp) => mp.moduleId === m._id)
                      ?.status === "completed";

                  return (
                    <AccordionItem
                      className={`rounded-md border ${
                        isCompleted ? "border-green-200 bg-green-50" : ""
                      }`}
                      key={m._id}
                      value={m._id}
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
                                {isCompleted ? "✓" : m.position}
                              </div>
                              <h3 className="font-medium text-sm">{m.title}</h3>
                            </div>
                          </AccordionTrigger>
                          {m.description && (
                            <p className="mt-1 text-muted-foreground text-xs">
                              {m.description}
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
                            aria-label={`Items in module ${m.position}`}
                            className="divide-y divide-border"
                          >
                            {items.map((it) => {
                              const isItemCompleted = false; // This would come from progress data

                              // Render assignment items with special component
                              if (it.type === "assignment" && it.assignmentId) {
                                return (
                                  <AssignmentItem
                                    assignmentId={it.assignmentId}
                                    content={it.content || ""}
                                    isCompleted={isItemCompleted}
                                    key={`${m._id}-${it.position}`}
                                    orderIndex={it.orderIndex}
                                    position={it.position}
                                    title={it.title}
                                  />
                                );
                              }

                              // Render other content types normally
                              return (
                                <li
                                  className={`flex items-start justify-between gap-3 px-4 py-3 ${
                                    isItemCompleted ? "bg-green-50" : ""
                                  }`}
                                  key={`${m._id}-${it.position}`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`flex size-6 items-center justify-center rounded-full text-xs ${
                                          isItemCompleted
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                      >
                                        {isItemCompleted
                                          ? "✓"
                                          : it.orderIndex + 1}
                                      </div>
                                      <p className="text-sm">
                                        <span className="font-medium">
                                          {it.title}
                                        </span>
                                      </p>
                                    </div>
                                    {it.type === "text" && it.content && (
                                      <p className="mt-1 text-muted-foreground text-xs">
                                        {it.content}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground uppercase tracking-wide">
                                      {it.type}
                                    </span>
                                    {isItemCompleted && (
                                      <Badge
                                        className="border-green-200 bg-green-50 text-green-700 text-xs"
                                        variant="outline"
                                      >
                                        Done
                                      </Badge>
                                    )}
                                  </div>
                                </li>
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
                })}
            </Accordion>
          ) : (
            <div className="py-8 text-center">
              <BookOpen className="mx-auto mb-4 size-12 text-muted-foreground" />
              <p className="text-muted-foreground">No modules available yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
