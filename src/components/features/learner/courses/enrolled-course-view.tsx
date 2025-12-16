"use client";

import {
  BookOpen,
  Clock,
  Download,
  Lock,
  MessageSquare,
  Play,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AssignmentItem } from "@/components/features/learner/assignments/assignment-item";
import { QuizItem } from "@/components/features/learner/quizzes/quiz-item";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import AdmissionFormDialog from "../admissions/admission-form-dialog";
import { CourseReviews } from "./course-reviews";
import EnrollCourseBtn from "./enroll-course-btn";

type CourseContentItem = {
  _id: Id<"module">;
  title: string;
  slug: string;
  description: string;
  position: number;
  priceShillings: number;
  isAccessible?: boolean;
  lessonCount?: number;
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
    // Quiz-specific fields
    quizId?: Id<"quiz">;
    timerMinutes?: number;
    timerSeconds?: number;
  }>;
};

type EnrolledCourseViewProps = {
  course: {
    course: Doc<"course">;
    department: Doc<"department"> | null;
    modulesCount: number;
    isEnrolled: boolean;
    admissionLetterUrl: string | null;
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
  hasFullAccess: boolean;
  unlockedModuleCount: number;
};

// Extracted helpers to reduce cognitive complexity
type ModuleItem = CourseContentItem["content"][number];

function isUrl(str: string): boolean {
  return str.trim().startsWith("http://") || str.trim().startsWith("https://");
}

function ModuleListItem({
  courseSlug,
  moduleSlug,
  item,
  isCompleted,
}: {
  courseSlug: string;
  moduleSlug: string;
  item: ModuleItem;
  isCompleted: boolean;
}) {
  if (item.type === "assignment" && item.assignmentId) {
    return (
      <AssignmentItem
        assignmentId={item.assignmentId}
        isCompleted={isCompleted}
        key={`${moduleSlug}-${item.position}`}
        orderIndex={item.orderIndex}
        title={item.title}
      />
    );
  }

  if (item.type === "quiz" && item.quizId) {
    return (
      <QuizItem
        isCompleted={isCompleted}
        key={`${moduleSlug}-${item.position}`}
        orderIndex={item.orderIndex}
        quizId={item.quizId}
        title={item.title}
      />
    );
  }

  return (
    <Link
      className={`flex items-start justify-between gap-3 px-4 py-3 ${
        isCompleted ? "bg-green-50" : ""
      }`}
      href={`/courses/${courseSlug}/modules/${moduleSlug}`}
      key={`${moduleSlug}-${item.position}`}
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
  courseSlug,
  courseId,
  hasFullAccess,
}: {
  moduleData: CourseContentItem;
  moduleProgress: EnrolledCourseViewProps["progress"]["modulesProgress"];
  courseSlug: string;
  courseId: Id<"course">;
  hasFullAccess: boolean;
}) {
  const items = (moduleData.content ?? [])
    .slice()
    .sort((a, b) => a.position - b.position);
  const lessonCount = moduleData.lessonCount ?? items.length;
  const isCompleted =
    moduleProgress.find((mp) => mp.moduleId === moduleData._id)?.status ===
    "completed";
  const isAccessible = hasFullAccess || Boolean(moduleData.isAccessible);
  const [isAdmissionDialogOpen, setIsAdmissionDialogOpen] = useState(false);

  return (
    <AccordionItem
      className={"rounded-md border"}
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
            {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
          </span>
          {isCompleted && isAccessible && (
            <Badge
              className="border-green-200 bg-green-50 text-green-700"
              variant="outline"
            >
              Completed
            </Badge>
          )}
          {!isAccessible && (
            <Badge className="flex items-center gap-1" variant="destructive">
              <Lock className="size-3" />
              Locked
            </Badge>
          )}
        </div>
      </div>
      <AccordionContent>
        {isAccessible ? (
          items.length > 0 ? (
            <ol
              aria-label={`Items in module ${moduleData.position}`}
              className="divide-y divide-border"
            >
              {items.map((it) => {
                const isItemCompletedDefault = false;
                return (
                  <ModuleListItem
                    courseSlug={courseSlug}
                    isCompleted={isItemCompletedDefault}
                    item={it}
                    key={`${moduleData._id}-${it.position}`}
                    moduleSlug={moduleData.slug}
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
          )
        ) : (
          <div className="space-y-3 px-4 pb-4 text-sm">
            <p className="text-muted-foreground">
              Unlock this module to access its lessons and assignments.
            </p>
            <button
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={() => setIsAdmissionDialogOpen(true)}
              type="button"
            >
              Unlock Module
            </button>
            <AdmissionFormDialog
              courseId={courseId}
              isOpen={isAdmissionDialogOpen}
              moduleId={moduleData._id}
              moduleName={moduleData.title}
              onOpenChange={setIsAdmissionDialogOpen}
              priceShillings={moduleData.priceShillings}
            />
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function CourseContentAccordion({
  modules,
  modulesProgress,
  courseSlug,
  courseId,
  hasFullAccess,
}: {
  modules: CourseContentItem[];
  modulesProgress: EnrolledCourseViewProps["progress"]["modulesProgress"];
  courseSlug: string;
  courseId: Id<"course">;
  hasFullAccess: boolean;
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
            courseSlug={courseSlug}
            hasFullAccess={hasFullAccess}
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
  hasFullAccess,
  unlockedModuleCount,
}: EnrolledCourseViewProps) => {
  const COMPLETED_PERCENTAGE = 100; // course considered complete at 100%
  const c = course.course;
  const d = course.department;
  const {
    progressPercentage,
    modulesCompleted,
    totalModules,
    modulesProgress,
  } = progress;
  const handoutText = c.handout ?? "";
  const hasHandout = handoutText.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Course Header with Progress */}
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-bold text-2xl tracking-tight">{c.title}</h1>
            <Badge
              className="border-green-200 bg-green-50 text-green-700"
              variant="outline"
            >
              {hasFullAccess ? "Full Access" : "Module Access"}
            </Badge>
            {!hasFullAccess && unlockedModuleCount > 0 ? (
              <Badge variant="secondary">{unlockedModuleCount} unlocked</Badge>
            ) : null}
            {progressPercentage === COMPLETED_PERCENTAGE ? (
              <Badge
                className="border-green-200 bg-green-50 text-green-700"
                variant="outline"
              >
                Completed
              </Badge>
            ) : null}
          </div>
          {course.admissionLetterUrl ? (
            <a
              aria-label="Download admission letter"
              className="inline-flex w-fit items-center gap-2 rounded-md bg-green-700 px-4 py-2 font-semibold text-sm text-white shadow transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              download
              href={course.admissionLetterUrl}
              rel="noopener"
              target="_blank"
            >
              Download Admission Letter
            </a>
          ) : null}
          <p className="text-lg text-muted-foreground">{c.description}</p>
          {hasHandout && isUrl(handoutText) ? (
            <a
              aria-label="Download course handout"
              className="inline-flex w-fit items-center gap-2 rounded-md bg-green-700 px-4 py-2 font-semibold text-sm text-white shadow transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              download
              href={handoutText}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Download className="size-4" />
              Download Course Handout
            </a>
          ) : null}
          {hasHandout && !isUrl(handoutText) ? (
            <Card>
              <CardHeader>
                <CardTitle>Course Handout</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground text-sm">
                  {handoutText}
                </p>
              </CardContent>
            </Card>
          ) : null}
          {!hasFullAccess && (
            <div className="flex">
              <EnrollCourseBtn
                courseId={course.course._id}
                isEnrolled={course.isEnrolled}
                label="Unlock Full Course"
                priceShillings={c.priceShillings}
              />
            </div>
          )}
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
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Clock className="size-3" />
                <span>
                  Time remaining: ~
                  {Math.max(totalModules - modulesCompleted, 0)}h
                </span>
              </div>
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

      {/* Course Content and Reviews Tabs */}
      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">
            <Play className="size-4" />
            Course Content
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <MessageSquare className="size-4" />
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="size-5" />
                Course Content
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {hasFullAccess
                  ? "Continue your learning journey. Click on modules to access content."
                  : "Unlock modules individually or upgrade to full course access."}
              </p>
            </CardHeader>
            <CardContent>
              <CourseContentAccordion
                courseId={course.course._id}
                courseSlug={course.course.slug}
                hasFullAccess={hasFullAccess}
                modules={modules}
                modulesProgress={modulesProgress}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <CourseReviews
            courseId={course.course._id}
            isEnrolled={course.isEnrolled}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
