"use client";

import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { displayToastError } from "@/lib/utils";
import { api } from "../../../../../convex/_generated/api";

type CourseRequestFormProps = {
  onSubmitted?: () => void;
};

export const CourseRequestForm = ({ onSubmitted }: CourseRequestFormProps) => {
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");

  const { mutate: submitRequest, isPending } = useMutation({
    mutationFn: useConvexMutation(api.courseRequests.submitCourseRequest),
    onSuccess: () => {
      toast.success("Request submitted");
      setTitle("");
      setReason("");
      onSubmitted?.();
    },
    onError: (error) => {
      displayToastError(error);
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedReason = reason.trim();

    if (!trimmedTitle) {
      toast.error("Please add a course title.");
      return;
    }

    if (!trimmedReason) {
      toast.error("Please add a reason for your request.");
      return;
    }

    submitRequest({
      title: trimmedTitle,
      reason: trimmedReason,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="font-medium text-sm" htmlFor="request-title">
          Course title
        </label>
        <Input
          aria-label="Course title"
          disabled={isPending}
          id="request-title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Organic Crop Management"
          required
          type="text"
          value={title}
        />
      </div>

      <div className="space-y-2">
        <label className="font-medium text-sm" htmlFor="request-reason">
          Why do you want this course?
        </label>
        <Textarea
          aria-label="Course request reason"
          className="min-h-[120px]"
          disabled={isPending}
          id="request-reason"
          onChange={(event) => setReason(event.target.value)}
          placeholder="Share your goals, challenges, or outcomes you expect."
          required
          value={reason}
        />
      </div>

      <div className="flex justify-end">
        <Button
          aria-label="Submit course request"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Submitting..." : "Submit request"}
        </Button>
      </div>
    </form>
  );
};
