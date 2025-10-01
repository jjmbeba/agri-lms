"use client";

import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { displayToastError } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Badge } from "../ui/badge";

type EnrollCourseBtnProps = {
  courseId: Id<"course">;
  isEnrolled: boolean;
};

const EnrollCourseBtn = ({ courseId, isEnrolled }: EnrollCourseBtnProps) => {
  const { mutate: enroll, isPending: isEnrolling } = useMutation({
    mutationFn: useConvexMutation(api.enrollments.createEnrollment),
    onSuccess: () => {
      toast.success("Enrolled in course successfully");
    },
    onError: (error) => {
      displayToastError(error);
    },
  });

  if (isEnrolled) {
    return <Badge variant="outline">Enrolled</Badge>;
  }

  return (
    <Button disabled={isEnrolling} onClick={() => enroll({ courseId })}>
      {isEnrolling && <Loader2 className="mr-2 size-4 animate-spin" />}
      {isEnrolling ? "Enrolling..." : "Enroll"}
    </Button>
  );
};

export default EnrollCourseBtn;
