"use client";

import { convexQuery, useSuspenseQuery } from "@convex-dev/react-query";
import { useSuspenseQuery as useSuspenseQueryBase } from "@tanstack/react-query";
import type { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../../../convex/_generated/api";

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
        <video aria-label={content.title} className="w-full rounded-md" controls>
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
    <section className="space-y-2">
      <h2 className="font-semibold text-xl">{content.title}</h2>
      {content.content ? (
        <p className="prose-sm max-w-none">{content.content}</p>
      ) : (
        <p className="text-muted-foreground text-sm">No content provided.</p>
      )}
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
      return (
        <AssignmentContentCard
          title={content.title}
          instructions={content.instructions}
          dueDate={content.dueDate}
          maxScore={content.maxScore}
        />
      );
    }
    if (content.type === "video") {
      return <VideoContentCard title={content.title} content={content.content} />;
    }
    return <TextContentCard title={content.title} content={content.content} />;
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link
          href={`/courses/${courseSlug}/modules/${moduleSlug}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Back to {module.title}
        </Link>
        <h1 className="font-semibold text-2xl">{content.title}</h1>
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

