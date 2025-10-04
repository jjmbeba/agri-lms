/** biome-ignore-all lint/style/noMagicNumbers: Steps are fixed */
"use client";

import { useConvexMutation } from "@convex-dev/react-query";
import { IconPlus } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent as UIDialogContent,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerContent as UIDrawerContent,
} from "@/components/ui/drawer";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";
import { useIsMobile } from "@/hooks/use-mobile";
import { displayToastError } from "@/lib/utils";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import BasicModuleInfoForm from "./basic-info-form";
import { moduleSteps, moduleStepTitles } from "./constants";
import ContentForm from "./content-form";
import {
  ModuleFormProvider,
  useModuleFormContext,
} from "./module-form-context";
import ReviewForm from "./review-form";
import type { ModuleFormData } from "./types";

type CreateModuleBtnProps = {
  showText?: boolean;
  courseId: string;
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
  const { clearForm } = useModuleFormContext();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      clearForm();
    }
    onOpenChange(open);
  };

  if (isMobile) {
    return (
      <Drawer onOpenChange={handleOpenChange} open={isOpen}>
        {children}
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      {children}
    </Dialog>
  );
};

// Component that handles the form logic inside the provider
const CreateModuleForm = ({
  showText = true,
  courseId,
}: CreateModuleBtnProps) => {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const { clearForm } = useModuleFormContext();
  
  const { mutate: createDraftModule, isPending: isCreatingDraftModule } =
    useMutation({
      mutationFn: useConvexMutation(api.modules.createDraftModule),
      onSuccess: () => {
        setIsOpen(false);
        setCurrentStep(1);
        clearForm();
        toast.success("Draft module created successfully");
      },
      onError: (error) => {
        displayToastError(error);
      },
    });

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBackStep = () => {
    if (currentStep === 1) {
      return;
    }
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = (values: ModuleFormData) => {
    if (!values.basicInfo || values.content.length === 0) {
      toast.error("Please fill in all fields");
      return;
    }

    createDraftModule({
      basicInfo: values.basicInfo,
      content: { content: values.content },
      courseId: courseId as Id<"course">,
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset to first step when dialog opens
      setCurrentStep(1);
    }
  };

  return (
    <FormDialog
      isMobile={isMobile}
      isOpen={isOpen}
      onOpenChange={handleDialogOpenChange}
    >
        {isMobile ? (
          <>
            <DrawerTrigger asChild>
              <Button type="button" variant="secondary">
                <IconPlus className="mr-2 h-4 w-4" />
                {showText && "Add Content"}
              </Button>
            </DrawerTrigger>
            <UIDrawerContent className="h-[92%] max-h-[92vh]">
              <DrawerHeader>
                <DrawerTitle>
                  <Stepper
                    className="mt-5"
                    onValueChange={setCurrentStep}
                    value={currentStep}
                  >
                    {moduleSteps.map((step) => (
                      <StepperItem
                        className="not-last:flex-1"
                        key={step.id}
                        loading={isCreatingDraftModule}
                        step={step.id}
                      >
                        <StepperTrigger asChild>
                          <StepperIndicator />
                        </StepperTrigger>
                        {step.id < moduleSteps.length && <StepperSeparator />}
                      </StepperItem>
                    ))}
                  </Stepper>
                  <div className="mt-4">
                    Create Module:{" "}
                    {
                      moduleStepTitles[
                        currentStep as keyof typeof moduleStepTitles
                      ]
                    }
                  </div>
                </DrawerTitle>
              </DrawerHeader>
              <div className="p-6">
                {currentStep === 1 && (
                  <BasicModuleInfoForm
                    disableBackStep
                    handleBackStep={handleBackStep}
                    handleNextStep={handleNextStep}
                  />
                )}
                {currentStep === 2 && (
                  <ContentForm
                    handleBackStep={handleBackStep}
                    handleNextStep={handleNextStep}
                  />
                )}
                {currentStep === 3 && (
                  <ReviewForm
                    handleBackStep={handleBackStep}
                    isSubmitting={isCreatingDraftModule}
                    onSubmit={handleSubmit}
                  />
                )}
              </div>
            </UIDrawerContent>
          </>
        ) : (
          <>
            <DialogTrigger asChild>
              <Button type="button" variant="secondary">
                <IconPlus className="mr-2 h-4 w-4" />
                {showText && "Add Content"}
              </Button>
            </DialogTrigger>
            <UIDialogContent>
              <DialogHeader>
                <DialogTitle>
                  <Stepper
                    className="mt-5"
                    onValueChange={setCurrentStep}
                    value={currentStep}
                  >
                    {moduleSteps.map((step) => (
                      <StepperItem
                        className="not-last:flex-1"
                        key={step.id}
                        loading={isCreatingDraftModule}
                        step={step.id}
                      >
                        <StepperTrigger asChild>
                          <StepperIndicator />
                        </StepperTrigger>
                        {step.id < moduleSteps.length && <StepperSeparator />}
                      </StepperItem>
                    ))}
                  </Stepper>
                  <div className="mt-4">
                    Create Module:{" "}
                    {
                      moduleStepTitles[
                        currentStep as keyof typeof moduleStepTitles
                      ]
                    }
                  </div>
                </DialogTitle>
              </DialogHeader>

              {currentStep === 1 && (
                <BasicModuleInfoForm
                  disableBackStep
                  handleBackStep={handleBackStep}
                  handleNextStep={handleNextStep}
                />
              )}
              {currentStep === 2 && (
                <ContentForm
                  handleBackStep={handleBackStep}
                  handleNextStep={handleNextStep}
                />
              )}
              {currentStep === 3 && (
                <ReviewForm
                  handleBackStep={handleBackStep}
                  isSubmitting={isCreatingDraftModule}
                  onSubmit={handleSubmit}
                />
              )}
            </UIDialogContent>
          </>
        )}
      </FormDialog>
  );
};

const CreateModuleBtn = (props: CreateModuleBtnProps) => {
  return (
    <ModuleFormProvider>
      <CreateModuleForm {...props} />
    </ModuleFormProvider>
  );
};

export default CreateModuleBtn;
