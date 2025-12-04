"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery as useSuspenseQueryBase } from "@tanstack/react-query";
import type { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { NotesViewer } from "@/components/features/learner/courses/notes-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../../../../convex/_generated/api";

type ModuleContentDetailsProps = {
  courseSlug: string;
  moduleSlug: string;
  contentSlug: string;
  preloadedContent: Preloaded<typeof api.modules.getModuleContentBySlug>;
};

function AssignmentContentCard(content: {
  title: string;
  instructions?: string;
  dueDate?: string;
  maxScore?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{content.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {content.instructions ? <p>{content.instructions}</p> : null}
          <div className="text-muted-foreground">
            {content.dueDate ? <span>Due: {content.dueDate}</span> : null}
            {typeof content.maxScore === "number" ? (
              <span className="ml-3">Max Score: {content.maxScore}</span>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VideoContentCard(content: { title: string; content?: string }) {
  return (
    <section className="space-y-3">
      <h2 className="font-semibold text-xl">{content.title}</h2>
      <div>
        <video
          aria-label={content.title}
          className="w-full rounded-md"
          controls
        >
          {content.content ? <source src={content.content} /> : null}
          <track kind="captions" />
        </video>
        {content.content ? null : (
          <p className="text-muted-foreground text-xs">
            No video source provided.
          </p>
        )}
      </div>
    </section>
  );
}

function TextContentCard(content: { title: string; content?: string }) {
  return (
    <section className="space-y-4">
      <h2 className="font-semibold text-xl">{content.title}</h2>
      <NotesViewer content={content.content || ""} />
    </section>
  );
}

export function ModuleContentDetails({
  courseSlug,
  moduleSlug,
  contentSlug,
  preloadedContent,
}: ModuleContentDetailsProps) {
  const preloaded = usePreloadedQuery(preloadedContent);

  const { data: contentData } = useSuspenseQueryBase(
    convexQuery(api.modules.getModuleContentBySlug, {
      courseSlug,
      moduleSlug,
      contentSlug,
    })
  );

  const data = contentData ?? preloaded ?? null;

  if (!data) {
    return (
      <div className="py-12 text-center">
        <h3 className="mb-2 font-semibold text-lg">
          Content unavailable or locked
        </h3>
        <p className="text-muted-foreground">
          Ensure you have access to this content and try again.
        </p>
      </div>
    );
  }

  const { content, module, previousContentSlug, nextContentSlug } = data;

  const renderContent = () => {
    if (content.type === "assignment") {
      const assignmentContent = content as typeof content & {
        dueDate?: string;
        instructions?: string;
        maxScore?: number;
      };
      return (
        <AssignmentContentCard
          dueDate={assignmentContent.dueDate}
          instructions={assignmentContent.instructions}
          maxScore={assignmentContent.maxScore}
          title={assignmentContent.title}
        />
      );
    }
    if (content.type === "video") {
      return (
        <VideoContentCard content={content.content} title={content.title} />
      );
    }
    return <TextContentCard content={content.content} title={content.title} />;
  };

  return (
    <div className="space-y-6">
      <header className="space-y-5">
        <Link
          className="flex items-center gap-3 text-muted-foreground text-sm hover:text-foreground"
          href={`/courses/${courseSlug}/modules/${moduleSlug}`}
        >
          <ChevronLeft className="size-4" />
          Back to {module.title}
        </Link>
      </header>

      {renderContent()}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t pt-6">
        {previousContentSlug ? (
          <Button asChild variant="outline">
            <Link
              href={`/courses/${courseSlug}/modules/${moduleSlug}/content/${previousContentSlug}`}
            >
              <ChevronLeft className="mr-2 size-4" />
              Previous Content
            </Link>
          </Button>
        ) : (
          <Button disabled variant="outline">
            <ChevronLeft className="mr-2 size-4" />
            Previous Content
          </Button>
        )}
        {nextContentSlug ? (
          <Button asChild variant="outline">
            <Link
              href={`/courses/${courseSlug}/modules/${moduleSlug}/content/${nextContentSlug}`}
            >
              Next Content
              <ChevronRight className="ml-2 size-4" />
            </Link>
          </Button>
        ) : (
          <Button disabled variant="outline">
            Next Content
            <ChevronRight className="ml-2 size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
