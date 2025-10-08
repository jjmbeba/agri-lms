export type ContentType =
  | "text"
  | "video"
  | "file"
  | "quiz"
  | "assignment"
  | "project";

export type ContentItem = {
  type: ContentType;
  title: string;
  content: string;
  file?: File;
  metadata?: Record<string, unknown>;
  // Assignment-specific fields
  dueDate?: string;
  maxScore?: number;
  submissionType?: "file" | "text" | "url";
};

export type ContentFormData = {
  content: ContentItem[];
};

export type ContentFormProps = {
  handleNextStep: () => void;
  handleBackStep: () => void;
  disableBackStep?: boolean;
};

export type ContentFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  errors: string[];
};

export type FileUploadProps = {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile?: File;
  accept: string;
  maxSize: number;
  isUploading: boolean;
};

export type BasicInfoData = {
  title: string;
  description: string;
};

export type ModuleFormData = {
  basicInfo: BasicInfoData | null;
  content: ContentItem[];
};
