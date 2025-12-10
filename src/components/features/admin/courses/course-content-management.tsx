"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconEdit,
  IconFileText,
  IconGripVertical,
  IconMessageCircle,
  IconTrash,
  IconVideo,
} from "@tabler/icons-react";
import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  capitalize,
  cn,
  displayToastError,
  formatPriceShillings,
} from "@/lib/utils";

type SortableItemContextValue = {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
};

const SortableItemContext = createContext<SortableItemContextValue | null>(
  null
);

const DRAGGING_OPACITY = 0.6;

const SortableModule = (props: { id: string; children: React.ReactNode }) => {
  const { id, children } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? DRAGGING_OPACITY : undefined,
  };

  return (
    <SortableItemContext.Provider
      value={{ attributes, listeners, setActivatorNodeRef }}
    >
      <div ref={setNodeRef} style={style}>
        {children}
      </div>
    </SortableItemContext.Provider>
  );
};

const DragHandle = (props: { "aria-label": string }) => {
  const context = useContext(SortableItemContext);
  if (!context) {
    return null;
  }

  const { attributes, listeners, setActivatorNodeRef } = context;

  return (
    <button
      aria-label={props["aria-label"]}
      ref={setActivatorNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      className="inline-flex cursor-grab items-center justify-center rounded p-1 text-muted-foreground hover:text-foreground"
    >
      <IconGripVertical aria-hidden="true" className="h-4 w-4" />
      <span className="sr-only">{props["aria-label"]}</span>
    </button>
  );
};

import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import CreateModuleBtn from "../modules/create-module-btn";
import EditModuleBtn from "../modules/edit-module-btn";

const getLessonIcon = (type: string) => {
  switch (type) {
    case "video":
      return <IconVideo className="h-4 w-4" />;
    case "quiz":
      return <IconMessageCircle className="h-4 w-4" />;
    case "text":
    case "file":
      return <IconFileText className="h-4 w-4" />;
    case "assignment":
    case "project":
      return <IconFileText className="h-4 w-4" />;
    default:
      return <IconFileText className="h-4 w-4" />;
  }
};

const parseVideoContent = (content: string): string[] => {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === "string" && item.trim());
    }
  } catch {
    // Not JSON, treat as single URL
  }
  return [content].filter(Boolean);
};

