/** biome-ignore-all lint/style/noMagicNumbers: Steps are fixed */
"use client";

import { IconEdit } from "@tabler/icons-react";
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
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";
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

type ModuleWithContent = {
  id: string;
  title: string;
  description: string;
  position: number;
  content: Array<{
    id: string;
    draftModuleId?: string;
    moduleId?: string;
    type: string;
    title: string;
    content: string;
    metadata: unknown;
    orderIndex: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

type EditModuleBtnProps = {
  moduleId: string;
  moduleData?: ModuleWithContent;
  onSuccess?: () => void;
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

// Inner component that uses the context
const EditModuleContent = ({
  moduleId,
  moduleData,
  onSuccess,
}: {
  moduleId: string;
  moduleData?: ModuleWithContent;
  onSuccess?: () => void;
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const { initializeForm, clearForm } = useModuleFormContext();

  // Fallback to fetch module data if not provided
  const { data: fetchedModuleData, isLoading: isLoadingModule } =
    trpc.modules.getDraftModuleById.useQuery(moduleId, {
      enabled: isOpen && !moduleData,
    });

  // Use passed data or fetched data
  const currentModuleData = moduleData || fetchedModuleData;

  const { mutate: updateDraftModule, isPending: isUpdatingModule } =
    trpc.modules.updateDraftModule.useMutation({
      onSuccess: () => {
        clearForm();
        setIsOpen(false);
        toast.success("Module updated successfully");
        onSuccess?.();
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

    updateDraftModule({
      moduleId,
      basicInfo: values.basicInfo,
      content: { content: values.content },
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setCurrentStep(1);
    }
  };

  const handleEditClick = () => {
    if (
      currentModuleData &&
      "id" in currentModuleData &&
      "title" in currentModuleData
    ) {
      initializeForm(currentModuleData as ModuleWithContent);
      setIsOpen(true);
    }
  };

  if (isLoadingModule && !moduleData) {
    return (
      <Button disabled size="sm" variant="outline">
        <IconEdit className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }

  return (
    <FormDialog isOpen={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={handleEditClick} size="sm" variant="outline">
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
            isSubmitting={isUpdatingModule}
            onSubmit={handleSubmit}
          />
        )}
      </UIDialogContent>
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
