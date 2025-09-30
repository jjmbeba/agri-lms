"use client";
import { IconEdit } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import type { Doc } from "../../../../../convex/_generated/dataModel";
import CourseForm from "./course-form";

const EditCourseButton = ({
  courseDetails,
  text,
  showIcon = false,
}: {
  courseDetails: Doc<"course">;
  text: string;
  showIcon?: boolean;
}) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger asChild>
          <Button size="sm" variant="outline">
            {showIcon && <IconEdit className="mr-2 h-4 w-4" />}
            {text}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Course</DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <CourseForm
              courseDetails={courseDetails}
              id={courseDetails._id}
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
          {showIcon && <IconEdit className="mr-2 h-4 w-4" />}
          {text}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
        </DialogHeader>
        <CourseForm
          courseDetails={courseDetails}
          id={courseDetails._id}
          type="edit"
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseButton;
