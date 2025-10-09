import { z } from "zod";

const MAX_FEEDBACK_LENGTH = 1000;

// Factory to build a grading schema bounded by the assignment's maxScore
export function createAdminGradeSchema(maxScore: number) {
  const boundedScore = z
    .number({ error: "Score is required" })
    .min(0, "Score cannot be negative")
    .max(maxScore, `Score must be ≤ ${maxScore}`);

  return z.object({
    score: boundedScore,
    feedback: z
      .string()
      .trim()
      .max(
        MAX_FEEDBACK_LENGTH,
        `Feedback must be at most ${MAX_FEEDBACK_LENGTH} characters`
      ),
  });
}

export type AdminGradeForm = z.infer<ReturnType<typeof createAdminGradeSchema>>;
