"use client";

import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Play,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import EnrollCourseBtn from "./enroll-course-btn";

const modulePriceFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const MAX_PREVIEW_MODULES = 3;

type CourseContentItem = {
  _id: Id<"module">;
  title: string;
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
  }>;
};

type NonEnrolledCourseViewProps = {
  course: {
    course: Doc<"course">;
    department: Doc<"department"> | null;
    modulesCount: number;
  };
  modules: CourseContentItem[];
  isEnrolled: boolean;
  courseId: Id<"course">;
};

export const NonEnrolledCourseView = ({
  course,
  modules,
  isEnrolled,
  courseId,
}: NonEnrolledCourseViewProps) => {
  const c = course.course;
  const d = course.department;
  const hasHandout = Boolean(c.handout && c.handout.trim().length > 0);

  const courseStats = {
    averageRating: 4.8,
    estimatedTimeHours: Math.max(1, course.modulesCount),
  };

  const courseFeatures = [
    "Interactive lessons with real-world examples",
    "Hands-on projects and assignments",
    "Expert instructor guidance",
    "Certificate of completion",
    "Lifetime access to course materials",
    "Community support and discussions",
  ];

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-bold text-2xl tracking-tight">{c.title}</h1>
            <Badge variant="secondary">Preview</Badge>
          </div>
          <p className="text-lg text-muted-foreground">{c.description}</p>
          <div className="flex">
            <EnrollCourseBtn
              courseId={courseId}
              isEnrolled={isEnrolled}
              priceShillings={c.priceShillings}
            />
          </div>
        </div>

        {hasHandout ? (
          <Card>
            <CardHeader>
              <CardTitle>Course Handout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground text-sm">
                {c.handout}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Course Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="size-4 text-yellow-500" />
                <span className="font-bold text-lg">
                  {courseStats.averageRating}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Average Rating (dummy data)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-blue-500" />
                <span className="font-bold text-lg">{course.modulesCount}</span>
              </div>
              <p className="text-muted-foreground text-sm">Modules</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-purple-500" />
                <span className="font-bold text-lg">
                  ~{courseStats.estimatedTimeHours}h
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Duration (dummy data)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Course Info */}
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Department:</span>
            <span>{d?.name || "Uncategorized"}</span>
          </div>
        </div>
      </div>

      {/* Course Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5" />
            What You'll Learn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {courseFeatures.map((feature) => (
              <div className="flex items-start gap-3" key={feature}>
                <CheckCircle className="mt-0.5 size-5 shrink-0 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course Content Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="size-5" />
            Course Content Preview
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Enroll to access all content and start your learning journey.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              This course contains {course.modulesCount} module
              {course.modulesCount === 1 ? "" : "s"}.
            </p>

            {modules.length > 0 ? (
              <div className="space-y-3">
                {modules.slice(0, MAX_PREVIEW_MODULES).map((m) => {
                  const itemsCount = m.lessonCount ?? m.content?.length ?? 0;
                  return (
                    <div
                      className="flex flex-col gap-4 rounded-lg border p-4"
                      key={m._id}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-xs">
                          {m.position}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm">{m.title}</p>
                          {m.description && (
                            <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                              {m.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground text-xs">
                            {itemsCount} lesson{itemsCount === 1 ? "" : "s"}
                          </span>
                          <Badge className="text-xs" variant="outline">
                            Preview
                          </Badge>
                          <span className="text-muted-foreground text-xs">
                            {m.priceShillings > 0
                              ? modulePriceFormatter.format(m.priceShillings)
                              : "Free Module"}
                          </span>
                        </div>
                        <EnrollCourseBtn
                          courseId={courseId}
                          label="Unlock Module"
                          moduleId={m._id}
                          priceShillings={m.priceShillings}
                        />
                      </div>
                    </div>
                  );
                })}

                {modules.length > MAX_PREVIEW_MODULES && (
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground text-sm">
                      +{modules.length - MAX_PREVIEW_MODULES} more modules
                      available after enrollment
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <BookOpen className="mx-auto mb-4 size-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Course content will be available after enrollment.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enrollment CTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="size-5" />
            Ready to Start Learning?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Join thousands of students who have already enrolled in this course.
            Start your learning journey today and gain valuable skills.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-blue-500" />
              <span className="font-medium text-sm">
                {course.modulesCount} modules
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="size-4 text-yellow-500" />
              <span className="font-medium text-sm">
                {courseStats.averageRating}/5 rating (dummy data)
              </span>
            </div>
          </div>

          <EnrollCourseBtn
            courseId={courseId}
            isEnrolled={false}
            priceShillings={c.priceShillings}
          />
        </CardContent>
      </Card>
    </div>
  );
};
