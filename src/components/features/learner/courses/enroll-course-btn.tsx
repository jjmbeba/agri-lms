"use client";

import { useUser } from "@clerk/nextjs";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { BookOpen, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  isEnrolled?: boolean;
  priceShillings?: number;
  moduleId?: Id<"module">;
  isUnlocked?: boolean;
  label?: string;
};

const EnrollCourseBtn = ({
  courseId,
  isEnrolled = false,
  priceShillings = 0,
  moduleId,
  isUnlocked = false,
  label,
}: EnrollCourseBtnProps) => {
  const { user } = useUser();
  const router = useRouter();
  const [isPaymentPending, setIsPaymentPending] = useState(false);
  const { mutate: enroll, isPending: isEnrolling } = useMutation({
    mutationFn: useConvexMutation(api.enrollments.createEnrollment),
    onSuccess: () => {
      toast.success("Enrolled in course successfully");
      router.refresh();
    },
    onError: (error) => {
      displayToastError(error);
    },
  });

  // Calculate amount in kobo for Paystack
  const KOBO_PER_SHILLING = 100;

  const initializePayment = usePaystackPayment({
    publicKey: env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  });

  if (moduleId && isUnlocked) {
    return <Badge variant="outline">Module Unlocked</Badge>;
  }

  if (!moduleId && isEnrolled) {
    return <Badge variant="outline">Enrolled</Badge>;
  }

  const priceLabel =
    priceShillings > 0 ? priceFormatter.format(priceShillings) : "Free";
  const accessScope: "course" | "module" = moduleId ? "module" : "course";
  const isProcessing = isEnrolling || isPaymentPending;
  const buttonLabel = label ?? (moduleId ? "Unlock Module" : "Enroll Now");

  const handleFreeEnrollment = () => {
    enroll({ courseId });
  };

  const handlePaidEnrollment = () => {
    if (!user) {
      toast.error("Please sign in to continue.");
      return;
    }

    if (!user.primaryEmailAddress?.emailAddress) {
      toast.error("A valid email address is required to process payment.");
      return;
    }

    setIsPaymentPending(true);
    initializePayment({
      config: {
        email: user.primaryEmailAddress.emailAddress,
        amount: priceShillings * KOBO_PER_SHILLING,
        currency: "KES",
        reference: Date.now().toString(),
        metadata: {
          userId: user.id,
          courseId,
          moduleId: moduleId ?? null,
          accessScope,
          custom_fields: [
            {
              display_name: "Course ID",
              variable_name: "course_id",
              value: String(courseId),
            },
            moduleId
              ? {
                  display_name: "Module ID",
                  variable_name: "module_id",
                  value: String(moduleId),
                }
              : null,
          ].filter(
            (
              field
            ): field is {
              display_name: string;
              variable_name: string;
              value: string;
            } => Boolean(field)
          ),
        },
      },
      onSuccess: () => {
        toast.success("Payment successful. Unlocking access...");
        setIsPaymentPending(false);
        router.refresh();
      },
      onClose: () => {
        setIsPaymentPending(false);
        toast.error("Payment cancelled");
      },
    });
  };

  const handleClick = () => {
    if (priceShillings === 0) {
      handleFreeEnrollment();
      return;
    }
    handlePaidEnrollment();
  };

  return (
    <Button
      aria-label={buttonLabel}
      className="flex flex-col items-start gap-1 text-left sm:flex-row sm:items-center sm:text-sm"
      disabled={isProcessing}
      onClick={handleClick}
      type="button"
    >
      {isProcessing ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <BookOpen className="size-4" />
      )}
      <span>{isProcessing ? "Processing..." : buttonLabel}</span>
      <span className="text-xs sm:ml-2 sm:text-sm">({priceLabel})</span>
    </Button>
  );
};

export default EnrollCourseBtn;
