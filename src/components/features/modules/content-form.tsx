/** biome-ignore-all lint/suspicious/noArrayIndexKey: Have to do this because of the dynamic array */

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Loader2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { moduleTypes } from "./constants";
import { useModuleFormContext } from "./module-form-context";
import { contentSchema } from "./schema";
import type {
  ContentFieldProps,
  ContentFormProps,
  ContentItem,
  ContentType,
  FileUploadProps,
} from "./types";

// Constants
const MAX_FILE_SIZE_MB = 100;
const BYTES_PER_KB = 1024;
const MB_TO_BYTES = BYTES_PER_KB * BYTES_PER_KB;
const DEFAULT_ROWS = 4;
const QUIZ_ROWS = 6;
const FILE_SIZE_LIMIT = MAX_FILE_SIZE_MB * MB_TO_BYTES;

// Handle type change with content clearing
const handleTypeChange = (
  newType: string,
  index: number,
  subField: unknown,
  form: unknown
) => {
  const typedSubField = subField as { handleChange: (value: string) => void };
  const typedForm = form as {
    getFieldValue: (path: string) => string;
    setFieldValue: (path: string, value: string) => void;
  };

  const currentContent = typedForm.getFieldValue(`content[${index}].content`);

  // If there's existing content, ask user if they want to clear it
  if (currentContent && currentContent.trim() !== "") {
    const shouldClear = confirm(
      "You have existing content. Changing the type will clear the current content. Do you want to continue?"
    );
    if (!shouldClear) {
      return; // Don't change the type
    }
  }

  typedSubField.handleChange(newType);

  // Clear content when type changes
  if (currentContent && currentContent.trim() !== "") {
    typedForm.setFieldValue(`content[${index}].content`, "");
  }
};

// Type-safe file content input with file upload
const FileContentInput: React.FC<ContentFieldProps> = ({
  value,
  onChange,
  errors,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("file");

  const handleFileSelect = (file: File) => {
    if (file.size > FILE_SIZE_LIMIT) {
      alert(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setSelectedFile(file);
    onChange(file.name);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    onChange("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={() => setUploadMethod("url")}
          size="sm"
          type="button"
          variant={uploadMethod === "url" ? "default" : "outline"}
        >
          URL
        </Button>
        <Button
          onClick={() => setUploadMethod("file")}
          size="sm"
          type="button"
          variant={uploadMethod === "file" ? "default" : "outline"}
        >
          Upload
        </Button>
      </div>

      {uploadMethod === "url" ? (
        <Input
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter file URL..."
          type="url"
          value={value}
        />
      ) : (
        <FileUploadInput
          accept="*/*"
          maxSize={MAX_FILE_SIZE_MB}
          onFileRemove={handleFileRemove}
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile || undefined}
        />
      )}

      {errors.map((error) => (
        <FormError key={error} message={error} />
      ))}
    </div>
  );
};

// Type-safe content input renderer
const renderContentInput = (
  type: ContentType,
  field: ContentFieldProps
): React.JSX.Element => {
  // biome-ignore lint/nursery/noUnnecessaryConditions: Does not make sense. Switch is not exhaustive.
  switch (type) {
    case "text":
      return (
        <div className="space-y-2">
          <Textarea
            onChange={(e) => field.onChange(e.target.value)}
            placeholder="Enter text content..."
            rows={DEFAULT_ROWS}
            value={field.value}
          />
          {field.errors.map((error) => (
            <FormError key={error} message={error} />
          ))}
        </div>
      );

    case "video":
      return (
        <VideoContentInput
          errors={field.errors}
          onBlur={field.onBlur}
          onChange={field.onChange}
          value={field.value}
        />
      );

    case "file":
      return (
        <FileContentInput
          errors={field.errors}
          onBlur={field.onBlur}
          onChange={field.onChange}
          value={field.value}
        />
      );

    case "quiz":
      return (
        <div className="space-y-2">
          <Textarea
            onChange={(e) => field.onChange(e.target.value)}
            placeholder="Enter quiz questions and options..."
            rows={QUIZ_ROWS}
            value={field.value}
          />
          <p className="text-muted-foreground text-xs">
            Format: Question 1? A) Option 1 B) Option 2 C) Option 3
          </p>
          {field.errors.map((error) => (
            <FormError key={error} message={error} />
          ))}
        </div>
      );

    case "assignment":
      return (
        <div className="space-y-2">
          <Textarea
            onChange={(e) => field.onChange(e.target.value)}
            placeholder="Enter assignment instructions..."
            rows={QUIZ_ROWS}
            value={field.value}
          />
          <p className="text-muted-foreground text-xs">
            Include submission requirements and due dates
          </p>
          {field.errors.map((error) => (
            <FormError key={error} message={error} />
          ))}
        </div>
      );

    case "project":
      return (
        <div className="space-y-2">
          <Textarea
            onChange={(e) => field.onChange(e.target.value)}
            placeholder="Enter project description and requirements..."
            rows={QUIZ_ROWS}
            value={field.value}
          />
          <p className="text-muted-foreground text-xs">
            Describe the project scope, deliverables, and evaluation criteria
          </p>
          {field.errors.map((error) => (
            <FormError key={error} message={error} />
          ))}
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <Textarea
            onChange={(e) => field.onChange(e.target.value)}
            placeholder="Enter content..."
            rows={DEFAULT_ROWS}
            value={field.value}
          />
          {field.errors.map((error) => (
            <FormError key={error} message={error} />
          ))}
        </div>
      );
  }
};

