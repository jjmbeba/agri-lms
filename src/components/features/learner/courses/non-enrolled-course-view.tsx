"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Award,
  Bell,
  BellOff,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  Play,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displayToastError } from "@/lib/utils";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import AdmissionFormDialog from "../admissions/admission-form-dialog";
import EnrollCourseBtn from "./enroll-course-btn";

const modulePriceFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const MAX_PREVIEW_MODULES = 3;

type NotificationButtonProps = {
  courseId: Id<"course">;
  isComingSoon: boolean;
  isSubscribed: boolean | undefined;
  isNotificationPending: boolean;
  onToggle: () => void;
  getNotificationIcon: () => React.ReactElement;
};

const NotificationButton = ({
  isComingSoon,
  isSubscribed,
  isNotificationPending,
  onToggle,
  getNotificationIcon,
}: NotificationButtonProps) => {
  if (!isComingSoon) {
    return null;
  }

  return (
    <Button
      aria-label={
        isSubscribed
          ? "Unsubscribe from notifications"
          : "Subscribe to notifications"
      }
      disabled={isNotificationPending}
      onClick={onToggle}
      variant={isSubscribed ? "outline" : "default"}
    >
      {getNotificationIcon()}
      {isSubscribed ? "Subscribed" : "Notify Me When Available"}
    </Button>
  );
};

function isUrl(str: string): boolean {
  return str.trim().startsWith("http://") || str.trim().startsWith("https://");
}

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
  const handout = c.handout ?? "";
  const hasHandout = handout.trim().length > 0;
  const isComingSoon = c.status === "coming-soon";

  const { data: isSubscribed } = useQuery(
    convexQuery(
      api.courses.isSubscribedToCourse,
      isComingSoon ? { courseId: c._id } : "skip"
    )
  );

  const { mutate: subscribe, isPending: isSubscribing } = useMutation({
    mutationFn: useConvexMutation(api.courses.subscribeToCourseNotification),
    onSuccess: (result: { success: boolean; alreadySubscribed: boolean }) => {
      if (result.alreadySubscribed) {
        toast.info(
          "You're already subscribed to notifications for this course"
        );
      } else {
        toast.success("You'll be notified when this course becomes available");
      }
    },
    onError: (error) => {
      displayToastError(error);
    },
  });

  const { mutate: unsubscribe, isPending: isUnsubscribing } = useMutation({
    mutationFn: useConvexMutation(
      api.courses.unsubscribeFromCourseNotification
    ),
    onSuccess: () => {
      toast.success("You've unsubscribed from notifications");
    },
    onError: (error) => {
      displayToastError(error);
    },
  });

  const handleNotificationToggle = () => {
    if (isSubscribed) {
      unsubscribe({ courseId: c._id });
    } else {
      subscribe({ courseId: c._id });
    }
  };

  const isNotificationPending = isSubscribing || isUnsubscribing;

  const getNotificationIcon = () => {
    if (isNotificationPending) {
      return <Loader2 className="mr-2 size-4 animate-spin" />;
    }
    if (isSubscribed) {
      return <BellOff className="mr-2 size-4" />;
    }
    return <Bell className="mr-2 size-4" />;
  };

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

  const [isAdmissionDialogOpen, setIsAdmissionDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<{
    id: Id<"module">;
    title: string;
    priceShillings: number;
  } | null>(null);

  const handleModuleUnlockClick = (module: {
    _id: Id<"module">;
    title: string;
    priceShillings: number;
  }) => {
    setSelectedModule({
      id: module._id,
      title: module.title,
      priceShillings: module.priceShillings,
    });
    setIsAdmissionDialogOpen(true);
  };

  const handleAdmissionDialogOpenChange = (open: boolean) => {
    setIsAdmissionDialogOpen(open);
    if (!open) {
      setSelectedModule(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-bold text-2xl tracking-tight">{c.title}</h1>
            {isComingSoon ? (
              <Badge className="bg-amber-100 text-amber-800" variant="outline">
                Coming Soon
              </Badge>
            ) : (
              <Badge variant="secondary">Preview</Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground">{c.description}</p>
          <div className="flex flex-wrap items-center gap-3">
            <NotificationButton
              courseId={courseId}
              getNotificationIcon={getNotificationIcon}
              isComingSoon={isComingSoon}
              isNotificationPending={isNotificationPending}
              isSubscribed={isSubscribed}
              onToggle={handleNotificationToggle}
            />
            {!isComingSoon && (
              <EnrollCourseBtn
                courseId={courseId}
                isEnrolled={isEnrolled}
                priceShillings={c.priceShillings}
              />
            )}
          </div>
          {hasHandout && isUrl(handout) ? (
            <a
              aria-label="Download course handout"
              className="inline-flex w-fit items-center gap-2 rounded-md bg-green-700 px-4 py-2 font-semibold text-sm text-white shadow transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              download
              href={handout}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Download className="size-4" />
              Download Course Handout
            </a>
          ) : null}
        </div>

        {hasHandout && !isUrl(handout) ? (
          <Card>
            <CardHeader>
              <CardTitle>Course Handout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground text-sm">
                {handout}
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
                        <Button
                          aria-label={`Unlock module ${m.title}`}
                          onClick={() => handleModuleUnlockClick(m)}
                          type="button"
                          variant="default"
                        >
                          Unlock Module
                        </Button>
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

          <NotificationButton
            courseId={courseId}
            getNotificationIcon={getNotificationIcon}
            isComingSoon={isComingSoon}
            isNotificationPending={isNotificationPending}
            isSubscribed={isSubscribed}
            onToggle={handleNotificationToggle}
          />
          {!isComingSoon && (
            <EnrollCourseBtn
              courseId={courseId}
              isEnrolled={false}
              priceShillings={c.priceShillings}
            />
          )}
        </CardContent>
      </Card>
      {selectedModule && (
        <AdmissionFormDialog
          courseId={courseId}
          isOpen={isAdmissionDialogOpen}
          moduleId={selectedModule.id}
          moduleName={selectedModule.title}
          modulePriceShillings={selectedModule.priceShillings}
          onOpenChange={handleAdmissionDialogOpenChange}
          priceShillings={c.priceShillings}
        />
      )}
    </div>
  );
};
