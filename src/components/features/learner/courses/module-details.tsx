"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import type { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { NotesViewer } from "@/components/features/learner/courses/notes-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

type ModuleContentItem = {
  type: "text" | "video" | "assignment" | string;
  title: string;
  slug?: string;
  content?: string;
  orderIndex: number;
  position: number;
  assignmentId?: Id<"assignment">;
  dueDate?: string;
  maxScore?: number;
  submissionType?: "file" | "text" | "url";
  instructions?: string;
};

function AssignmentItemCard(
  item: ModuleContentItem,
  courseSlug: string,
  moduleSlug: string
) {
  const cardContent = (
    <Card
      className={
        item.slug ? "cursor-pointer transition-shadow hover:shadow-md" : ""
      }
      key={`assignment-${item.position}`}
    >
      <CardHeader>
        <CardTitle>
          {item.slug ? (
            <Link
              className="hover:underline"
              href={`/courses/${courseSlug}/modules/${moduleSlug}/content/${item.slug}`}
            >
              {item.title}
            </Link>
          ) : (
            item.title
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {item.instructions ? <p>{item.instructions}</p> : null}
          <div className="text-muted-foreground">
            {item.dueDate ? <span>Due: {item.dueDate}</span> : null}
            {typeof item.maxScore === "number" ? (
              <span className="ml-3">Max Score: {item.maxScore}</span>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return cardContent;
}

function VideoItemCard(
  item: ModuleContentItem,
  courseSlug: string,
  moduleSlug: string
) {
  return (
    <section className="space-y-3" key={`video-${item.position}`}>
      <h2 className="font-semibold text-xl">
        {item.slug ? (
          <Link
            className="hover:underline"
            href={`/courses/${courseSlug}/modules/${moduleSlug}/content/${item.slug}`}
          >
            {item.title}
          </Link>
        ) : (
          item.title
        )}
      </h2>
      <div>
        <video aria-label={item.title} className="w-full rounded-md" controls>
          {item.content ? <source src={item.content} /> : null}
          <track kind="captions" />
        </video>
        {item.content ? null : (
          <p className="text-muted-foreground text-xs">
            No video source provided.
          </p>
        )}
      </div>
    </section>
  );
}

function TextItemCard(
  item: ModuleContentItem,
  courseSlug: string,
  moduleSlug: string
) {
  return (
    <section className="space-y-3" key={`text-${item.position}`}>
      <h2 className="font-semibold text-xl">
        {item.slug ? (
          <Link
            className="hover:underline"
            href={`/courses/${courseSlug}/modules/${moduleSlug}/content/${item.slug}`}
          >
            {item.title}
          </Link>
        ) : (
          item.title
        )}
      </h2>
      <div className="rounded-md border bg-muted/20 p-4">
        <NotesViewer
          className="max-h-[200px] overflow-hidden"
          content={item.content || ""}
        />
        {item.slug && (
          <Link
            className="mt-2 inline-block text-primary text-sm hover:underline"
            href={`/courses/${courseSlug}/modules/${moduleSlug}/content/${item.slug}`}
          >
            Read full notes →
          </Link>
        )}
      </div>
    </section>
  );
}

type ModuleDetailsProps = {
  moduleId: Id<"module">;
  courseId: Id<"course">;
  courseSlug: string;
  preloadedModule: Preloaded<typeof api.modules.getModuleBySlug>;
};

export function ModuleDetails({
  moduleId,
  courseSlug,
  preloadedModule,
}: ModuleDetailsProps) {
  // Use preloaded data from SSR
  const data = usePreloadedQuery(preloadedModule);

  // Get module progress
  const { data: moduleProgress } = useQuery({
    ...convexQuery(api.enrollments.getModuleProgress, {
      moduleId,
    }),
  });

  // Get navigation data
  const { data: navigation, isLoading: navigationLoading } = useQuery({
    ...convexQuery(api.modules.getModuleNavigation, {
      moduleId,
    }),
  });

  // Toggle completion mutation
  const updateModuleProgress = useConvexMutation(
    api.enrollments.updateModuleProgress
  );
  const [isPending, setIsPending] = useState(false);

  const isCompleted = moduleProgress?.status === "completed";

  const handleToggleCompletion = async () => {
    setIsPending(true);
    try {
      if (isCompleted) {
        // Mark as in progress (0%)
        await updateModuleProgress({
          moduleId,
          status: "inProgress",
          progressPercentage: 0,
        });
        toast.success("Module marked as incomplete");
      } else {
        // Mark as completed (100%)
        await updateModuleProgress({
          moduleId,
          status: "completed",
          progressPercentage: 100,
        });
        toast.success("Module completed!");
      }
    } catch (error) {
      toast.error(
        `Failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsPending(false);
    }
  };

  const renderButtonContent = () => {
    if (isPending) {
      return (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Updating...
        </>
      );
    }
    if (isCompleted) {
      return (
        <>
          <Check className="mr-2 size-4" />
          Completed
        </>
      );
    }
    return "Mark as Completed";
  };

  if (!data) {
    return (
      <div className="py-12 text-center">
        <h3 className="mb-2 font-semibold text-lg">
          Module unavailable or locked
        </h3>
        <p className="text-muted-foreground">
          Ensure you have access to this module and try again.
        </p>
      </div>
    );
  }

  function renderContentItem(item: ModuleContentItem, moduleSlug: string) {
    if (item.type === "assignment") {
      return AssignmentItemCard(item, courseSlug, moduleSlug);
    }
    if (item.type === "video") {
      return VideoItemCard(item, courseSlug, moduleSlug);
    }
    return TextItemCard(item, courseSlug, moduleSlug);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl">{data.title}</h1>
        <Button
          disabled={isPending}
          onClick={handleToggleCompletion}
          type="button"
          variant={isCompleted ? "outline" : "default"}
        >
          {renderButtonContent()}
        </Button>
      </header>

      {(data.content ?? []).map((item: ModuleContentItem) =>
        renderContentItem(item, data.slug)
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t pt-6">
        {(() => {
          const hasPrevious =
            !navigationLoading &&
            navigation &&
            "courseSlug" in navigation &&
            navigation.previousModuleSlug &&
            navigation.courseSlug;
          return hasPrevious ? (
            <Button asChild variant="outline">
              <Link
                href={`/courses/${navigation.courseSlug}/modules/${navigation.previousModuleSlug}`}
              >
                <ChevronLeft className="mr-2 size-4" />
                Previous Module
              </Link>
            </Button>
          ) : (
            <Button disabled variant="outline">
              <ChevronLeft className="mr-2 size-4" />
              Previous Module
            </Button>
          );
        })()}
        {(() => {
          const hasNext =
            !navigationLoading &&
            navigation &&
            "courseSlug" in navigation &&
            navigation.nextModuleSlug &&
            navigation.courseSlug;
          return hasNext ? (
            <Button asChild variant="outline">
              <Link
                href={`/courses/${navigation.courseSlug}/modules/${navigation.nextModuleSlug}`}
              >
                Next Module
                <ChevronRight className="ml-2 size-4" />
              </Link>
            </Button>
          ) : (
            <Button disabled variant="outline">
              Next Module
              <ChevronRight className="ml-2 size-4" />
            </Button>
          );
        })()}
      </div>
    </div>
  );
}