// Type-safe video content input with file upload
const VideoContentInput: React.FC<ContentFieldProps> = ({
  value,
  onChange,
  errors,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url");

  const handleFileSelect = (file: File) => {
    if (file.size > FILE_SIZE_LIMIT) {
      alert(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    if (!file.type.startsWith("video/")) {
      alert("Please select a video file");
      return;
    }

    setSelectedFile(file);
    onChange(file.name);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    onChange("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={() => setUploadMethod("url")}
          size="sm"
          type="button"
          variant={uploadMethod === "url" ? "default" : "outline"}
        >
          URL
        </Button>
        <Button
          onClick={() => setUploadMethod("file")}
          size="sm"
          type="button"
          variant={uploadMethod === "file" ? "default" : "outline"}
        >
          Upload
        </Button>
      </div>

      {uploadMethod === "url" ? (
        <Input
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter video URL (YouTube, Vimeo, etc.)..."
          type="url"
          value={value}
        />
      ) : (
        <FileUploadInput
          accept="video/*"
          maxSize={MAX_FILE_SIZE_MB}
          onFileRemove={handleFileRemove}
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile || undefined}
        />
      )}

      {errors.map((error) => (
        <FormError key={error} message={error} />
      ))}
    </div>
  );
};

// Type-safe file upload component
const FileUploadInput: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  selectedFile,
  accept,
  maxSize,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      {selectedFile ? (
        <div className="flex items-center gap-2 rounded-lg border p-3">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="font-medium text-sm">{selectedFile.name}</p>
            <p className="text-muted-foreground text-xs">
              {(selectedFile.size / MB_TO_BYTES).toFixed(2)} MB
            </p>
          </div>
          <Button
            onClick={onFileRemove}
            size="sm"
            type="button"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            accept={accept}
            className="flex-1"
            onChange={handleFileChange}
            type="file"
          />
          <p className="text-muted-foreground text-xs">Max {maxSize}MB</p>
        </div>
      )}
    </div>
  );
};

const ContentForm: React.FC<ContentFormProps> = ({
  handleNextStep,
  handleBackStep,
  disableBackStep = false,
}) => {
  const { setContent, formData } = useModuleFormContext();

  const form = useForm({
    defaultValues: {
      content:
        formData.content.length > 0
          ? formData.content
          : [{ type: "text" as ContentType, content: "" }],
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: contentSchema,
    },
    onSubmit: ({ value }) => {
      setContent(value.content);
      handleNextStep();
    },
  });

  // Sync form with context data when it changes
  useEffect(() => {
    if (formData.content.length > 0) {
      form.setFieldValue("content", formData.content);
    }
  }, [formData.content, form]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="flex flex-col gap-6">
        <form.Field mode="array" name="content">
          {(field) => {
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Content Items</h3>
                    <p className="text-muted-foreground text-sm">
                      {field.state.value.length} item
                      {field.state.value.length !== 1 ? "s" : ""} added
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      field.pushValue({
                        type: "text" as ContentType,
                        content: "",
                      })
                    }
                    type="button"
                    variant="outline"
                  >
                    Add Content
                  </Button>
                </div>
                <ScrollArea className="h-[400px] space-y-4 pb-2">
                  {field.state.value.map((item: ContentItem, i: number) => {
                    return (
                      <div
                        className="mt-4 flex flex-col gap-4 rounded-lg border p-4 :first:mt-0"
                        key={i}
                      >
                        <div className="flex items-center justify-between">
                          <form.Field name={`content[${i}].type`}>
                            {(typeField) => (
                              <span className="font-medium text-muted-foreground text-sm">
                                Item {i + 1} -{" "}
                                {moduleTypes.find(
                                  (t) => t.id === typeField.state.value
                                )?.name || "Unknown"}
                              </span>
                            )}
                          </form.Field>
                          <Button
                            onClick={() => field.removeValue(i)}
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            Remove
                          </Button>
                        </div>
                        <form.Field name={`content[${i}].type`}>
                          {(subField) => (
                            <div className="flex flex-col gap-2">
                              <Label>Content Type</Label>
                              <Select
                                defaultValue={subField.state.value}
                                onValueChange={(e) =>
                                  handleTypeChange(e, i, subField, form)
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {moduleTypes.map((moduleType) => (
                                    <SelectItem
                                      key={moduleType.id}
                                      value={moduleType.id}
                                    >
                                      {moduleType.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {subField.state.meta.errors.map(
                                (error, index) => (
                                  <FormError
                                    key={index}
                                    message={error?.message ?? ""}
                                  />
                                )
                              )}
                            </div>
                          )}
                        </form.Field>
                        <form.Field
                          key={`content-${i}-${item.type}`}
                          name={`content[${i}].content`}
                        >
                          {(subField) => (
                            <div className="flex flex-col gap-2">
                              <form.Field name={`content[${i}].type`}>
                                {(typeField) => (
                                  <Label>
                                    {moduleTypes.find(
                                      (t) => t.id === typeField.state.value
                                    )?.name || "Content"}{" "}
                                    Content
                                  </Label>
                                )}
                              </form.Field>
                              <form.Field name={`content[${i}].type`}>
                                {(typeField) =>
                                  renderContentInput(typeField.state.value, {
                                    value: subField.state.value,
                                    onChange: subField.handleChange,
                                    onBlur: subField.handleBlur,
                                    errors: subField.state.meta.errors.map(
                                      (e) => e?.message ?? ""
                                    ),
                                  })
                                }
                              </form.Field>
                            </div>
                          )}
                        </form.Field>
                      </div>
                    );
                  })}
                </ScrollArea>
              </div>
            );
          }}
        </form.Field>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <div className="flex items-center gap-4">
              <Button
                disabled={disableBackStep}
                onClick={handleBackStep}
                type="submit"
                variant="outline"
              >
                Back
              </Button>
              <Button disabled={!canSubmit || isSubmitting} type="submit">
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Proceed to Review"
                )}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export default ContentForm;
