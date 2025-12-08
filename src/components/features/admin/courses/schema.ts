// biome-ignore lint/performance/noNamespaceImport: Recommended by Zod
import * as z from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  handout: z.string(),
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
  departmentId: z.string().min(1, {
    message: "Department is required",
  }),
  priceShillings: z.number().nonnegative({
    message: "Price must be a non-negative number",
  }),
});

export const editCourseSchema = createCourseSchema.extend({
  id: z.string().min(1, {
    message: "ID is required",
  }),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  slug: z.string().min(1, {
    message: "Slug is required",
  }),
});
