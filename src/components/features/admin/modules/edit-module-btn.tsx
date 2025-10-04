/** biome-ignore-all lint/style/noMagicNumbers: Steps are fixed */
"use client";

import { useConvexMutation } from "@convex-dev/react-query";
import { IconEdit } from "@tabler/icons-react";
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
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import BasicModuleInfoForm from "./basic-info-form";
import { moduleSteps, moduleStepTitles } from "./constants";
import ContentForm from "./content-form";
import {
  ModuleFormProvider,
  useModuleFormContext,
} from "./module-form-context";
import ReviewForm from "./review-form";
import type { ModuleFormData } from "./types";

type EditModuleBtnProps = {
  moduleId: string;
  moduleData: Doc<"draftModule"> & {
    content: Doc<"draftModuleContent">[];
  };
  onSuccess?: () => void;
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

// Inner component that uses the context
const EditModuleContent = ({
  moduleId,
  moduleData,
  onSuccess,
}: {
  moduleId: string;
  moduleData: Doc<"draftModule"> & {
    content: Doc<"draftModuleContent">[];
  };
  onSuccess?: () => void;
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { initializeForm, clearForm } = useModuleFormContext();

  // Use passed data or fetched data
  const currentModuleData = moduleData;

  const { mutate: updateDraftModule, isPending: isUpdatingModule } =
    useMutation({
      mutationFn: useConvexMutation(api.modules.updateDraftModule),
      onSuccess: () => {
        clearForm();
        setIsOpen(false);
        toast.success("Module updated successfully");
        onSuccess?.();
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

    updateDraftModule({
      moduleId: moduleId as Id<"draftModule">,
      basicInfo: values.basicInfo,
      content: { content: values.content },
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setCurrentStep(1); 
    } else {
      setCurrentStep(1);
    }
  };

  const handleEditClick = () => {
    if (
      currentModuleData &&
      "_id" in currentModuleData &&
      "title" in currentModuleData
    ) {
      setCurrentStep(1); // Reset to first step
      initializeForm(currentModuleData);
      setIsOpen(true);
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
            <Button
              onClick={handleEditClick}
              size="icon"
              type="button"
              variant="outline"
            >
              <IconEdit className="size-4" />
            </Button>
          </DrawerTrigger>
          <UIDrawerContent>
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
                      loading={isUpdatingModule}
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
                  Edit Module:{" "}
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
                  isSubmitting={isUpdatingModule}
                  onSubmit={handleSubmit}
                />
              )}
            </div>
          </UIDrawerContent>
        </>
      ) : (
        <>
          <DialogTrigger asChild>
            <Button
              onClick={handleEditClick}
              size="sm"
              type="button"
              variant="outline"
            >
              <IconEdit className="mr-2 h-4 w-4" />
              Edit
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
                      loading={isUpdatingModule}
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
                  Edit Module:{" "}
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
                isSubmitting={isUpdatingModule}
                onSubmit={handleSubmit}
              />
            )}
          </UIDialogContent>
        </>
      )}
    </FormDialog>
  );
};

const EditModuleBtn = ({
  moduleId,
  moduleData,
  onSuccess,
}: EditModuleBtnProps) => {
  return (
    <ModuleFormProvider>
      <EditModuleContent
        moduleData={moduleData}
        moduleId={moduleId}
        onSuccess={onSuccess}
      />
    </ModuleFormProvider>
  );
};

export default EditModuleBtn;
