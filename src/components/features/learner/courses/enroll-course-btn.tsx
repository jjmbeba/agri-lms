"use client";

import { useUser } from "@clerk/nextjs";
import { useConvexAction, useConvexMutation } from "@convex-dev/react-query";
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
  const accessScope: "course" | "module" = moduleId ? "module" : "course";

  const sendEmail = useConvexAction(api.emails.sendEmail);
  const { mutate: enroll, isPending: isEnrolling } = useMutation({
    mutationFn: useConvexMutation(api.enrollments.createEnrollment),
    onError: (error) => {
      displayToastError(error);
    },
  });

  const { mutate: grantFreeModuleAccess, isPending: isGrantingFreeAccess } =
    useMutation({
      mutationFn: useConvexMutation(api.payments.grantFreeModuleAccess),
      onSuccess: () => {
        toast.success("Module unlocked successfully");
        router.refresh();
      },
      onError: (error) => {
        displayToastError(error);
      },
    });

  const CENTS_PER_SHILLING = 100;

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
  const isProcessing = isEnrolling || isPaymentPending || isGrantingFreeAccess;
  const buttonLabel = label ?? (moduleId ? "Unlock Module" : "Enroll Now");

  const handleFreeEnrollment = () => {
    if (moduleId) {
      grantFreeModuleAccess({ courseId, moduleId });
    } else {
      enroll(
        { courseId },
        {
          onSuccess: async (result) => {
            toast.success("Enrolled in course successfully");
            if (!result?.enrollmentId) {
              return;
            }
            try {
              const uploadRes = await fetch("/api/admission-letter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  enrollmentId: result.enrollmentId,
                  courseName: result.courseTitle,
                  courseSlug: result.courseSlug,
                  studentName: result.studentName,
                  studentEmail: result.studentEmail,
                  studentId: result.studentId,
                  admissionDate: result.admissionDate,
                  refNumber: result.refNumber,
                }),
              });
              const uploadJson = (await uploadRes.json()) as { url?: string };
              const letterUrl = uploadJson.url;

              const contentUrl =
                typeof window !== "undefined"
                  ? `${window.location.origin}/courses/${result.courseSlug}`
                  : `/courses/${result.courseSlug}`;

              await sendEmail({
                studentName: result.studentName,
                studentEmail: result.studentEmail,
                scope: "course",
                courseName: result.courseTitle,
                contentUrl,
                admissionDate: result.admissionDate,
                refNumber: result.refNumber,
                studentId: result.studentId,
                admissionLetterUrl: letterUrl,
              });
            } catch (error) {
              displayToastError(error);
            }
          },
        }
      );
    }
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
        amount: priceShillings * CENTS_PER_SHILLING,
        currency: "KES",
        reference: `pay-${user.id}-${Date.now().toString()}-${accessScope}`,
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
        const successMessage =
          accessScope === "module"
            ? "Payment successful. Unlocking module..."
            : "Payment successful. Enrolling in course...";
        toast.success(successMessage);
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
      className="gap-2"
      disabled={isProcessing}
      onClick={handleClick}
      type="button"
    >
      {isProcessing ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <BookOpen className="size-4" />
      )}
      <span className="whitespace-nowrap">
        {isProcessing ? "Processing..." : buttonLabel}
      </span>
      <span className="whitespace-nowrap">({priceLabel})</span>
    </Button>
  );
};

export default EnrollCourseBtn;
