"use client";

import { PlusIcon } from "lucide-react";
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
import CreateCourseForm from "./course-form";

const CreateCourseButton = () => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger asChild>
          <Button
            aria-label="Open create menu"
            className="rounded-md shadow-none"
            size="icon"
            variant="outline"
          >
            <PlusIcon aria-hidden="true" size={16} />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-3/4 max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Create Course</DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <CreateCourseForm type="create" />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          aria-label="Open create menu"
          className="rounded-md shadow-none"
          size="icon"
          variant="outline"
        >
          <PlusIcon aria-hidden="true" size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Course</DialogTitle>
        </DialogHeader>
        <CreateCourseForm type="create" />
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseButton;
