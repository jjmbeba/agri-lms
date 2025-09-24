import { createContext, type ReactNode, useContext, useState } from "react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import type {
  BasicInfoData,
  ContentItem,
  ContentType,
  ModuleFormData,
} from "./types";

type ModuleWithContent = Doc<"draftModule"> & {
  content: Doc<"draftModuleContent">[];
};

type ModuleFormContextType = {
  formData: ModuleFormData;
  isEditMode: boolean;
  editModuleId: string | null;
  setBasicInfo: (data: BasicInfoData) => void;
  setContent: (data: ContentItem[]) => void;
  clearForm: () => void;
  initializeForm: (
    moduleData: Doc<"draftModule"> & {
      content: Doc<"draftModuleContent">[];
    }
  ) => void;
  setEditMode: (moduleId: string | null) => void;
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editModuleId, setEditModuleId] = useState<string | null>(null);

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
    setIsEditMode(false);
    setEditModuleId(null);
  };

  const initializeForm = (moduleData: ModuleWithContent) => {
    // Convert database content items to ContentItem format
    const contentItems: ContentItem[] = moduleData.content.map((item) => ({
      type: item.type as ContentType,
      content: item.content,
      title: item.title,
    }));

    setFormData({
      basicInfo: {
        title: moduleData.title,
        description: moduleData.description,
      },
      content: contentItems,
    });
    setIsEditMode(true);
    setEditModuleId(moduleData._id);
  };

  const setEditMode = (moduleId: string | null) => {
    setIsEditMode(!!moduleId);
    setEditModuleId(moduleId);
  };

  return (
    <ModuleFormContext.Provider
      value={{
        formData,
        isEditMode,
        editModuleId,
        setBasicInfo,
        setContent,
        clearForm,
        initializeForm,
        setEditMode,
      }}
    >
      {children}
    </ModuleFormContext.Provider>
  );
};
