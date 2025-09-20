/** biome-ignore-all lint/style/noMagicNumbers: Steps are fixed */
"use client";

import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

type CreateModuleBtnProps = {
  showText?: boolean;
};

const CreateModuleBtn = ({ showText = true }: CreateModuleBtnProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setIsLoading(false);
    }, 1000);
  };

  const handleBackStep = () => {
    if (currentStep === 1) {
      return;
    }
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          {showText && "Add Content"}
        </Button>
      </DialogTrigger>
      <DialogContent>
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
          <BasicModuleInfoForm
            handleBackStep={handleBackStep}
            handleNextStep={handleNextStep}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateModuleBtn;
