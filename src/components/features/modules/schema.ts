import { z } from "zod";

export const basicInformationSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  description: z.string().min(1, {
    message: "Description is required",
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
  //   orderIndex: z.number().min(0),
});

export const contentSchema = z.object({
  content: z.array(contentItemSchema).min(1, {
    message: "At least one content item is required",
  }),
});
