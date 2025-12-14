"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bell, BellOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { displayToastError } from "@/lib/utils";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";

type CourseCardProps = {
  data: {
    course: Doc<"course">;
    department: Doc<"department"> | null;
    isEnrolled: boolean;
  };
};

export const CourseCard = ({ data }: CourseCardProps) => {
  const c = data.course;
  const d = data.department;
  const courseSlug = c.slug ?? c._id;
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
      return;
    }
    subscribe({ courseId: c._id });
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

  return (
    <Card className="group transition-shadow hover:shadow-lg" key={c._id}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Link
              aria-label={`View course ${c.title}`}
              href={`/courses/${courseSlug}`}
            >
              <CardTitle className="line-clamp-2 text-lg transition-colors group-hover:text-primary">
                {c.title}
              </CardTitle>
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <div className="text-muted-foreground text-xs">{d?.name}</div>
              {isComingSoon && (
                <Badge
                  className="bg-amber-100 text-amber-800"
                  variant="outline"
                >
                  Coming Soon
                </Badge>
              )}
              {data.isEnrolled && <Badge variant="outline">Enrolled</Badge>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-muted-foreground text-sm">
          {c.description}
        </p>
        <Separator />
        <div className="flex items-center justify-end gap-2">
          {isComingSoon ? (
            <Button
              aria-label={
                isSubscribed
                  ? "Unsubscribe from notifications"
                  : "Subscribe to notifications"
              }
              disabled={isNotificationPending}
              onClick={handleNotificationToggle}
              size="sm"
              variant={isSubscribed ? "outline" : "default"}
            >
              {getNotificationIcon()}
              {isSubscribed ? "Subscribed" : "Notify Me"}
            </Button>
          ) : null}
          <Button aria-label={`Open ${c.title}`} asChild size="sm">
            <Link href={`/courses/${courseSlug}`}>View details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
