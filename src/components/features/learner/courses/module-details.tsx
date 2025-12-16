"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import type { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AssignmentDetailModal } from "@/components/features/learner/assignments/assignment-detail-modal";
import { NotesViewer } from "@/components/features/learner/courses/notes-viewer";
import { QuizItem } from "@/components/features/learner/quizzes/quiz-item";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isUrl } from "@/lib/content-utils";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

type ModuleContentItem = {
  type: "text" | "video" | "assignment" | "quiz" | string;
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
  // Quiz-specific fields
  quizId?: Id<"quiz">;
  timerMinutes?: number;
  timerSeconds?: number;
};

function AssignmentItemCard(
  item: ModuleContentItem,
  courseSlug: string,
  moduleSlug: string
) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch assignment data with submissions if assignmentId exists
  const { data: assignmentData, isLoading, error } = useQuery(
    item.assignmentId
      ? {
          ...convexQuery(api.assignments.getAssignmentWithSubmissions, {
            assignmentId: item.assignmentId,
          }),
        }
      : { enabled: false }
  );

  const assignment = assignmentData?.assignment;
  const latestSubmission = assignmentData?.latestSubmission ?? null;
  const hasSubmission = latestSubmission !== null;
  const isLate = assignment?.dueDate
    ? new Date() > new Date(assignment.dueDate)
    : false;

  const getStatusBadge = () => {
    if (!hasSubmission) {
      return <Badge variant="outline">Not Submitted</Badge>;
    }

    if (latestSubmission.isLate) {
      return <Badge variant="destructive">Late Submission</Badge>;
    }

    if (latestSubmission.status === "graded") {
      return <Badge variant="secondary">Graded</Badge>;
    }

    return <Badge variant="default">Submitted</Badge>;
  };

  return (
    <>
      <Card
        className={
          item.slug ? "cursor-pointer transition-shadow hover:shadow-md" : ""
        }
        key={`assignment-${item.position}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
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
            {!isLoading && !error && item.assignmentId && (
              <div className="flex items-center gap-2">
                {getStatusBadge()}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {item.instructions ? (
              <p className="text-sm">{item.instructions}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
              {item.dueDate ? <span>Due: {item.dueDate}</span> : null}
              {typeof item.maxScore === "number" ? (
                <span>Max Score: {item.maxScore}</span>
              ) : null}
            </div>

            {/* Loading state */}
            {isLoading && item.assignmentId && (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  Loading assignment details...
                </span>
              </div>
            )}

            {/* Error state */}
            {error && item.assignmentId && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Failed to load assignment details. Please try again.
                </AlertDescription>
              </Alert>
            )}

            {/* Due date warning */}
            {!isLoading &&
              !error &&
              isLate &&
              !hasSubmission &&
              item.assignmentId && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    This assignment is past its due date. Any submission will be
                    marked as late.
                  </AlertDescription>
                </Alert>
              )}

            {/* Graded feedback */}
            {!isLoading &&
              !error &&
              hasSubmission &&
              latestSubmission.status === "graded" &&
              assignment &&
              item.assignmentId && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Assignment graded: {latestSubmission.score}/
                    {assignment.maxScore} points
                    {latestSubmission.feedback && (
                      <span className="mt-1 block font-medium">
                        Feedback: {latestSubmission.feedback}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

            {/* Action button */}
            {!isLoading && !error && item.assignmentId && (
              <Button
                className="w-full"
                onClick={() => setIsModalOpen(true)}
                type="button"
                variant="default"
              >
                <FileText className="mr-2 size-4" />
                View & Submit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Detail Modal */}
      {item.assignmentId && (
        <AssignmentDetailModal
          assignmentId={item.assignmentId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

const HTTP_PREFIX_REGEX = /^http:\/\//i;
const parseVideoUrls = (content?: string): string[] => {
  if (!content) {
    return [];
  }
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((url) => typeof url === "string" && url.trim())
        .map((url) => url.replace(HTTP_PREFIX_REGEX, "https://"));
    }
  } catch {
    // Not JSON, treat as single url
  }
  return [content]
    .filter(Boolean)
    .map((url) => url.replace(HTTP_PREFIX_REGEX, "https://"));
};

const toHttps = (url: string): string =>
  url.replace(HTTP_PREFIX_REGEX, "https://");

const extractYouTubeId = (parsed: URL): string | null => {
  if (parsed.hostname.includes("youtu.be")) {
    const id = parsed.pathname.slice(1);
    return id || null;
  }

  if (parsed.pathname.startsWith("/shorts/")) {
    const id = parsed.pathname.split("/")[2];
    return id || null;
  }

  if (parsed.pathname.startsWith("/embed/")) {
    const id = parsed.pathname.split("/")[2];
    return id || null;
  }

  if (parsed.searchParams.has("v")) {
    const id = parsed.searchParams.get("v");
    return id || null;
  }

  return null;
};

const getYouTubeEmbedUrl = (rawUrl: string): string | null => {
  const url = toHttps(rawUrl);
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtu.be")
    ) {
      const id = extractYouTubeId(parsed);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
};

const getVimeoEmbedUrl = (rawUrl: string): string | null => {
  const url = toHttps(rawUrl);
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
};

const renderVideoPlayer = (url: string, title: string, key: string) => {
  const normalizedUrl = toHttps(url);
  const yt = getYouTubeEmbedUrl(normalizedUrl);
  if (yt) {
    return (
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="aspect-video w-full rounded-md border"
        key={key}
        src={yt}
        title={title}
      />
    );
  }

  const vimeo = getVimeoEmbedUrl(normalizedUrl);
  if (vimeo) {
    return (
      <iframe
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full rounded-md border"
        key={key}
        src={vimeo}
        title={title}
      />
    );
  }

  return (
    <video
      aria-label={title}
      className="w-full rounded-md border"
      controls
      key={key}
    >
      <source src={normalizedUrl} />
      <track kind="captions" />
    </video>
  );
};

function VideoItemCard(
  item: ModuleContentItem,
  courseSlug: string,
  moduleSlug: string
) {
  const urls = parseVideoUrls(item.content);

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
      <div className="space-y-3">
        {urls.length > 0 ? (
          urls.map((url, idx) =>
            renderVideoPlayer(
              url,
              `${item.title} ${idx + 1}`,
              `${item.title}-${idx}`
            )
          )
        ) : (
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
  const isFileUrl = item.content && isUrl(item.content);
  const shouldShowReadMoreLink = item.slug && !isFileUrl;

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
          className={isFileUrl ? "" : "max-h-[200px] overflow-hidden"}
          content={item.content || ""}
        />
        {shouldShowReadMoreLink && (
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
    if (item.type === "quiz" && item.quizId) {
      return (
        <div key={`quiz-${item.position}`} className="my-4">
          <QuizItem
            isCompleted={false}
            orderIndex={item.orderIndex}
            quizId={item.quizId}
            title={item.title}
          />
        </div>
      );
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
