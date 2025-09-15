import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  tags: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .min(1, {
      message: "Tags are required",
    }),
  categoryId: z.string().min(1, {
    message: "Category is required",
  }),
});
