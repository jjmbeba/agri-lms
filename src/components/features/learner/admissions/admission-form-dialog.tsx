"use client";

import { useUser } from "@clerk/nextjs";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  AdmissionFormProvider,
  useAdmissionFormContext,
} from "./admission-form-context";
import AdmissionFormStep from "./admission-form-step";
import PaymentStep from "./payment-step";

type AdmissionFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: Id<"course">;
  priceShillings: number;
  moduleId?: Id<"module">;
  moduleName?: string;
  modulePriceShillings?: number;
};

const admissionSteps = [
  { id: 1, label: "Admission Form" },
  { id: 2, label: "Payment" },
] as const;

const admissionStepTitles: Record<number, string> = {
  1: "Admission Form",
  2: "Payment",
};

// Component that clears form data when dialog closes
const FormDialog = ({
  isOpen,
  onOpenChange,
  children,
  isMobile,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  isMobile: boolean;
}) => {
  const { clearForm } = useAdmissionFormContext();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      clearForm();
    }
    onOpenChange(open);
  };

  if (isMobile) {
    return (
      <Drawer modal={false} onOpenChange={handleOpenChange} open={isOpen}>
        {children}
      </Drawer>
    );
  }

  return (
    <Dialog modal={false} onOpenChange={handleOpenChange} open={isOpen}>
      {children}
    </Dialog>
  );
};

// Inner component that uses the context
const AdmissionFormDialogContent = ({
  isOpen,
  onOpenChange,
  courseId,
  priceShillings,
  moduleId,
  moduleName,
  modulePriceShillings,
}: AdmissionFormDialogProps) => {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useUser();

  const { data: courseData } = useQuery(
    convexQuery(api.courses.getCourse, { id: courseId })
  );

  const course = courseData?.course;
  const department = courseData?.department;
  const courseName = course?.title ?? "";
  const departmentName = department?.name ?? "";
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBackStep = () => {
    if (currentStep === 1) {
      return;
    }
    setCurrentStep((prev) => prev - 1);
  };

  const handleDialogOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (open) {
      setCurrentStep(1);
    } else {
      setCurrentStep(1);
    }
  };

  const handlePaymentSuccess = () => {
    onOpenChange(false);
  };

  return (
    <FormDialog
      isMobile={isMobile}
      isOpen={isOpen}
      onOpenChange={handleDialogOpenChange}
    >
      {isMobile ? (
        <DrawerContent className="h-[92%] max-h-[92vh]">
          <DrawerHeader>
            <DrawerTitle>
              <Stepper
                className="mt-5"
                onValueChange={setCurrentStep}
                value={currentStep}
              >
                {admissionSteps.map((step) => (
                  <StepperItem
                    className="not-last:flex-1"
                    key={step.id}
                    step={step.id}
                  >
                    <StepperTrigger asChild>
                      <StepperIndicator />
                    </StepperTrigger>
                    {step.id < admissionSteps.length && <StepperSeparator />}
                  </StepperItem>
                ))}
              </Stepper>
              <div className="mt-4">
                Course Enrollment:{" "}
                {
                  admissionStepTitles[
                    currentStep as keyof typeof admissionStepTitles
                  ]
                }
              </div>
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            {currentStep === 1 && (
              <AdmissionFormStep
                courseName={courseName}
                departmentName={departmentName}
                disableBackStep
                handleBackStep={handleBackStep}
                handleNextStep={handleNextStep}
                userEmail={userEmail}
              />
            )}
            {currentStep === 2 && (
              <PaymentStep
                courseId={courseId}
                handleBackStep={handleBackStep}
                onPaymentSuccess={handlePaymentSuccess}
                priceShillings={priceShillings}
                moduleId={moduleId}
                moduleName={moduleName}
                modulePriceShillings={modulePriceShillings}
              />
            )}
          </div>
        </DrawerContent>
      ) : (
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <Stepper
                className="mt-5"
                onValueChange={setCurrentStep}
                value={currentStep}
              >
                {admissionSteps.map((step) => (
                  <StepperItem
                    className="not-last:flex-1"
                    key={step.id}
                    step={step.id}
                  >
                    <StepperTrigger asChild>
                      <StepperIndicator />
                    </StepperTrigger>
                    {step.id < admissionSteps.length && <StepperSeparator />}
                  </StepperItem>
                ))}
              </Stepper>
              <div className="mt-4">
                Course Enrollment:{" "}
                {
                  admissionStepTitles[
                    currentStep as keyof typeof admissionStepTitles
                  ]
                }
              </div>
            </DialogTitle>
          </DialogHeader>

          {currentStep === 1 && (
            <AdmissionFormStep
              courseName={courseName}
              departmentName={departmentName}
              disableBackStep
              handleBackStep={handleBackStep}
              handleNextStep={handleNextStep}
              userEmail={userEmail}
            />
          )}
          {currentStep === 2 && (
            <PaymentStep
              courseId={courseId}
              handleBackStep={handleBackStep}
              onPaymentSuccess={handlePaymentSuccess}
              priceShillings={priceShillings}
              moduleId={moduleId}
              moduleName={moduleName}
              modulePriceShillings={modulePriceShillings}
            />
          )}
        </DialogContent>
      )}
    </FormDialog>
  );
};

const AdmissionFormDialog = (props: AdmissionFormDialogProps) => {
  return (
    <AdmissionFormProvider>
      <AdmissionFormDialogContent {...props} />
    </AdmissionFormProvider>
  );
};

export default AdmissionFormDialog;
