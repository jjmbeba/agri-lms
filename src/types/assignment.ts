import type { Doc, Id } from "../../convex/_generated/dataModel";

export type AssignmentSubmissionType = "file" | "text" | "url";

export type AssignmentSubmissionStatus = "submitted" | "graded";

export type AssignmentSubmission = Doc<"assignmentSubmission">;

export type AssignmentWithSubmissions = {
  assignment: {
    _id: Id<"assignment">;
    moduleContentId: Id<"moduleContent">;
    instructions: string;
    dueDate?: string;
    maxScore: number;
    submissionType: AssignmentSubmissionType;
    title: string;
    content: string;
  };
  submissions: AssignmentSubmission[];
  latestSubmission: AssignmentSubmission | null;
};

export type AssignmentSubmissionFormData = {
  assignmentId: Id<"assignment">;
  submissionType: AssignmentSubmissionType;
  content: string;
};

export type AssignmentSubmissionStatusBadge =
  | "not-submitted"
  | "submitted"
  | "late"
  | "graded";

export type AssignmentSubmissionHistory = {
  attemptNumber: number;
  submittedAt: string;
  isLate: boolean;
  status: AssignmentSubmissionStatus;
  score?: number;
  feedback?: string;
  content: string;
  submissionType: AssignmentSubmissionType;
};

// -----------------------------
// Admin DTOs for submissions lists/inbox
// -----------------------------

export type AdminAssignmentSubmissionRow = {
  submission: AssignmentSubmission;
  assignmentTitle: string;
  courseId: Id<"course">;
};

export type AdminSubmissionsPage = {
  total: number;
  page: number;
  pageSize: number;
  rows: AdminAssignmentSubmissionRow[];
};

export type AdminInboxFilter = {
  courseId?: Id<"course">;
  assignmentId?: Id<"assignment">;
  status?: AssignmentSubmissionStatus;
  q?: string;
  page?: number;
  pageSize?: number;
};
