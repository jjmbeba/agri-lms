"use client";

import { PlusIcon } from "lucide-react";
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
import DepartmentForm from "./department-form";

const CreateDepartmentButton = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button className="gap-2">
            <PlusIcon className="size-4" />
            <span className="hidden md:block">Create Department</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-3/4 max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Create Department</DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <DepartmentForm type="create" />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusIcon className="size-4" />
          <span className="hidden md:block">Create Department</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Department</DialogTitle>
        </DialogHeader>
        <DepartmentForm type="create" />
      </DialogContent>
    </Dialog>
  );
};

export default CreateDepartmentButton;
