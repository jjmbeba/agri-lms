/** biome-ignore-all lint/style/noMagicNumbers: Steps are fixed */
"use client";

import { IconPlus } from "@tabler/icons-react";
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
import { trpc } from "@/trpc/client";
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

const CreateModuleBtn = ({
  showText = true,
  courseId,
}: CreateModuleBtnProps) => {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: createDraftModule, isPending: isCreatingDraftModule } =
    trpc.modules.createDraftModule.useMutation({
      onSuccess: () => {
        setIsOpen(false);
        toast.success("Draft module created successfully");
      },
      onError: (error) => {
        toast.error(error.message);
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
      courseId,
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setCurrentStep(1);
    }
  };

  return (
    <ModuleFormProvider>
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
    </ModuleFormProvider>
  );
};

export default CreateModuleBtn;
