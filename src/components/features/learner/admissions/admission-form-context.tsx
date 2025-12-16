"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import type { AdmissionFormData } from "./admission-form-schema";

type AdmissionFormContextType = {
  formData: AdmissionFormData | null;
  setFormData: (data: AdmissionFormData) => void;
  clearForm: () => void;
};

const AdmissionFormContext = createContext<
  AdmissionFormContextType | undefined
>(undefined);

export const useAdmissionFormContext = () => {
  const context = useContext(AdmissionFormContext);
  if (!context) {
    throw new Error(
      "useAdmissionFormContext must be used within an AdmissionFormProvider"
    );
  }
  return context;
};

type AdmissionFormProviderProps = {
  children: ReactNode;
};

export const AdmissionFormProvider = ({
  children,
}: AdmissionFormProviderProps) => {
  const [formData, setFormData] = useState<AdmissionFormData | null>(null);

  const clearForm = () => {
    setFormData(null);
  };

  return (
    <AdmissionFormContext.Provider
      value={{
        formData,
        setFormData,
        clearForm,
      }}
    >
      {children}
    </AdmissionFormContext.Provider>
  );
};

