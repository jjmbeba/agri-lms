import { z } from "zod";

export const createModuleSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  type: z.string().min(1, {
    message: "Type is required",
  }),
  position: z.number(),
  content: z.string().min(1, {
    message: "Content is required",
  }),
});
