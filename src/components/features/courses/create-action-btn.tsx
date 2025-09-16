"use client";

import { BookOpenIcon, FolderOpenIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import CreateCategoryForm from "./create-category-form";
import CreateCourseForm from "./create-course-form";

const CreateActionButton = () => {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<"category" | "course">("category");

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <CreateActionMenu setAction={setAction} setOpen={setOpen} />
        <DrawerContent className="h-3/4 max-h-[85vh]">
          <div className="p-6">
            {action === "category" && <CreateCategoryForm />}
            {action === "course" && <CreateCourseForm />}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <CreateActionMenu setAction={setAction} setOpen={setOpen} />
      <DialogContent>
        {action === "category" && <CreateCategoryForm />}
        {action === "course" && <CreateCourseForm />}
      </DialogContent>
    </Dialog>
  );
};

const CreateActionMenu = ({
  setAction,
  setOpen,
}: {
  setAction: (action: "category" | "course") => void;
  setOpen: (open: boolean) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open create menu"
          className="rounded-md shadow-none"
          size="icon"
          variant="outline"
        >
          <PlusIcon aria-hidden="true" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="pb-2">
        <DropdownMenuLabel>Add category</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            setAction("category");
            setOpen(true);
          }}
        >
          <div
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-md border bg-background"
          >
            <FolderOpenIcon className="opacity-60" size={16} />
          </div>
          <div>
            <div className="font-medium text-sm">Category</div>
            <div className="text-muted-foreground text-xs">
              Add a new category
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setAction("course");
            setOpen(true);
          }}
        >
          <div
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-md border bg-background"
          >
            <BookOpenIcon className="opacity-60" size={16} />
          </div>
          <div>
            <div className="font-medium text-sm">Course</div>
            <div className="text-muted-foreground text-xs">
              Add a new course
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CreateActionButton;
