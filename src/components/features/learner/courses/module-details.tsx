"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";
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
  preloadedModule: Preloaded<typeof api.modules.getModuleWithContentById>;
};

export function ModuleDetails({
  moduleId,
  preloadedModule,
}: ModuleDetailsProps) {
  // Prefer preloaded data (SSR), fallback to client query if needed
  const preloaded = usePreloadedQuery(preloadedModule);

  const { data: moduleData } = useSuspenseQuery(
    convexQuery(api.modules.getModuleWithContentById, { id: moduleId })
  );

  const data = preloaded ?? moduleData ?? null;

  if (!data) {
    return (
      <div className="py-12 text-center">
        <h3 className="mb-2 font-semibold text-lg">Module not found</h3>
        <p className="text-muted-foreground">
          This module may have been removed.
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
        <Button type="button">Mark as Completed</Button>
      </header>

      {(data.content ?? []).map((item: ModuleContentItem) =>
        renderContentItem(item)
      )}
    </div>
  );
}
