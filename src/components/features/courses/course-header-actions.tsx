"use client";

import {
  IconEdit,
  IconSettings,
  IconShare,
  IconTrash,
} from "@tabler/icons-react";
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
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";

const CourseHeaderActions = ({ courseId }: { courseId: string }) => {
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
      <Button size="sm" variant="outline">
        <IconEdit className="mr-2 h-4 w-4" />
        Edit Course
      </Button>
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
              onClick={() => deleteCourse(courseId)}
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
