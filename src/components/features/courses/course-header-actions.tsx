"use client";

import {
  IconEdit,
  IconSettings,
  IconShare,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import CourseForm from "./course-form";
import type { CourseWithCategory } from "./types";

const CourseHeaderActions = ({
  courseDetails,
}: {
  courseDetails: CourseWithCategory;
}) => {
  const router = useRouter();
  const { mutate: deleteCourse } = trpc.courses.deleteCourse.useMutation({
    onSuccess: () => {
      toast.success("Course deleted successfully");
      router.push("/courses");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return (
    <div className="flex flex-col gap-2 lg:flex-row">
      <Button size="sm" variant="outline">
        <IconShare className="mr-2 h-4 w-4" />
        Share
      </Button>
      <EditCourseButton courseDetails={courseDetails} />
      <Button size="sm" variant="outline">
        <IconSettings className="mr-2 h-4 w-4" />
        Settings
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive">
            <IconTrash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              course and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={() => deleteCourse(courseDetails.course.id)}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const EditCourseButton = ({
  courseDetails,
}: {
  courseDetails: CourseWithCategory;
}) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger asChild>
          <Button size="sm" variant="outline">
            <IconEdit className="mr-2 h-4 w-4" />
            Edit Course
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Course</DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <CourseForm
              courseDetails={courseDetails}
              id={courseDetails.course.id}
              type="edit"
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <IconEdit className="mr-2 h-4 w-4" />
          Edit Course
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
        </DialogHeader>
        <CourseForm
          courseDetails={courseDetails}
          id={courseDetails.course.id}
          type="edit"
        />
      </DialogContent>
    </Dialog>
  );
};

export default CourseHeaderActions;
