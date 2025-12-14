// biome-ignore lint/performance/noNamespaceImport: Recommended by Zod
import * as z from "zod";

export const basicInformationSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  priceShillings: z.number().nonnegative({
    message: "Price must be a non-negative number",
  }),
});

const contentItemSchema = z.object({
  type: z.enum([
    "text",
    "video",
    "file",
    "quiz",
    "assignment",
    "project",
  ] as const),
  content: z.string().min(1, {
    message: "Content is required",
  }),
  title: z.string().min(1, {
    message: "Title is required",
  }),
  // Assignment-specific fields (optional)
  dueDate: z.string().optional(),
  maxScore: z.number().optional(),
  submissionType: z.enum(["file", "text", "url"]).optional(),
  // Quiz-specific fields (optional)
  questions: z
    .array(
      z.object({
        question: z.string().min(1, {
          message: "Question text is required",
        }),
        options: z
          .array(
            z.object({
              text: z.string().min(1, {
                message: "Option text is required",
              }),
              isCorrect: z.boolean(),
            })
          )
          .min(2, {
            message: "Each question must have at least 2 options",
          })
          .max(6, {
            message: "Each question can have at most 6 options",
          }),
        points: z.number().positive({
          message: "Points must be a positive number",
        }),
      })
    )
    .min(1, {
      message: "Quiz must have at least one question",
    })
    .optional(),
  timerMinutes: z
    .number()
    .int()
    .min(0)
    .max(59)
    .optional(),
  timerSeconds: z
    .number()
    .int()
    .min(0)
    .max(59)
    .optional(),
  instructions: z.string().optional(),
  //   orderIndex: z.number().min(0),
});

export const contentSchema = z.object({
  content: z.array(contentItemSchema).min(1, {
    message: "At least one content item is required",
  }),
});
