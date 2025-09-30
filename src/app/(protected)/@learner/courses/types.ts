import type { InferSelectModel } from "drizzle-orm";
import type { course, department } from "@/db/schema";

export type CourseRow = InferSelectModel<typeof course>;
export type DepartmentRow = InferSelectModel<typeof department>;

export type CourseWithDepartment = {
  course: CourseRow;
  department: DepartmentRow | null;
};
