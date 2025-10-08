/** biome-ignore-all lint/performance/noNamespaceImport: Recommended by docs */
import * as z from "zod";

export const assignmentSubmissionSchema = z.object({
  content: z.string(),
});

export const assignmentSubmissionHistorySchema = z.object({
  submission: z.string().min(1),
  file: z.instanceof(File).optional(),
});
