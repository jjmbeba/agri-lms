"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CourseRequestForm } from "./course-request-form";

export const CourseRequestDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button aria-label="Request a course" type="button" variant="outline">
          Request a course
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a Course</DialogTitle>
          <DialogDescription>
            Tell us which course you want us to offer and why it matters to you.
          </DialogDescription>
        </DialogHeader>
        <CourseRequestForm onSubmitted={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

