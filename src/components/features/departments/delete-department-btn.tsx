"use client";

import { useConvexMutation } from "@convex-dev/react-query";
import { IconTrash } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
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
import type { Id } from "../../../../convex/_generated/dataModel";

type Props = {
  id: string;
};

const DeleteDepartmentButton = ({ id }: Props) => {
  const { mutate: deleteDepartment } = useMutation({
    mutationFn: useConvexMutation(api.departments.deleteDepartment),
    onSuccess: () => {
      toast.success("Department deleted successfully");
    },
    onError: (error) => {
      displayToastError(error);
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button size="sm" variant="destructive">
          <IconTrash className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            department and remove it from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={() => deleteDepartment({ id: id as Id<"department"> })}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDepartmentButton;
