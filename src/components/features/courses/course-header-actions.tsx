"use client";

import { useConvexMutation } from "@convex-dev/react-query";
import { IconShare, IconTrash } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
import { cn, displayToastError } from "@/lib/utils";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import EditCourseButton from "./edit-course-btn";

const CourseHeaderActions = ({
  courseDetails,
}: {
  courseDetails: Doc<"course">;
}) => {
  const router = useRouter();
  const { mutate: deleteCourse } = useMutation({
    mutationFn: useConvexMutation(api.courses.deleteCourse),
    onSuccess: () => {
      toast.success("Course deleted successfully");
      router.push("/courses");
    },
    onError: (error) => {
      displayToastError(error);
    },
  });
  return (
    <div className="flex flex-col gap-2 lg:flex-row">
      <Button size="sm" variant="outline">
        <IconShare className="mr-2 h-4 w-4" />
        Share
      </Button>
      <EditCourseButton
        courseDetails={courseDetails}
        showIcon
        text="Edit Course"
      />
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
              onClick={() => deleteCourse({ id: courseDetails._id })}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default CourseHeaderActions;
