"use client";

import { useQuery } from "convex/react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Eye,
  Target,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDueDate } from "@/lib/validations/assignment";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { AssignmentDetailModal } from "./assignment-detail-modal";

type AssignmentItemProps = {
  assignmentId: Id<"assignment">;
  title: string;
  orderIndex: number;
  isCompleted?: boolean;
};

export function AssignmentItem({
  assignmentId,
  title,
  orderIndex,
  isCompleted = false,
}: AssignmentItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const assignmentData = useQuery(
    api.assignments.getAssignmentWithSubmissions,
    { assignmentId }
  );

  if (!assignmentData) {
    return (
      <li className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 text-xs">
              {orderIndex + 1}
            </div>
            <p className="text-sm">
              <span className="font-medium">{title}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground uppercase tracking-wide">
            assignment
          </span>
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      </li>
    );
  }

  const { assignment, latestSubmission } = assignmentData;
  const isLate = assignment.dueDate
    ? new Date() > new Date(assignment.dueDate)
    : false;
  const hasSubmission = latestSubmission !== null;

  const getStatusBadge = () => {
    if (!hasSubmission) {
      return (
        <Badge className="text-xs" variant="outline">
          Not Submitted
        </Badge>
      );
    }

    if (latestSubmission.isLate) {
      return (
        <Badge className="text-xs" variant="destructive">
          Late
        </Badge>
      );
    }

    if (latestSubmission.status === "graded") {
      return (
        <Badge className="text-xs" variant="secondary">
          Graded
        </Badge>
      );
    }

    return (
      <Badge className="text-xs" variant="default">
        Submitted
      </Badge>
    );
  };

  const getStatusIcon = () => {
    if (!hasSubmission) {
      return <Upload className="h-4 w-4 text-muted-foreground" />;
    }

    if (latestSubmission.status === "graded") {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }

    if (latestSubmission.isLate) {
      return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }

    return <CheckCircle className="h-4 w-4 text-blue-600" />;
  };

  return (
    <>
      <li className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div
              className={`flex size-6 items-center justify-center rounded-full text-xs ${
                isCompleted
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isCompleted ? "✓" : orderIndex + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{title}</span>
              </p>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Target className="h-3 w-3" />
                  <span>{assignment.maxScore} pts</span>
                </div>
                {assignment.dueDate && (
                  <>
                    <span className="text-muted-foreground text-xs">•</span>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDueDate(assignment.dueDate)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground uppercase tracking-wide">
            assignment
          </span>
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
          <Button
            className="h-8 px-2"
            onClick={() => setIsModalOpen(true)}
            size="sm"
            variant="ghost"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </li>

      {/* Late submission warning */}
      {isLate && !hasSubmission && (
        <li className="px-4 pb-2">
          <Alert className="py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              This assignment is past its due date. Any submission will be
              marked as late.
            </AlertDescription>
          </Alert>
        </li>
      )}

      {/* Graded submission info */}
      {hasSubmission && latestSubmission.status === "graded" && (
        <li className="px-4 pb-2">
          <Alert className="py-2">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Assignment graded: {latestSubmission.score}/{assignment.maxScore}{" "}
              points
              {latestSubmission.feedback && (
                <span className="mt-1 block font-medium">
                  Feedback: {latestSubmission.feedback}
                </span>
              )}
            </AlertDescription>
          </Alert>
        </li>
      )}

      <AssignmentDetailModal
        assignmentId={assignmentId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
