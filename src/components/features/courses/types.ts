import type { RouterOutputs } from "@/trpc/init";

export type CourseWithCategory = RouterOutputs["courses"]["getCourses"][number];
