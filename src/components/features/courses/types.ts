import type { RouterOutputs } from "@/trpc/init";

export type CourseWithCategory = RouterOutputs["courses"]["getCourses"][number];
export type Course = RouterOutputs["courses"]["getCourse"];

export type DraftModule =
  RouterOutputs["modules"]["getDraftModulesByCourseId"][number];

export type Module =
  RouterOutputs["modules"]["getModulesByLatestVersionId"][number];
