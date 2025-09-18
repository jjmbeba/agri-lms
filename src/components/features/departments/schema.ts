import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  slug: z.string().min(1),
});

export const editDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().min(1),
});
