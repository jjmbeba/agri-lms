"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type Tag, TagInput } from "emblor";
import { Loader2 } from "lucide-react";
import { useState } from "react";
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
import { displayToastError } from "@/lib/utils";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
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

const CourseForm = (props: CourseFormProps) => {
  const { type, ...rest } = props;

  const action = type === "create" ? "Create" : "Update";

  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const { data: departments, isLoading: isLoadingDepartments } = useQuery(
    convexQuery(api.departments.getDepartments, {})
  );

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
          }
        : {
            title: "",
            description: "",
            tags: [] as Tag[],
            departmentId: "",
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
        });
      } else if (type === "edit" && "id" in rest) {
        editCourse({
          id: rest.id as Id<"course">,
          title: value.title,
          description: value.description,
          tags: value.tags.map((tag) => tag.text),
          departmentId: value.departmentId as Id<"department">,
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
