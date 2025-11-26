"use client";

import { useUser } from "@clerk/nextjs";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { BookOpen, Loader2 } from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { displayToastError } from "@/lib/utils";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Badge } from "../../../ui/badge";

const priceFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

type EnrollCourseBtnProps = {
  courseId: Id<"course">;
  isEnrolled: boolean;
  priceShillings?: number;
};

const EnrollCourseBtn = ({
  courseId,
  isEnrolled,
  priceShillings = 0,
}: EnrollCourseBtnProps) => {
  const { user } = useUser();
  const { mutate: enroll, isPending: isEnrolling } = useMutation({
    mutationFn: useConvexMutation(api.enrollments.createEnrollment),
    onSuccess: () => {
      toast.success("Enrolled in course successfully");
    },
    onError: (error) => {
      displayToastError(error);
    },
  });

  // Calculate amount in kobo for Paystack
  const KOBO_PER_SHILLING = 100;

  const initializePayment = usePaystackPayment({
    publicKey: env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    reference: Date.now().toString(),
  });

  if (isEnrolled) {
    return <Badge variant="outline">Enrolled</Badge>;
  }

  const priceLabel =
    priceShillings > 0 ? priceFormatter.format(priceShillings) : "Free";

  return (
    <Button
      className="flex flex-col items-start gap-1 text-left sm:flex-row sm:items-center sm:text-sm"
      disabled={isEnrolling}
      onClick={() => {
        if (priceShillings === 0) {
          enroll({ courseId });
        } else {
          // toast.info("This course is paid. Please complete the checkout process to enroll.");
          initializePayment({
            config: {
              email: user?.primaryEmailAddress?.emailAddress ?? "",
              amount: priceShillings * KOBO_PER_SHILLING,
              currency: "KES",
            },
            onSuccess: () => {
              toast.success("Payment successful");
              enroll({ courseId });
            },
            onClose: () => {
              toast.error("Payment cancelled");
            },
          });
        }
      }}
    >
      {isEnrolling ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <BookOpen className="size-4" />
      )}
      <span>{isEnrolling ? "Enrolling..." : "Enroll Now"}</span>
      <span className="text-xs sm:ml-2 sm:text-sm">({priceLabel})</span>
    </Button>
  );
};

export default EnrollCourseBtn;
