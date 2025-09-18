"use client";

import { IconBuilding } from "@tabler/icons-react";
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
            <IconBuilding className="h-4 w-4" />
            Create Department
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create Department</DrawerTitle>
          </DrawerHeader>
          <DepartmentForm type="create" />
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <IconBuilding className="h-4 w-4" />
          Create Department
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
