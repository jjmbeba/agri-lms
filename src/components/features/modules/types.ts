export type ContentType =
  | "text"
  | "video"
  | "file"
  | "quiz"
  | "assignment"
  | "project";

export type ContentItem = {
  type: ContentType;
  content: string;
  file?: File;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: string;
    pageCount?: number;
  };
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
};
