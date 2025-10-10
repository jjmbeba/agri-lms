"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { createAdminGradeSchema } from "./schema";

type GradeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissionId: Id<"assignmentSubmission"> | null;
};

export function GradeDialog({
  open,
  onOpenChange,
  submissionId,
}: GradeDialogProps) {
  const { data: submission, isLoading } = useQuery({
    ...convexQuery(api.assignments.getSubmissionWithCourseData, {
      submissionId: submissionId as Id<"assignmentSubmission">,
    }),
    enabled: !!submissionId,
  });

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: useConvexMutation(api.assignments.updateSubmissionStatus),
    onSuccess: () => {
      toast.success("Submission graded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to grade submission: ${error.message}`);
    },
  });

  const maxScore = useMemo(
    () => submission?.assignment?.maxScore ?? 0,
    [submission]
  );
  const schema = useMemo(() => createAdminGradeSchema(maxScore), [maxScore]);

  const form = useForm({
    defaultValues: {
      score: submission?.submission?.score ?? 0,
      feedback: submission?.submission?.feedback ?? "",
    },
    onSubmit: ({ value }) => {
      if (!submissionId) {
        return;
      }
      updateStatus({
        submissionId,
        status: "graded",
        score: value.score,
        feedback: value.feedback.trim() || undefined,
      });
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: schema,
    },
  });

  // Reset form when submission changes
  useEffect(() => {
    if (submission) {
      form.reset({
        score: submission.submission?.score ?? 0,
        feedback: submission.submission?.feedback ?? "",
      });
    }
  }, [submission, form]);

  if (isLoading) {
    return (
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade submission</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">
              Loading submission data...
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grade submission</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="space-y-1">
            <form.Field name="score">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="score">Score</FieldLabel>
                  <Input
                    id="score"
                    max={maxScore}
                    min={0}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    placeholder="Enter score"
                    type="number"
                    value={field.state.value}
                  />
                  <FieldDescription className="text-muted-foreground text-xs">
                    0 to {maxScore}
                  </FieldDescription>
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>
                      {field.state.meta.errors[0]?.message}
                    </FieldError>
                  )}
                </Field>
              )}
            </form.Field>
          </div>
          <div className="space-y-1">
            <form.Field name="feedback">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="feedback">Feedback</FieldLabel>
                  <Textarea
                    id="feedback"
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter feedback..."
                    value={field.state.value}
                  />
                  <FieldDescription className="text-muted-foreground text-xs">
                    Optional feedback for the student
                  </FieldDescription>
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>
                      {field.state.meta.errors[0]?.message}
                    </FieldError>
                  )}
                </Field>
              )}
            </form.Field>
          </div>

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  disabled={!canSubmit || isSubmitting || isUpdating}
                  type="submit"
                >
                  {isSubmitting ? "Saving..." : "Save grade"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
