"use client";

import {
  IconFileText,
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
import type { DraftModule, Module } from "./types";

// // Mock data - in real app, this would come from the database
// const mockLessons = [
//   {
//     id: "1",
//     title: "Introduction to Sustainable Farming",
//     type: "video",
//     duration: "15:30",
//     isPublished: true,
//     order: 1,
//   },
//   {
//     id: "2",
//     title: "Understanding Soil Health",
//     type: "video",
//     duration: "22:45",
//     isPublished: true,
//     order: 2,
//   },
//   {
//     id: "3",
//     title: "Quiz: Soil Health Basics",
//     type: "quiz",
//     duration: "10:00",
//     isPublished: true,
//     order: 3,
//   },
//   {
//     id: "4",
//     title: "Crop Rotation Strategies",
//     type: "video",
//     duration: "18:20",
//     isPublished: false,
//     order: 4,
//   },
//   {
//     id: "5",
//     title: "Reading: Organic Pest Control",
//     type: "reading",
//     duration: "12:00",
//     isPublished: false,
//     order: 5,
//   },
// ];

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
};

export function CourseContentManagement({
  data,
  courseId,
}: CourseContentManagementProps) {
  const { mutate: deleteDraftModule } =
    trpc.modules.deleteDraftModule.useMutation({
      onSuccess: () => {
        toast.success("Module deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: deleteDraftModuleContent } =
    trpc.modules.deleteDraftModuleContent.useMutation({
      onSuccess: () => {
        toast.success("Content item deleted successfully");
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
          <CreateModuleBtn courseId={courseId} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((module, moduleIndex) => (
            <div className="space-y-2" key={module.id}>
              {/* Module Header */}
              <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-medium text-sm">
                    {module.position}
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
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
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
                          <h5 className="font-medium text-sm">
                            {capitalize(contentItem.title)}
                          </h5>
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
                              onClick={() =>
                                deleteDraftModuleContent(contentItem.id)
                              }
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
