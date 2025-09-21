import { createContext, type ReactNode, useContext, useState } from "react";
import type { BasicInfoData, ContentItem, ModuleFormData } from "./types";

type ModuleFormContextType = {
  formData: ModuleFormData;
  setBasicInfo: (data: BasicInfoData) => void;
  setContent: (data: ContentItem[]) => void;
  clearForm: () => void;
};

const ModuleFormContext = createContext<ModuleFormContextType | undefined>(
  undefined
);

export const useModuleFormContext = () => {
  const context = useContext(ModuleFormContext);
  if (!context) {
    throw new Error(
      "useModuleFormContext must be used within a ModuleFormProvider"
    );
  }
  return context;
};

type ModuleFormProviderProps = {
  children: ReactNode;
};

export const ModuleFormProvider = ({ children }: ModuleFormProviderProps) => {
  const [formData, setFormData] = useState<ModuleFormData>({
    basicInfo: null,
    content: [],
  });

  const setBasicInfo = (data: BasicInfoData) => {
    setFormData((prev) => ({
      ...prev,
      basicInfo: data,
    }));
  };

  const setContent = (data: ContentItem[]) => {
    setFormData((prev) => ({
      ...prev,
      content: data,
    }));
  };

  const clearForm = () => {
    setFormData({
      basicInfo: null,
      content: [],
    });
  };

  return (
    <ModuleFormContext.Provider
      value={{
        formData,
        setBasicInfo,
        setContent,
        clearForm,
      }}
    >
      {children}
    </ModuleFormContext.Provider>
  );
};
