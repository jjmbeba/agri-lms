"use client";

import { BookOpenIcon, FolderOpenIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateCategoryForm from "./create-category-form";
import CreateCourseForm from "./create-course-form";

const CreateActionButton = () => {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<"category" | "course">("category");
  return (
    <Dialog onOpenChange={setOpen} open={open}>
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
      <DialogContent>
        {action === "category" && <CreateCategoryForm />}
        {action === "course" && <CreateCourseForm />}
      </DialogContent>
    </Dialog>
  );
};

export default CreateActionButton;
