import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export const useAdmissionLetterUrl = ({
  enrollmentId,
  initialUrl,
}: {
  enrollmentId?: Id<"enrollment">;
  initialUrl?: string | null;
}) => {
  const data = useQuery(
    api.enrollments.getAdmissionLetterUrl,
    enrollmentId ? { enrollmentId } : "skip"
  );

  return initialUrl ?? data ?? null;
};