const getLessonTypeColor = (type: string) => {
  switch (type) {
    case "video":
      return "bg-blue-100 text-blue-800";
    case "quiz":
      return "bg-green-100 text-green-800";
    case "text":
    case "file":
      return "bg-purple-100 text-purple-800";
    case "assignment":
      return "bg-orange-100 text-orange-800";
    case "project":
      return "bg-indigo-100 text-indigo-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

type DraftModuleWithContent = Doc<"draftModule"> & {
  content: (Doc<"draftModuleContent"> & {
    dueDate?: string;
    maxScore?: number;
    submissionType?: "file" | "text" | "url";
  })[];
};
type ModuleWithContent = Doc<"module"> & {
  content: Doc<"moduleContent">[];
  lessonCount?: number;
  isAccessible?: boolean;
};

type CourseContentManagementProps = {
  data: DraftModuleWithContent[] | ModuleWithContent[];
  courseId: string;
  courseSlug: string;
  onRefresh?: () => void;
  variant: "published" | "draft";
};

export function CourseContentManagement({
  data,
  courseId,
  courseSlug,
  onRefresh,
  variant,
}: CourseContentManagementProps) {
  const [modules, setModules] = useState<
    (DraftModuleWithContent | ModuleWithContent)[]
  >(data as (DraftModuleWithContent | ModuleWithContent)[]);
  const { mutateAsync: updateDraftModulePositions } = useMutation({
    mutationFn: useConvexMutation(api.modules.updateDraftModulePositions),
    onError: (error) => {
      displayToastError(error);
    },
  });

  useEffect(() => {
    setModules(data as (DraftModuleWithContent | ModuleWithContent)[]);
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const moduleIds = useMemo(() => modules.map((m) => m._id), [modules]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = modules.findIndex((m) => m._id === active.id);
    const newIndex = modules.findIndex((m) => m._id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const previous = modules;
    const next = arrayMove(previous, oldIndex, newIndex);
    setModules(next);

    // Persist order for draft modules (by courseId)
    const payload = next.map((m, idx) => ({ id: m._id, position: idx + 1 }));
    updateDraftModulePositions({
      courseId: courseId as Id<"course">,
      items: payload as { id: Id<"draftModule">; position: number }[],
    })
      .then(() => {
        onRefresh?.();
      })
      .catch((error: unknown) => {
        setModules(previous);
        toast.error(
          error instanceof Error ? error.message : "Failed to save order"
        );
      });
  };
  const { mutate: deleteDraftModule } = useMutation({
    mutationFn: useConvexMutation(api.modules.deleteDraftModule),
    onSuccess: () => {
      toast.success("Module deleted successfully");
      onRefresh?.();
    },
    onError: (error) => {
      displayToastError(error);
    },
  });

  const { mutate: deleteDraftModuleContent } = useMutation({
    mutationFn: useConvexMutation(api.modules.deleteDraftModuleContent),
    onSuccess: () => {
      toast.success("Content item deleted successfully");
      onRefresh?.();
    },
    onError: (error) => {
      displayToastError(error);
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-lg sm:text-xl">Course Content</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Manage lessons, quizzes, and course materials
            </CardDescription>
          </div>
          {variant === "draft" && (
            <div className="flex flex-wrap items-center gap-2">
              <CreateModuleBtn courseId={courseId} />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={variant === "draft" ? handleDragEnd : undefined}
          sensors={variant === "draft" ? sensors : []}
        >
          <SortableContext
            items={variant === "draft" ? moduleIds : []}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3 sm:space-y-4">
              {modules.map((module, moduleIndex) => {
                const moduleContent = (
                  <div className="space-y-2" key={module._id}>
                    {/* Module Header */}
                    <div className="flex flex-col items-start justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:p-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {variant === "draft" && (
                          <DragHandle
                            aria-label={`Drag to reorder module ${module.title}`}
                          />
                        )}
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted font-medium text-xs sm:h-8 sm:w-8 sm:text-sm">
                          {moduleIndex + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-base sm:text-lg">
                            {module.title}
                          </h4>
                          <p className="max-w-2xl text-muted-foreground text-xs sm:max-w-lg sm:text-sm">
                            {module.description}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge
                              className="text-[10px] sm:text-xs"
                              variant="outline"
                            >
                              {"lessonCount" in module && typeof module.lessonCount === "number"
                                ? `${module.lessonCount} content item(s)`
                                : `${module.content?.length || 0} content item(s)`}
                            </Badge>
                            {"priceShillings" in module &&
                              typeof module.priceShillings === "number" && (
                                <Badge
                                  className="text-[10px] sm:text-xs"
                                  variant="secondary"
                                >
                                  {module.priceShillings > 0
                                    ? formatPriceShillings(
                                        module.priceShillings
                                      )
                                    : "Free"}
                                </Badge>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {variant === "draft" && (
                          <EditModuleBtn
                            moduleData={module as DraftModuleWithContent}
                            moduleId={module._id}
                            onSuccess={onRefresh}
                          />
                        )}
                        {/* Only show delete button for draft modules */}
                        {variant === "draft" && module.content && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Module
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {module.title}
                                  "? This action cannot be undone. All content
                                  items in this module will also be deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className={cn(
                                    buttonVariants({
                                      variant: "destructive",
                                    })
                                  )}
                                  onClick={() =>
                                    deleteDraftModule({
                                      id: module._id as Id<"draftModule">,
                                    })
                                  }
                                >
                                  Delete Module
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>

                    {/* Content Items */}
                    {module.content && module.content.length > 0 ? (
                      <div className="ml-4 space-y-2 sm:ml-8">
                        {module.content.map((contentItem) => (
                          <div
                            className="flex w-full flex-col items-start justify-between gap-2 rounded-md border-muted border-l-2 bg-muted/30 p-3 sm:flex-row sm:items-center"
                            key={contentItem._id}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                              {getLessonIcon(contentItem.type)}
                              <div className="min-w-0 flex-1">
                                {contentItem.type === "file" ? (
                                  <a
                                    className="block max-w-[240px] truncate font-medium text-sm hover:underline sm:max-w-[420px] sm:text-base md:max-w-[560px]"
                                    href={contentItem.content as string}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                  >
                                    {capitalize(contentItem.title)}
                                  </a>
                                ) : contentItem.type === "video" ? (
                                  <div className="space-y-1">
                                    <div className="block max-w-[240px] truncate font-medium text-sm sm:max-w-[420px] sm:text-base md:max-w-[560px]">
                                      {capitalize(contentItem.title)}
                                    </div>
                                    {parseVideoContent(contentItem.content as string).map(
                                      (url, idx) => (
                                        <a
                                          className="block max-w-[240px] truncate text-sm text-primary underline-offset-2 hover:underline sm:max-w-[420px] md:max-w-[560px]"
                                          href={url}
                                          key={`${contentItem._id}-video-${idx}`}
                                          rel="noopener noreferrer"
                                          target="_blank"
                                        >
                                          Video {idx + 1}
                                        </a>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <h5 className="block max-w-[240px] truncate font-medium text-sm sm:max-w-[420px] sm:text-base md:max-w-[560px]">
                                    {capitalize(contentItem.title)}
                                  </h5>
                                )}
                                <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs sm:text-xs">
                                  <Badge
                                    className={`${getLessonTypeColor(contentItem.type)} text-[10px] sm:text-xs`}
                                    variant="secondary"
                                  >
                                    {contentItem.type}
                                  </Badge>
                                  <span>
                                    Order: {contentItem.orderIndex + 1}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {variant === "draft" && (
                              <div className="flex items-center gap-2">
                                {/* Edit Notes button for text content */}
                                {contentItem.type === "text" &&
                                  "slug" in contentItem &&
                                  "slug" in module && (
                                    <Button asChild size="sm" variant="outline">
                                      <Link
                                        href={`/courses/${courseSlug}/modules/${module.slug}/content/${contentItem.slug}/edit`}
                                      >
                                        <IconEdit className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <IconTrash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Content Item
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "
                                        {contentItem.title}"? This action cannot
                                        be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className={cn(
                                          buttonVariants({
                                            variant: "destructive",
                                          })
                                        )}
                                        onClick={() => {
                                          if (module.content.length === 1) {
                                            toast.error(
                                              "You cannot delete the last content item in a module. Please add a new content item before deleting this one."
                                            );
                                            return;
                                          }
                                          deleteDraftModuleContent({
                                            id: contentItem._id as Id<"draftModuleContent">,
                                          });
                                        }}
                                      >
                                        Delete Content
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      "lessonCount" in module &&
                      typeof module.lessonCount === "number" &&
                      module.lessonCount > 0 &&
                      variant === "published" && (
                        <div className="ml-4 rounded-md border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-center text-muted-foreground text-sm sm:ml-8">
                          Content is hidden due to access restrictions. This module
                          contains {module.lessonCount} item
                          {module.lessonCount === 1 ? "" : "s"}.
                        </div>
                      )
                    )}

                    {moduleIndex < modules.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                );

                return variant === "draft" ? (
                  <SortableModule id={module._id} key={module._id}>
                    {moduleContent}
                  </SortableModule>
                ) : (
                  moduleContent
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
