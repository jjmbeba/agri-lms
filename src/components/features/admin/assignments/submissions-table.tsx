"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

type SubmissionsTableProps = {
  assignmentId?: Id<"assignment">;
  courseId?: Id<"course">;
  status?: "submitted" | "graded";
  q?: string;
  page?: number;
  pageSize?: number;
  onGradeClick?: (submissionId: Id<"assignmentSubmission">) => void;
  variant: "assignment" | "inbox";
};

export function SubmissionsTable(props: SubmissionsTableProps) {
  const {
    assignmentId,
    courseId,
    status,
    q,
    page = 1,
    pageSize = 20,
    variant,
  } = props;

  const { data, isLoading } = useQuery(
    convexQuery(
      variant === "assignment"
        ? api.assignments.listAssignmentSubmissionsForAdmin
        : api.assignments.listSubmissionsInboxForAdmin,
      variant === "assignment"
        ? {
            assignmentId: assignmentId as Id<"assignment">,
            status,
            page,
            pageSize,
          }
        : { assignmentId, courseId, status, q, page, pageSize }
    )
  );

  // const rows: AdminAssignmentSubmissionRow[] = useMemo(
  //   () => (data?.rows as AdminAssignmentSubmissionRow[]) ?? [],
  //   [data]
  // );

  if (isLoading) {
    return <SubmissionsTableSkeleton />;
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Learner</TableHead>
            <TableHead>Attempt</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Assignment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.rows.map((row) => (
            <TableRow key={row.submission._id}>
              <TableCell className="max-w-[200px] truncate font-medium">
                {row.submission.userName}
              </TableCell>
              <TableCell>#{row.submission.attemptNumber}</TableCell>
              <TableCell>
                {new Date(row.submission.submittedAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    row.submission.status === "graded" ? "default" : "outline"
                  }
                >
                  {row.submission.status}
                </Badge>
              </TableCell>
              <TableCell>
                {row.submission.score != null ? `${row.submission.score}` : "—"}
              </TableCell>
              <TableCell className="max-w-[240px] truncate">
                {row.assignmentTitle}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  onClick={() => props.onGradeClick?.(row.submission._id)}
                  size="sm"
                  type="button"
                >
                  {row.submission.status === "graded" ? "Edit grade" : "Grade"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const SKELETON_ROWS = 5;

function SubmissionsTableSkeleton() {
  const keys = Array.from({ length: SKELETON_ROWS }, (_, i) => `row-${i + 1}`);
  return (
    <div className="space-y-2">
      {keys.map((key) => (
        <div className="flex items-center gap-2" key={key}>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="ml-auto h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
