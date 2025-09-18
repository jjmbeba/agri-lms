import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
});

export const editDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().min(1, { message: "ID is required" }),
});
