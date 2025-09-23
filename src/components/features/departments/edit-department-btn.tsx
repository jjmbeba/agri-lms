"use client";

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
import type { Doc } from "../../../../convex/_generated/dataModel";
import DepartmentForm from "./department-form";

type EditDepartmentButtonProps = {
  id: string;
  departmentDetails: Doc<"department">;
};

const EditDepartmentButton = ({
  id,
  departmentDetails,
}: EditDepartmentButtonProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button className="gap-2" size="sm" variant="outline">
            Edit
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-3/4 max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Edit Department</DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <DepartmentForm
              departmentDetails={departmentDetails}
              id={id}
              type="edit"
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2" size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
        </DialogHeader>
        <DepartmentForm
          departmentDetails={departmentDetails}
          id={id}
          type="edit"
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditDepartmentButton;
