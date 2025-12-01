"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import type { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

type ModuleContentItem = {
  type: "text" | "video" | "assignment" | string;
  title: string;
  content?: string;
  orderIndex: number;
  position: number;
  assignmentId?: Id<"assignment">;
  dueDate?: string;
  maxScore?: number;
  submissionType?: "file" | "text" | "url";
  instructions?: string;
};

function AssignmentItemCard(item: ModuleContentItem) {
  return (
    <Card key={`assignment-${item.position}`}>
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
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
}

function VideoItemCard(item: ModuleContentItem) {
  return (
    <section className="space-y-3" key={`video-${item.position}`}>
      <h2 className="font-semibold text-xl">{item.title}</h2>
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

function TextItemCard(item: ModuleContentItem) {
  return (
    <section className="space-y-2" key={`text-${item.position}`}>
      <h2 className="font-semibold text-xl">{item.title}</h2>
      {item.content ? (
        <p className="prose-sm max-w-none">{item.content}</p>
      ) : (
        <p className="text-muted-foreground text-sm">No content provided.</p>
      )}
    </section>
  );
}

type ModuleDetailsProps = {
  moduleId: Id<"module">;
  courseId: Id<"course">;
  preloadedModule: Preloaded<typeof api.modules.getModuleWithContentById>;
};

export function ModuleDetails({
  moduleId,
  courseId,
  preloadedModule,
}: ModuleDetailsProps) {
  // Prefer preloaded data (SSR), fallback to client query if needed
  const preloaded = usePreloadedQuery(preloadedModule);

  const { data: moduleData } = useSuspenseQuery(
    convexQuery(api.modules.getModuleWithContentById, { id: moduleId })
  );

  const data = preloaded ?? moduleData ?? null;

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

  function renderContentItem(item: ModuleContentItem) {
    if (item.type === "assignment") {
      return AssignmentItemCard(item);
    }
    if (item.type === "video") {
      return VideoItemCard(item);
    }
    return TextItemCard(item);
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
        renderContentItem(item)
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t pt-6">
        {navigationLoading || !navigation?.previousModuleId ? (
          <Button disabled variant="outline">
            <ChevronLeft className="mr-2 size-4" />
            Previous Module
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link
              href={`/courses/${courseId}/modules/${navigation.previousModuleId}`}
            >
              <ChevronLeft className="mr-2 size-4" />
              Previous Module
            </Link>
          </Button>
        )}
        {navigationLoading || !navigation?.nextModuleId ? (
          <Button disabled variant="outline">
            Next Module
            <ChevronRight className="ml-2 size-4" />
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link
              href={`/courses/${courseId}/modules/${navigation.nextModuleId}`}
            >
              Next Module
              <ChevronRight className="ml-2 size-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
