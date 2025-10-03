"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Clock, 
  Star, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Play,
  Award
} from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Doc } from "../../../convex/_generated/dataModel";
import EnrollCourseBtn from "./enroll-course-btn";

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
    "Community support and discussions"
  ];

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="font-bold text-2xl tracking-tight">{c.title}</h1>
              <Badge variant="secondary">Preview</Badge>
            </div>
            <p className="text-lg text-muted-foreground">{c.description}</p>
          </div>
          <EnrollCourseBtn courseId={courseId} isEnrolled={isEnrolled} />
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="size-4 text-yellow-500" />
                <span className="font-bold text-lg">{courseStats.averageRating}</span>
              </div>
              <p className="text-muted-foreground text-sm">Average Rating (dummy data)</p>
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
                <span className="font-bold text-lg">~{courseStats.estimatedTimeHours}h</span>
              </div>
              <p className="text-muted-foreground text-sm">Duration (dummy data)</p>
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
            {courseFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="size-5 text-green-500 mt-0.5 shrink-0" />
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
              This course contains {course.modulesCount} module{course.modulesCount === 1 ? "" : "s"}.
            </p>
            
            {modules.length > 0 ? (
              <div className="space-y-3">
                {modules.slice(0, 3).map((m) => {
                  const itemsCount = m.content?.length ?? 0;
                  return (
                    <div
                      className="flex items-start justify-between gap-4 rounded-lg border p-4"
                      key={m._id}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {m.position}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {m.title}
                            </p>
                            {m.description && (
                              <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                                {m.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground text-xs">
                          {itemsCount} lesson{itemsCount === 1 ? "" : "s"}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Preview
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                
                {modules.length > 3 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">
                      +{modules.length - 3} more modules available after enrollment
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto size-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Course content will be available after enrollment.</p>
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
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Join thousands of students who have already enrolled in this course. 
              Start your learning journey today and gain valuable skills.
            </p>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-blue-500" />
                  <span className="text-sm font-medium">{course.modulesCount} modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="size-4 text-yellow-500" />
                  <span className="text-sm font-medium">{courseStats.averageRating}/5 rating (dummy data)</span>
                </div>
              </div>
              
              <EnrollCourseBtn courseId={courseId} isEnrolled={false} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
