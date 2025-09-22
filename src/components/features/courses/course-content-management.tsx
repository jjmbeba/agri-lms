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
  IconFileText,
  IconGripVertical,
  IconMessageCircle,
  IconTrash,
  IconVideo,
} from "@tabler/icons-react";
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
import { capitalize, cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";

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

import CreateModuleBtn from "../modules/create-module-btn";
import EditModuleBtn from "../modules/edit-module-btn";
import type { DraftModule, Module } from "./types";

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

type CourseContentManagementProps = {
  data: DraftModule[] | Module[];
  courseId: string;
  onRefresh?: () => void;
  variant: "published" | "draft";
};

export function CourseContentManagement({
  data,
  courseId,
  onRefresh,
  variant,
}: CourseContentManagementProps) {
  const [modules, setModules] = useState<(DraftModule | Module)[]>(data);
  const { mutateAsync: updateDraftModulePositions } =
    trpc.modules.updateDraftModulePositions.useMutation();

  useEffect(() => {
    setModules(data);
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const moduleIds = useMemo(() => modules.map((m) => m.id), [modules]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const previous = modules;
    const next = arrayMove(previous, oldIndex, newIndex);
    setModules(next);

    // Persist order for draft modules (by courseId)
    const payload = next.map((m, idx) => ({ id: m.id, position: idx + 1 }));
    updateDraftModulePositions({ courseId, items: payload })
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
  const { mutate: deleteDraftModule } =
    trpc.modules.deleteDraftModule.useMutation({
      onSuccess: () => {
        toast.success("Module deleted successfully");
        onRefresh?.();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: deleteDraftModuleContent } =
    trpc.modules.deleteDraftModuleContent.useMutation({
      onSuccess: () => {
        toast.success("Content item deleted successfully");
        onRefresh?.();
      },
      onError: (error) => {
        toast.error(error.message);
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
                  <div className="space-y-2" key={module.id}>
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
                          <p className="text-muted-foreground text-xs sm:text-sm">
                            {module.description}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge
                              className="text-[10px] sm:text-xs"
                              variant="outline"
                            >
                              {module.content?.length || 0} content item(s)
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {variant === "draft" && (
                          <EditModuleBtn
                            moduleData={module}
                            moduleId={module.id}
                            onSuccess={onRefresh}
                          />
                        )}
                        <Button size="sm" variant="outline">
                          Preview
                        </Button>
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
                                  onClick={() => deleteDraftModule(module.id)}
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
                    {module.content && module.content.length > 0 && (
                      <div className="ml-4 space-y-2 sm:ml-8">
                        {module.content.map((contentItem) => (
                          <div
                            className="flex w-full flex-col items-start justify-between gap-2 rounded-md border-muted border-l-2 bg-muted/30 p-3 sm:flex-row sm:items-center"
                            key={contentItem.id}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                              {getLessonIcon(contentItem.type)}
                              <div className="min-w-0 flex-1">
                                {contentItem.type === "file" ||
                                contentItem.type === "video" ? (
                                  <a
                                    className="block max-w-[240px] truncate font-medium text-sm hover:underline sm:max-w-[420px] sm:text-base md:max-w-[560px]"
                                    href={contentItem.content as string}
                                    target="_blank"
                                  >
                                    {capitalize(contentItem.title)}
                                  </a>
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
                                        deleteDraftModuleContent(
                                          contentItem.id
                                        );
                                      }}
                                    >
                                      Delete Content
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {moduleIndex < modules.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                );

                return variant === "draft" ? (
                  <SortableModule id={module.id} key={module.id}>
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
