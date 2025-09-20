/** biome-ignore-all lint/style/noMagicNumbers: Steps are fixed */
"use client";

import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent as UIDialogContent,
} from "@/components/ui/dialog";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";
import BasicModuleInfoForm from "./basic-info-form";
import { moduleSteps, moduleStepTitles } from "./constants";
import ContentForm from "./content-form";
import {
  ModuleFormProvider,
  useModuleFormContext,
} from "./module-form-context";
import ReviewForm from "./review-form";

type CreateModuleBtnProps = {
  showText?: boolean;
};

// Component that clears form data when dialog closes
const FormDialog = ({
  isOpen,
  onOpenChange,
  children,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  const { clearForm } = useModuleFormContext();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      clearForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      {children}
    </Dialog>
  );
};

const CreateModuleBtn = ({ showText = true }: CreateModuleBtnProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBackStep = () => {
    if (currentStep === 1) {
      return;
    }
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    // Here you would typically submit the form data to your API
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsOpen(false);
      setCurrentStep(1);
      // Close dialog or show success message
    }, 2000);
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
      <FormDialog isOpen={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button>
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
                    loading={isLoading}
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
                {moduleStepTitles[currentStep as keyof typeof moduleStepTitles]}
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
              isSubmitting={isLoading}
              onSubmit={handleSubmit}
            />
          )}
        </UIDialogContent>
      </FormDialog>
    </ModuleFormProvider>
  );
};

export default CreateModuleBtn;
