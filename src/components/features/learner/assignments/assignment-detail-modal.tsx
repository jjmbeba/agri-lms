"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  FileText,
  Target,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatDueDate } from "@/lib/validations/assignment";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { AssignmentSubmissionForm } from "./assignment-submission-form";

type AssignmentDetailModalProps = {
  assignmentId: Id<"assignment">;
  isOpen: boolean;
  onClose: () => void;
};

export function AssignmentDetailModal({
  assignmentId,
  isOpen,
  onClose,
}: AssignmentDetailModalProps) {
  const { data: assignmentData } = useSuspenseQuery(
    convexQuery(api.assignments.getAssignmentWithSubmissions, { assignmentId })
  );

  if (!assignmentData) {
    return (
      <Dialog onOpenChange={onClose} open={isOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Assignment...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { assignment, submissions, latestSubmission } = assignmentData;
  const isLate = assignment.dueDate
    ? new Date() > new Date(assignment.dueDate)
    : false;
  const hasSubmission = latestSubmission !== null;

  const getStatusBadge = () => {
    if (!hasSubmission) {
      return <Badge variant="outline">Not Submitted</Badge>;
    }

    if (latestSubmission.isLate) {
      return <Badge variant="destructive">Late Submission</Badge>;
    }

    if (latestSubmission.status === "graded") {
      return <Badge variant="secondary">Graded</Badge>;
    }

    return <Badge variant="default">Submitted</Badge>;
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {assignment.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Assignment Overview</span>
                {getStatusBadge()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Max Score</p>
                    <p className="text-muted-foreground text-sm">
                      {assignment.maxScore} points
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Due Date</p>
                    <p className="text-muted-foreground text-sm">
                      {formatDueDate(assignment.dueDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Submission Type</p>
                    <p className="text-muted-foreground text-sm capitalize">
                      {assignment.submissionType}
                    </p>
                  </div>
                </div>
              </div>

              {isLate && !hasSubmission && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This assignment is past its due date. Any submission will be
                    marked as late.
                  </AlertDescription>
                </Alert>
              )}

              {hasSubmission && latestSubmission.isLate && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your submission was marked as late.
                  </AlertDescription>
                </Alert>
              )}

              {hasSubmission && latestSubmission.status === "graded" && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your assignment has been graded. Score:{" "}
                    {latestSubmission.score}/{assignment.maxScore}
                    {latestSubmission.feedback && (
                      <div className="mt-2">
                        <p className="font-medium">Feedback:</p>
                        <p className="text-sm">{latestSubmission.feedback}</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{assignment.instructions}</p>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Content */}
          {assignment.content && (
            <Card>
              <CardHeader>
                <CardTitle>Assignment Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{assignment.content}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Submission Form */}
          <div>
            <AssignmentSubmissionForm
              assignmentId={assignmentId}
              dueDate={assignment.dueDate}
              instructions={assignment.instructions}
              maxScore={assignment.maxScore}
              submissions={submissions}
              submissionType={assignment.submissionType}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
