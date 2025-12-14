"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type Tag, TagInput } from "emblor";
import { File, Loader2, Upload, X } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import { toast } from "sonner";
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
import { useUploadThing } from "@/lib/uploadthing";
import { displayToastError } from "@/lib/utils";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { createCourseSchema } from "./schema";

type CreateCourseFormProps = {
  type: "create";
};

type EditCourseFormProps = {
  type: "edit";
  courseDetails: Doc<"course">;
  id: string;
};

type CourseFormProps = CreateCourseFormProps | EditCourseFormProps;
type CourseStatus = "draft" | "coming-soon" | "published";

const BYTES_PER_KB = 1024;
const MB_TO_BYTES = BYTES_PER_KB * BYTES_PER_KB;

const CourseForm = (props: CourseFormProps) => {
  const { type, ...rest } = props;

  const action = type === "create" ? "Create" : "Update";

  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const [selectedHandoutFile, setSelectedHandoutFile] = useState<File | null>(
    null
  );
  const { data: departments, isLoading: isLoadingDepartments } = useQuery(
    convexQuery(api.departments.getDepartments, {})
  );
  const isPublished =
    type === "edit" &&
    "courseDetails" in rest &&
    rest.courseDetails.status === "published";

  const { mutate: createCourse, isPending: isCreatingCourse } = useMutation({
    mutationFn: useConvexMutation(api.courses.createCourse),
    onSuccess: () => {
      toast.success("Course created successfully");
      form.reset();
    },
    onError: (error) => {
      displayToastError(error);
    },
  });
  const { mutate: editCourse, isPending: isEditingCourse } = useMutation({
    mutationFn: useConvexMutation(api.courses.editCourse),
    onSuccess: () => {
      toast.success("Course updated successfully");
    },
    onError: (error) => {
      displayToastError(error);
    },
  });

  const { startUpload, isUploading: isUploadingHandout } = useUploadThing(
    "fileUploader",
    {
      onClientUploadComplete: (res) => {
        if (res[0]?.ufsUrl) {
          form.setFieldValue("handout", res[0].ufsUrl);
          setSelectedHandoutFile(null);
          toast.success("Handout uploaded successfully");
        }
      },
      onUploadError: (error) => {
        toast.error(`Upload failed: ${error.message}`);
      },
    }
  );

  const form = useForm({
    defaultValues:
      type === "edit" && "courseDetails" in rest
        ? {
            title: rest.courseDetails.title,
            description: rest.courseDetails.description,
            tags: rest.courseDetails.tags.map((tag) => ({
              id: tag,
              text: tag,
            })),
            departmentId: rest.courseDetails.departmentId,
            priceShillings: rest.courseDetails.priceShillings,
            handout: rest.courseDetails.handout ?? "",
            status:
              (rest.courseDetails.status as CourseStatus | undefined) ??
              "draft",
          }
        : {
            title: "",
            description: "",
            tags: [] as Tag[],
            departmentId: "",
            priceShillings: 0,
            handout: "",
            status: "draft",
          },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createCourseSchema,
    },
    onSubmit: ({ value }) => {
      if (type === "create") {
        createCourse({
          title: value.title,
          description: value.description,
          tags: value.tags.map((tag) => tag.text),
          departmentId: value.departmentId as Id<"department">,
          priceShillings: value.priceShillings,
          handout: value.handout ?? "",
          status: value.status as "draft" | "coming-soon",
        });
      } else if (type === "edit" && "id" in rest) {
        editCourse({
          id: rest.id as Id<"course">,
          title: value.title,
          description: value.description,
          tags: value.tags.map((tag) => tag.text),
          departmentId: value.departmentId as Id<"department">,
          priceShillings: value.priceShillings,
          handout: value.handout ?? "",
          status: value.status as "draft" | "coming-soon" | "published",
        });
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="flex flex-col gap-6">
        <ScrollArea className="h-[290px] space-y-4 pb-4 md:h-[400px]">
          <div className="flex flex-col gap-4">
            <form.Field name="title">
              {(field) => (
                <div className="grid gap-3">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    aria-invalid={field.state.meta.errors.length > 0}
                    id="title"
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Title"
                    value={field.state.value}
                  />
                  {field.state.meta.errors.map((error) => (
                    <FormError
                      key={error?.message}
                      message={error?.message ?? ""}
                    />
                  ))}
                </div>
              )}
            </form.Field>
            <form.Field name="description">
              {(field) => (
                <div className="grid gap-3">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    aria-invalid={field.state.meta.errors.length > 0}
                    id="description"
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Description"
                    value={field.state.value}
                  />
                  {field.state.meta.errors.map((error) => (
                    <FormError
                      key={error?.message}
                      message={error?.message ?? ""}
                    />
                  ))}
                </div>
              )}
            </form.Field>
            <form.Field name="priceShillings">
              {(field) => (
                <div className="grid gap-3">
                  <Label htmlFor="priceShillings">Price (KES)</Label>
                  <Input
                    aria-invalid={field.state.meta.errors.length > 0}
                    id="priceShillings"
                    min="0"
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? 0
                          : Number.parseFloat(e.target.value);
                      field.handleChange(value);
                    }}
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    value={field.state.value}
                  />
                  {field.state.meta.errors.map((error) => (
                    <FormError
                      key={error?.message}
                      message={error?.message ?? ""}
                    />
                  ))}
                </div>
              )}
            </form.Field>
            <form.Field name="status">
              {(field) => (
                <div className="grid gap-3">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    defaultValue={field.state.value}
                    disabled={isPublished}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger
                      aria-invalid={field.state.meta.errors.length > 0}
                      className="w-full"
                      disabled={isPublished}
                    >
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {isPublished ? (
                        <SelectItem value="published">Published</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="coming-soon">
                            Coming soon
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.map((error) => (
                    <FormError
                      key={error?.message}
                      message={error?.message ?? ""}
                    />
                  ))}
                </div>
              )}
            </form.Field>
            <div className="flex w-full flex-col items-start gap-3 md:flex-row">
              <form.Field name="departmentId">
                {(field) => (
                  <div className="grid w-full gap-3 md:w-1/2">
                    <Label htmlFor="departmentId">Department</Label>
                    <Select
                      defaultValue={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger
                        aria-invalid={field.state.meta.errors.length > 0}
                        className="w-full"
                        disabled={
                          isLoadingDepartments || departments?.length === 0
                        }
                      >
                        {isLoadingDepartments ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="size-4 animate-spin" />
                            <span>Loading departments...</span>
                          </div>
                        ) : (
                          <SelectValue
                            placeholder={
                              departments?.length === 0
                                ? "No departments found"
                                : "Select a department"
                            }
                          />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {departments && departments.length === 0 && (
                          <SelectItem disabled value="no-departments">
                            No departments found
                          </SelectItem>
                        )}
                        {departments &&
                          departments.length > 0 &&
                          departments.map((department) => (
                            <SelectItem
                              key={department._id}
                              value={department._id.toString()}
                            >
                              {department.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.map((error) => (
                      <FormError
                        key={error?.message}
                        message={error?.message ?? ""}
                      />
                    ))}
                  </div>
                )}
              </form.Field>

              <form.Field name="tags">
                {(field) => (
                  <div className="grid w-full gap-3 md:w-1/2">
                    <Label htmlFor="tags">Tags</Label>
                    <TagInput
                      activeTagIndex={activeTagIndex}
                      id="tags"
                      inlineTags={false}
                      inputFieldPosition="top"
                      placeholder="Add a tag"
                      setActiveTagIndex={setActiveTagIndex}
                      setTags={(newTags) => {
                        field.handleChange(newTags);
                      }}
                      styleClasses={{
                        tagList: {
                          container: "gap-1",
                        },
                        input:
                          "rounded-md transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        tag: {
                          body: "relative h-7 bg-background border border-input hover:bg-background rounded-md font-medium text-xs ps-2 pe-7",
                          closeButton:
                            "absolute -inset-y-px -end-px p-0 rounded-s-none rounded-e-md flex size-7 transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-muted-foreground/80 hover:text-foreground",
                        },
                      }}
                      tags={field.state.value}
                    />
                    {field.state.meta.errors.map((error) => (
                      <FormError
                        key={error?.message}
                        message={error?.message ?? ""}
                      />
                    ))}
                  </div>
                )}
              </form.Field>
            </div>
            <form.Field name="handout">
              {(field) => {
                const handoutUrl = field.state.value;
                const hasExistingHandout =
                  handoutUrl && handoutUrl.trim() !== "";
                const isShowingUpload = selectedHandoutFile !== null;

                const handleFileSelect = (file: File) => {
                  setSelectedHandoutFile(file);
                  toast.promise(startUpload([file]), {
                    loading: "Uploading handout...",
                    success: "Handout uploaded successfully",
                    error: "Upload failed",
                  });
                };

                const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileSelect(file);
                  }
                };

                const handleRemoveFile = () => {
                  setSelectedHandoutFile(null);
                  field.handleChange("");
                };

                const handleReplaceFile = () => {
                  setSelectedHandoutFile(null);
                  field.handleChange("");
                };

                const getFileNameFromUrl = (url: string): string => {
                  try {
                    const urlObj = new URL(url);
                    const pathname = urlObj.pathname;
                    const fileName =
                      pathname.split("/").pop() ?? "Course Handout";
                    return decodeURIComponent(fileName);
                  } catch {
                    return "Course Handout";
                  }
                };

                const renderHandoutField = () => {
                  if (hasExistingHandout && !isShowingUpload) {
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 rounded-lg border p-3">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="max-w-[4rem] overflow-hidden text-ellipsis whitespace-nowrap font-medium text-sm">
                              {getFileNameFromUrl(handoutUrl)}
                            </p>
                            <a
                              className="text-primary text-xs underline hover:no-underline"
                              href={handoutUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              View/Download
                            </a>
                          </div>
                          <Button
                            onClick={handleReplaceFile}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            Replace
                          </Button>
                          <Button
                            onClick={handleRemoveFile}
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          {isUploadingHandout && (
                            <Loader2 className="size-4 animate-spin" />
                          )}
                          <Input
                            accept=".pdf,.docx,.xlsx,.pptx,.doc"
                            className="flex-1"
                            disabled={isUploadingHandout}
                            onChange={handleFileChange}
                            type="file"
                          />
                          <p className="text-muted-foreground text-xs">
                            Max 4MB
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (isShowingUpload) {
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 rounded-lg border p-3">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {selectedHandoutFile.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {(selectedHandoutFile.size / MB_TO_BYTES).toFixed(
                                2
                              )}{" "}
                              MB
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedHandoutFile(null);
                              field.handleChange("");
                            }}
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {isUploadingHandout && (
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Loader2 className="size-4 animate-spin" />
                            <span>Uploading...</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2">
                      {isUploadingHandout && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      <Input
                        accept=".pdf,.docx,.xlsx,.pptx,.doc"
                        className="flex-1"
                        disabled={isUploadingHandout}
                        id="handout"
                        onChange={handleFileChange}
                        type="file"
                      />
                      <p className="text-muted-foreground text-xs">Max 4MB</p>
                    </div>
                  );
                };

                return (
                  <div className="grid w-full gap-3">
                    <Label htmlFor="handout">Course Handout</Label>
                    {renderHandoutField()}
                    {field.state.meta.errors.map((error) => (
                      <FormError
                        key={error?.message}
                        message={error?.message ?? ""}
                      />
                    ))}
                  </div>
                );
              }}
            </form.Field>
          </div>
        </ScrollArea>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              disabled={
                !canSubmit ||
                isCreatingCourse ||
                isSubmitting ||
                isLoadingDepartments ||
                isEditingCourse
              }
              type="submit"
            >
              {isSubmitting ||
              isCreatingCourse ||
              isLoadingDepartments ||
              isEditingCourse ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                `${action} Course`
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export default CourseForm;
