"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { type Tag, TagInput } from "emblor";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";
import { createCourseSchema } from "./schema";
import type { CourseWithCategory } from "./types";

type CreateCourseFormProps = {
  type: "create";
};

type EditCourseFormProps = {
  type: "edit";
  courseDetails: CourseWithCategory;
  id: string;
};

type CourseFormProps = CreateCourseFormProps | EditCourseFormProps;

const CourseForm = (props: CourseFormProps) => {
  const { type, ...rest } = props;

  const action = type === "create" ? "Create" : "Update";

  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const { data: departments, isLoading: isLoadingDepartments } =
    trpc.departments.getAll.useQuery();
  const { mutate: createCourse, isPending: isCreatingCourse } =
    trpc.courses.create.useMutation({
      onSuccess: () => {
        toast.success("Course created successfully");
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  const { mutate: editCourse, isPending: isEditingCourse } =
    trpc.courses.editCourse.useMutation({
      onSuccess: () => {
        toast.success("Course updated successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const form = useForm({
    defaultValues:
      type === "edit" && "courseDetails" in rest
        ? {
            title: rest.courseDetails.course.title,
            description: rest.courseDetails.course.description,
            tags: rest.courseDetails.course.tags.split(",").map((tag) => ({
              id: tag,
              text: tag,
            })),
            departmentId: rest.courseDetails.course.departmentId,
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
          tags: value.tags,
          departmentId: value.departmentId,
        });
      } else if (type === "edit" && "id" in rest) {
        editCourse({
          id: rest.id,
          title: value.title,
          description: value.description,
          tags: value.tags,
          departmentId: value.departmentId,
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
        <div className="flex w-full items-start gap-3 *:w-1/2">
          <form.Field name="departmentId">
            {(field) => (
              <div className="grid gap-3">
                <Label htmlFor="departmentId">Department</Label>
                <Select
                  defaultValue={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger
                    className="w-full"
                    disabled={isLoadingDepartments || departments?.length === 0}
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
                      <SelectItem value="no-departments">
                        No departments found
                      </SelectItem>
                    )}
                    {departments &&
                      departments.length > 0 &&
                      departments.map((department) => (
                        <SelectItem
                          key={department.id}
                          value={department.id.toString()}
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
              <div className="grid gap-3">
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
