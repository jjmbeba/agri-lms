"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { GradeDialog } from "../assignments/grade-dialog";
import { SubmissionsTable } from "../assignments/submissions-table";

export function SubmissionsInbox() {
  const [gradingSubmissionId, setGradingSubmissionId] =
    useState<Id<"assignmentSubmission"> | null>(null);
  const [isGradeOpen, setIsGradeOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submissions Inbox</CardTitle>
        <CardDescription>Review and grade recent submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <SubmissionsTable
          onGradeClick={(id) => {
            setGradingSubmissionId(id);
            setIsGradeOpen(true);
          }}
          variant="inbox"
        />
        <GradeDialog
          onOpenChange={setIsGradeOpen}
          open={isGradeOpen}
          submissionId={gradingSubmissionId}
        />
      </CardContent>
    </Card>
  );
}
