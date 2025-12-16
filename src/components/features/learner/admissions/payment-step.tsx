"use client";

import { useUser } from "@clerk/nextjs";
import {
  convexQuery,
  useConvexAction,
  useConvexMutation,
} from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePaystackPayment } from "react-paystack";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/env";
import { displayToastError } from "@/lib/utils";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useAdmissionFormContext } from "./admission-form-context";

const priceFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

type PaymentStepProps = {
  handleBackStep: () => void;
  courseId: Id<"course">;
  priceShillings: number;
  onPaymentSuccess?: () => void;
  moduleId?: Id<"module">;
  moduleName?: string;
  modulePriceShillings?: number;
};

const PaymentStep = ({
  handleBackStep,
  courseId,
  priceShillings,
  onPaymentSuccess,
  moduleId,
  moduleName,
  modulePriceShillings,
}: PaymentStepProps) => {
  const { user } = useUser();
  const router = useRouter();
  const { formData, clearForm } = useAdmissionFormContext();
  const [isPaymentPending, setIsPaymentPending] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [submittedAdmissionFormId, setSubmittedAdmissionFormId] =
    useState<Id<"admissionForm"> | null>(null);

  const sendEnrollmentEmail = useConvexAction(api.emails.sendEnrollmentEmail);
  const { mutate: submitAdmissionForm, isPending: isSubmittingAdmission } =
    useMutation({
      mutationFn: useConvexMutation(api.admissions.submitAdmissionForm),
      onError: (error) => {
        displayToastError(error);
        setIsSubmittingForm(false);
      },
    });

  const { mutate: linkAdmissionToEnrollment } = useMutation({
    mutationFn: useConvexMutation(api.admissions.linkAdmissionFormToEnrollment),
    onError: (error) => {
      displayToastError(error);
    },
  });

  const { mutate: grantFreeModuleAccess, isPending: isGrantingFreeAccess } =
    useMutation({
      mutationFn: useConvexMutation(api.payments.grantFreeModuleAccess),
      onError: (error) => {
        displayToastError(error);
      },
    });

  const CENTS_PER_SHILLING = 100;

  const initializePayment = usePaystackPayment({
    publicKey: env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  });

  const bringPaystackToFront = () => {
    const iframe = document.querySelector(
      'iframe[name="paystack_checkout"]'
    ) as HTMLIFrameElement | null;
    if (iframe) {
      iframe.style.zIndex = "2147483647";
      iframe.style.pointerEvents = "auto";
      const parent = iframe.parentElement;
      if (parent) {
        parent.style.zIndex = "2147483647";
        parent.style.pointerEvents = "auto";
      }
    }
  };

  const accessScope: "course" | "module" = moduleId ? "module" : "course";

  const { data: admissionFormData } = useQuery(
    convexQuery(api.admissions.getAdmissionFormByCourse, { courseId })
  );

  const { data: modulesData } = useQuery(
    convexQuery(api.modules.getModulesByLatestVersionId, { courseId })
  );

  const sendEnrollmentEmailAfterAdmission = async (enrollmentResult: {
    enrollmentId: Id<"enrollment">;
    courseTitle: string;
    courseSlug: string;
    studentName: string;
    studentEmail: string;
    studentId: string;
    admissionDate: string;
    refNumber: string;
  }) => {
    const recipientEmail =
      formData?.applicantPersonalDetails.email ?? enrollmentResult.studentEmail;
    if (!recipientEmail) {
      toast.error("A valid email address is required to send confirmation.");
      return;
    }

    try {
      const uploadRes = await fetch("/api/admission-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: enrollmentResult.enrollmentId,
          courseName: enrollmentResult.courseTitle,
          courseSlug: enrollmentResult.courseSlug,
          studentName: enrollmentResult.studentName,
          studentEmail: enrollmentResult.studentEmail,
          studentId: enrollmentResult.studentId,
          admissionDate: enrollmentResult.admissionDate,
          refNumber: enrollmentResult.refNumber,
        }),
      });

      if (uploadRes.ok) {
        const uploadJson = (await uploadRes.json()) as { url?: string };
        const letterUrl = uploadJson.url;

        const contentUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/courses/${enrollmentResult.courseSlug}`
            : `/courses/${enrollmentResult.courseSlug}`;

        await sendEnrollmentEmail({
          studentName: enrollmentResult.studentName,
          studentEmail: recipientEmail,
          scope: moduleId ? "module" : "course",
          courseName: enrollmentResult.courseTitle,
          moduleName: moduleId ? moduleName ?? "Selected module" : undefined,
          contentUrl,
          admissionDate: enrollmentResult.admissionDate,
          refNumber: enrollmentResult.refNumber,
          studentId: enrollmentResult.studentId,
          admissionLetterUrl: letterUrl,
        });
      }
    } catch (error) {
      // Log error but don't block enrollment
      displayToastError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  const { mutate: enroll, isPending: isEnrolling } = useMutation({
    mutationFn: useConvexMutation(api.enrollments.createEnrollment),
    onSuccess: async (result) => {
      if (
        !result ||
        typeof result !== "object" ||
        !("enrollmentId" in result) ||
        !result.enrollmentId
      ) {
        toast.error("Enrollment failed");
        return;
      }

      const enrollmentResult = result as {
        enrollmentId: Id<"enrollment">;
        courseTitle: string;
        courseSlug: string;
        studentName: string;
        studentEmail: string;
        studentId: string;
        admissionDate: string;
        refNumber: string;
      };

      // Link admission form to enrollment using the submitted form ID
      const formIdToLink = submittedAdmissionFormId || admissionFormData?._id;
      if (formIdToLink) {
        linkAdmissionToEnrollment({
          admissionFormId: formIdToLink,
          enrollmentId: enrollmentResult.enrollmentId,
        });
      }

      // Send enrollment email only after admission form is submitted and enrollment is complete
      if (formData) {
        await sendEnrollmentEmailAfterAdmission(enrollmentResult);
      }

      toast.success("Enrolled in course successfully");
      clearForm();
      onPaymentSuccess?.();
      router.refresh();
    },
    onError: (error) => {
      displayToastError(error);
    },
  });

  const handlePayment = () => {
    if (!user) {
      toast.error("Please sign in to continue.");
      return;
    }

    if (!user.primaryEmailAddress?.emailAddress) {
      toast.error("A valid email address is required to process payment.");
      return;
    }

    if (!formData) {
      toast.error(
        "Admission form data is missing. Please go back and complete the form."
      );
      return;
    }

    const feeTerms =
      formData.courseSelection.feeTerms ?? "for full course";
    const effectivePriceShillings =
      feeTerms === "per module" &&
      moduleId &&
      modulePriceShillings !== undefined
        ? modulePriceShillings
        : priceShillings;

    // First, submit the admission form
    setIsSubmittingForm(true);
    submitAdmissionForm(
      {
        courseId,
        applicantPersonalDetails: formData.applicantPersonalDetails,
        nextOfKinDetails: formData.nextOfKinDetails,
        declaration: formData.declaration,
        courseSelection: formData.courseSelection,
      },
      {
        onSuccess: (result) => {
          setIsSubmittingForm(false);
          if (!result?.admissionFormId) {
            toast.error("Failed to save admission form");
            return;
          }

          // Store the submitted admission form ID for linking to enrollment
          setSubmittedAdmissionFormId(result.admissionFormId);

          // For free items, bypass Paystack
          if (effectivePriceShillings === 0) {
            if (moduleId) {
              grantFreeModuleAccess({ courseId, moduleId });
            } else {
              enroll({ courseId });
            }
            return;
          }

          // For paid courses, proceed with payment
          setIsPaymentPending(true);
          const userEmail = user.primaryEmailAddress?.emailAddress;
          if (!userEmail) {
            toast.error(
              "A valid email address is required to process payment."
            );
            setIsPaymentPending(false);
            return;
          }

          initializePayment({
            config: {
              email: userEmail,
              amount: effectivePriceShillings * CENTS_PER_SHILLING,
              currency: "KES",
              reference: `pay-${user.id}-${Date.now().toString()}-${accessScope}`,
              metadata: {
                userId: user.id,
                studentEmail: formData.applicantPersonalDetails.email,
                courseId,
                moduleId: moduleId ?? null,
                accessScope,
                admissionFormId: result.admissionFormId,
                custom_fields: [
                  {
                    display_name: "Course ID",
                    variable_name: "course_id",
                    value: String(courseId),
                  },
                  {
                    display_name: "Admission Form ID",
                    variable_name: "admission_form_id",
                    value: String(result.admissionFormId),
                  },
                ],
              },
            },
            onSuccess: () => {
              toast.success("Payment successful. Enrolling in course...");
              setIsPaymentPending(false);
              clearForm();
              onPaymentSuccess?.();
              router.refresh();
            },
            onClose: () => {
              setIsPaymentPending(false);
              toast.error("Payment cancelled");
            },
          });
          setTimeout(bringPaystackToFront, 0);
        },
        onError: () => {
          setIsSubmittingForm(false);
        },
      }
    );
  };

  const isProcessing =
    isPaymentPending ||
    isSubmittingForm ||
    isSubmittingAdmission ||
    isEnrolling;
  const feeTerms =
    formData?.courseSelection.feeTerms ?? "for full course";
  const effectivePriceShillings =
    feeTerms === "per module" &&
    moduleId &&
    modulePriceShillings !== undefined
      ? modulePriceShillings
      : priceShillings;
  const priceLabel =
    effectivePriceShillings > 0
      ? priceFormatter.format(effectivePriceShillings)
      : "Free";
  const isPerModule = feeTerms === "per module" && moduleId;
  const feeLabel = isPerModule ? "Module Fee:" : "Course Fee:";

  const modules =
    modulesData?.map((m) => ({
      id: m._id as Id<"module">,
      title: m.title,
      priceShillings: m.priceShillings ?? 0,
      isUnlocked: m.isUnlocked === true,
    })) ?? [];

  const [pendingModuleId, setPendingModuleId] = useState<Id<"module"> | null>(
    null
  );

  const handleModuleUnlock = (module: {
    id: Id<"module">;
    title: string;
    priceShillings: number;
    isUnlocked: boolean;
  }) => {
    if (!user) {
      toast.error("Please sign in to continue.");
      return;
    }

    if (!user.primaryEmailAddress?.emailAddress) {
      toast.error("A valid email address is required to process payment.");
      return;
    }

    if (!formData) {
      toast.error(
        "Admission form data is missing. Please go back and complete the form."
      );
      return;
    }

    if (module.isUnlocked) {
      toast.success("You already have access to this module.");
      return;
    }

    setPendingModuleId(module.id);

    if (module.priceShillings === 0) {
      grantFreeModuleAccess(
        { courseId, moduleId: module.id },
        {
          onSettled: () => {
            setPendingModuleId(null);
          },
        }
      );
      return;
    }

    setIsPaymentPending(true);
    const userEmail = user.primaryEmailAddress.emailAddress;

    initializePayment({
      config: {
        email: userEmail,
        amount: module.priceShillings * CENTS_PER_SHILLING,
        currency: "KES",
        reference: `pay-${user.id}-${Date.now().toString()}-module`,
        metadata: {
          userId: user.id,
          studentEmail: formData.applicantPersonalDetails.email,
          courseId,
          moduleId: module.id,
          accessScope: "module",
          admissionFormId: submittedAdmissionFormId ?? admissionFormData?._id,
          custom_fields: [
            {
              display_name: "Course ID",
              variable_name: "course_id",
              value: String(courseId),
            },
            {
              display_name: "Module ID",
              variable_name: "module_id",
              value: String(module.id),
            },
          ],
        },
      },
      onSuccess: () => {
        toast.success("Payment successful. Unlocking module...");
        setIsPaymentPending(false);
        setPendingModuleId(null);
        router.refresh();
      },
      onClose: () => {
        setIsPaymentPending(false);
        setPendingModuleId(null);
        toast.error("Payment cancelled");
      },
    });
    setTimeout(bringPaystackToFront, 0);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Review Section */}
      <Card>
        <CardHeader>
          <CardTitle>Review Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData && (
            <>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Personal Details</h4>
                <div className="space-y-1 text-muted-foreground text-sm">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {formData.applicantPersonalDetails.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {formData.applicantPersonalDetails.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {formData.applicantPersonalDetails.phone}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{" "}
                    {formData.applicantPersonalDetails.county},{" "}
                    {formData.applicantPersonalDetails.subCounty},{" "}
                    {formData.applicantPersonalDetails.ward}
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <h4 className="font-semibold text-sm">Course Selection</h4>
                <div className="space-y-1 text-muted-foreground text-sm">
                  <p>
                    <span className="font-medium">Course:</span>{" "}
                    {formData.courseSelection.courseName}
                  </p>
                  <p>
                    <span className="font-medium">Mode:</span>{" "}
                    {formData.courseSelection.courseMode}
                  </p>
                  <p>
                    <span className="font-medium">Fee Terms:</span>{" "}
                    {formData.courseSelection.feeTerms}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Section */}
      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">{feeLabel}</span>
            <span className="font-semibold text-lg">{priceLabel}</span>
          </div>

          {priceShillings === 0 ? (
            <Button
              className="w-full"
              disabled={isProcessing}
              onClick={handlePayment}
              type="button"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 size-4" />
              )}
              {isProcessing ? "Processing..." : "Complete Enrollment"}
            </Button>
          ) : (
            <Button
              className="w-full"
              disabled={isProcessing}
              onClick={handlePayment}
              type="button"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 size-4" />
              )}
              {isProcessing
                ? "Processing..."
                : `Pay ${priceLabel} with Paystack`}
            </Button>
          )}

          {modules.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-semibold text-sm">Modules</h4>
              <div className="space-y-2">
                {modules.map((module) => {
                  const modulePriceLabel =
                    module.priceShillings > 0
                      ? priceFormatter.format(module.priceShillings)
                      : "Free";
                  const isModuleProcessing =
                    pendingModuleId === module.id || isGrantingFreeAccess;

                  return (
                    <div
                      className="flex items-center justify-between gap-3 rounded-md border p-3"
                      key={module.id}
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{module.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {module.isUnlocked
                            ? "Unlocked"
                            : `Price: ${modulePriceLabel}`}
                        </p>
                      </div>
                      <Button
                        className="whitespace-nowrap"
                        disabled={module.isUnlocked || isModuleProcessing}
                        onClick={() => handleModuleUnlock(module)}
                        type="button"
                        variant={module.isUnlocked ? "outline" : "default"}
                      >
                        {isModuleProcessing ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <CreditCard className="mr-2 size-4" />
                        )}
                        {module.isUnlocked
                          ? "Unlocked"
                          : isModuleProcessing
                            ? "Processing..."
                            : "Unlock Module"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center gap-4 border-t pt-4">
        <Button
          disabled={isProcessing}
          onClick={handleBackStep}
          type="button"
          variant="outline"
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default PaymentStep;
