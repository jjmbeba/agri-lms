"use client";

import { useConvexMutation } from "@convex-dev/react-query";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Clock, FileText, Link, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUploadThing } from "@/lib/uploadthing";
import {
  formatDueDate,
  validateFileSize,
  validateFileType,
} from "@/lib/validations/assignment";
import type { AssignmentSubmissionType } from "@/types/assignment";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { assignmentSubmissionSchema } from "./schema";

type AssignmentSubmissionFormProps = {
  assignmentId: Id<"assignment">;
  submissionType: AssignmentSubmissionType;
  dueDate?: string;
  maxScore: number;
  instructions: string;
  submissions: Doc<"assignmentSubmission">[];
};

export function AssignmentSubmissionForm({
  assignmentId,
  submissionType,
  dueDate,
  maxScore,
  instructions,
  submissions,
}: AssignmentSubmissionFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { mutate: submitAssignment, isPending: isSubmitting } = useMutation({
    mutationFn: useConvexMutation(api.assignments.submitAssignment),
    onSuccess: () => {
      toast.success("Assignment submitted successfully");
    },
    onError: (error) => {
      toast.error(`Submission failed: ${error.message}`);
    },
  });

  const form = useForm({
    defaultValues: {
      content: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: assignmentSubmissionSchema,
    },
    onSubmit: ({ value }) => {
      submitAssignment({
        assignmentId,
        submissionType,
        content: value.content,
      });
    },
  });

  const { startUpload, isUploading } = useUploadThing("assignmentUploader", {
    onClientUploadComplete: (res) => {
      if (res[0]?.ufsUrl) {
        form.setFieldValue("content", res[0].ufsUrl);
      }
    },
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleFileSelect = (selectFile: File) => {
    if (!validateFileType(selectFile)) {
      setErrors({ file: "Only PDF, DOCX, XLSX, and PPTX files are allowed" });
      return;
    }

    if (!validateFileSize(selectFile)) {
      setErrors({ file: "File size must be less than 4MB" });
      return;
    }

    setSelectedFile(selectFile);
    setErrors({});

    toast.promise(startUpload([selectFile]), {
      loading: "Uploading file...",
      success: "File uploaded successfully",
      error: "Upload failed",
    });
  };

  const isLate = dueDate ? new Date() > new Date(dueDate) : false;

  return (
    <div className="space-y-6">
      {/* Assignment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Assignment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="font-medium text-sm">Instructions</Label>
            <p className="mt-1 text-muted-foreground text-sm">{instructions}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium text-sm">Max Score</Label>
              <p className="text-muted-foreground text-sm">{maxScore} points</p>
            </div>
            <div>
              <Label className="font-medium text-sm">Due Date</Label>
              <p className="text-muted-foreground text-sm">
                {formatDueDate(dueDate)}
              </p>
            </div>
          </div>

          {isLate && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This assignment is past its due date. Your submission will be
                marked as late.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {submissionType === "file" && <Upload className="h-5 w-5" />}
            {submissionType === "text" && <FileText className="h-5 w-5" />}
            {submissionType === "url" && <Link className="h-5 w-5" />}
            Submit Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {submissionType === "file" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Upload File</Label>
                <Input
                  accept=".pdf,.docx,.xlsx,.pptx"
                  className="mt-1"
                  id="file"
                  onChange={(e) => {
                    const selectFile = e.target.files?.[0];

                    if (selectFile) {
                      handleFileSelect(selectFile);
                    }
                  }}
                  type="file"
                />
                {errors.file && (
                  <p className="mt-1 text-red-600 text-sm">{errors.file}</p>
                )}
                {form.getFieldMeta("content")?.errors?.map((error) => (
                  <p className="mt-1 text-red-600 text-sm" key={error}>
                    {error}
                  </p>
                ))}
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                  <FileText className="h-4 w-4" />
                  <span className="flex-1 text-sm">{selectedFile.name}</span>
                  <Button
                    onClick={() => {
                      setSelectedFile(null);
                      form.setFieldValue("content", "");
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {submissionType === "text" && (
            <div>
              <Label htmlFor="text-content">Your Response</Label>
              <Textarea
                className="mt-1"
                id="text-content"
                onChange={(e) => form.setFieldValue("content", e.target.value)}
                placeholder="Enter your response here..."
                rows={8}
                value={form.getFieldValue("content")}
              />
              {errors.content && (
                <p className="mt-1 text-red-600 text-sm">{errors.content}</p>
              )}
              {form.getFieldMeta("content")?.errors?.map((error) => (
                <p className="mt-1 text-red-600 text-sm" key={error}>
                  {error}
                </p>
              ))}
            </div>
          )}

          {submissionType === "url" && (
            <div>
              <Label htmlFor="url-content">Submission URL</Label>
              <Input
                className="mt-1"
                id="url-content"
                onChange={(e) => form.setFieldValue("content", e.target.value)}
                placeholder="https://example.com/your-submission"
                type="url"
                value={form.getFieldValue("content")}
              />
              {errors.content && (
                <p className="mt-1 text-red-600 text-sm">{errors.content}</p>
              )}
              {form.getFieldMeta("content")?.errors?.map((error) => (
                <p className="mt-1 text-red-600 text-sm" key={error}>
                  {error}
                </p>
              ))}
            </div>
          )}

          <Button
            className="w-full"
            disabled={
              !form.getFieldValue("content") || isSubmitting || isUploading
            }
            onClick={form.handleSubmit}
          >
            {isSubmitting ? "Submitting..." : "Submit Assignment"}
          </Button>
        </CardContent>
      </Card>

      {/* Submission History */}
      {submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Submission History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  className="flex items-center justify-between rounded-md border p-3"
                  key={submission._id}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Attempt {submission.attemptNumber}
                      </Badge>
                      {submission.isLate && (
                        <Badge variant="destructive">Late</Badge>
                      )}
                      {submission.status === "graded" && (
                        <Badge variant="secondary">Graded</Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm">
                    {submission.score !== undefined && (
                      <span className="font-medium">
                        {submission.score}/{maxScore}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
