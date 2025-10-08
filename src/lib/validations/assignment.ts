import { z } from "zod";

export const assignmentSubmissionSchema = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  submissionType: z.enum(["file", "text", "url"], {
    message: "Submission type is required",
  }),
  content: z.string().min(1, "Content is required"),
});

export const fileSubmissionSchema = z.object({
  content: z.string().url("Invalid file URL"),
});

const MAX_TEXT_LENGTH = 10_000;
const MIN_TEXT_LENGTH = 1;

export const textSubmissionSchema = z.object({
  content: z
    .string()
    .min(MIN_TEXT_LENGTH, "Text submission cannot be empty")
    .max(MAX_TEXT_LENGTH, "Text submission is too long"),
});

export const urlSubmissionSchema = z.object({
  content: z.string().url("Invalid URL format"),
});

// File type validation helpers
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const;

export const MAX_FILE_SIZE = 4_194_304; // 4MB

export function validateFileType(file: File): boolean {
  return ALLOWED_FILE_TYPES.includes(
    file.type as (typeof ALLOWED_FILE_TYPES)[number]
  );
}

export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

export function getFileTypeErrorMessage(file: File): string {
  if (!validateFileType(file)) {
    return "Only PDF, DOCX, XLSX, and PPTX files are allowed";
  }
  if (!validateFileSize(file)) {
    return "File size must be less than 4MB";
  }
  return "";
}

// URL validation helper
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Due date validation helper
export function isSubmissionLate(
  dueDate: string | undefined,
  submittedAt: string
): boolean {
  if (!dueDate) {
    return false;
  }
  return new Date(submittedAt) > new Date(dueDate);
}

// Format due date for display
const MILLISECONDS_PER_DAY = 86_400_000; // 24 * 60 * 60 * 1000

export function formatDueDate(dueDate: string | undefined): string {
  if (!dueDate) {
    return "No due date";
  }

  const date = new Date(dueDate);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDaysRaw = diffTime / MILLISECONDS_PER_DAY;
  const diffDays =
    diffTime < 0 ? Math.floor(diffDaysRaw) : Math.ceil(diffDaysRaw);

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`;
  }
  if (diffDays === 0) {
    return "Due today";
  }
  if (diffDays === 1) {
    return "Due tomorrow";
  }
  return `Due in ${diffDays} days`;
}
