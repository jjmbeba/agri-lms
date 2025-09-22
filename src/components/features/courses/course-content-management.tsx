"use client";

import {
  IconFileText,
  IconGripVertical,
  IconMessageCircle,
  IconTrash,
  IconVideo,
} from "@tabler/icons-react";
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
};

export function CourseContentManagement({
  data,
  courseId,
  onRefresh,
}: CourseContentManagementProps) {
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Course Content</CardTitle>
            <CardDescription>
              Manage lessons, quizzes, and course materials
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button>Publish</Button>
            <CreateModuleBtn courseId={courseId} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((module, moduleIndex) => (
            <div className="space-y-2" key={module.id}>
              {/* Module Header */}
              <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <IconGripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-medium text-sm">
                    {moduleIndex + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{module.title}</h4>
                    <p className="text-muted-foreground text-sm">
                      {module.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className="text-xs" variant="outline">
                        {module.content?.length || 0} content item(s)
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <EditModuleBtn
                    moduleData={module}
                    moduleId={module.id}
                    onSuccess={onRefresh}
                  />
                  <Button size="sm" variant="outline">
                    Preview
                  </Button>
                  {/* Only show delete button for draft modules */}
                  {module.content && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Module</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{module.title}"?
                            This action cannot be undone. All content items in
                            this module will also be deleted.
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
                <div className="ml-8 space-y-2">
                  {module.content.map((contentItem) => (
                    <div
                      className="flex items-center justify-between rounded-md border-muted border-l-2 bg-muted/30 p-3"
                      key={contentItem.id}
                    >
                      <div className="flex items-center gap-2">
                        {getLessonIcon(contentItem.type)}
                        <div>
                          {contentItem.type === "file" ||
                          contentItem.type === "video" ? (
                            <a
                              className="font-medium text-sm hover:underline"
                              href={contentItem.content as string}
                              target="_blank"
                            >
                              {capitalize(contentItem.title)}
                            </a>
                          ) : (
                            <h5 className="font-medium text-sm">
                              {capitalize(contentItem.title)}
                            </h5>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Badge
                              className={`${getLessonTypeColor(contentItem.type)} text-xs`}
                              variant="secondary"
                            >
                              {contentItem.type}
                            </Badge>
                            <span>Order: {contentItem.orderIndex + 1}</span>
                          </div>
                        </div>
                      </div>
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
                              {contentItem.title}"? This action cannot be
                              undone.
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
                              onClick={() => {
                                if (module.content.length === 1) {
                                  toast.error(
                                    "You cannot delete the last content item in a module. Please add a new content item before deleting this one."
                                  );
                                  return;
                                }
                                deleteDraftModuleContent(contentItem.id);
                              }}
                            >
                              Delete Content
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}

              {moduleIndex < data.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
