import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateSlug } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { createDepartmentSchema } from "./schema";
import type { Department } from "./types";

type CreateDepartmentFormProps = {
  type: "create";
};

type EditDepartmentFormProps = {
  type: "edit";
  id: string;
  departmentDetails: Department;
};

type DepartmentFormProps = CreateDepartmentFormProps | EditDepartmentFormProps;

const DepartmentForm = (props: DepartmentFormProps) => {
  const { type, ...rest } = props;
  const action = type === "create" ? "Create" : "Update";
  const { mutate: createDepartment, isPending: isCreatingDepartment } =
    trpc.departments.create.useMutation({
      onSuccess: () => {
        toast.success("Department created successfully");
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: editDepartment, isPending: isEditingDepartment } =
    trpc.departments.editDepartment.useMutation({
      onSuccess: () => {
        toast.success("Department updated successfully");
      },
    });
  const form = useForm({
    defaultValues:
      type === "edit" && "departmentDetails" in rest
        ? {
            name: rest.departmentDetails.name,
            description: rest.departmentDetails.description,
            slug: rest.departmentDetails.slug,
          }
        : {
            name: "",
            description: "",
            slug: "",
          },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createDepartmentSchema,
    },
    onSubmit: ({ value }) => {
      if (type === "create") {
        createDepartment({
          name: value.name,
          description: value.description,
          slug: value.slug,
        });
      } else if (type === "edit" && "id" in rest) {
        editDepartment({
          id: rest.id,
          name: value.name,
          description: value.description,
          slug: value.slug,
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
        <form.Field
          listeners={{
            onChangeDebounceMs: 1000,
            onChange: ({ value }) => {
              form.setFieldValue("slug", generateSlug(value));
            },
          }}
          name="name"
        >
          {(field) => (
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                aria-invalid={field.state.meta.errors.length > 0}
                id="name"
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Name"
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
        <form.Field name="slug">
          {(field) => (
            <div className="grid gap-3">
              <Label htmlFor="slug">Generate Slug (Auto-generated)</Label>
              <Input
                aria-invalid={field.state.meta.errors.length > 0}
                disabled
                id="slug"
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Slug"
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
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              disabled={
                !canSubmit ||
                isSubmitting ||
                isCreatingDepartment ||
                isEditingDepartment
              }
              type="submit"
            >
              {isSubmitting || isCreatingDepartment || isEditingDepartment ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                `${action} Department`
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export default DepartmentForm;
