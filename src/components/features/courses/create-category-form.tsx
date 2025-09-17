"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateSlug } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { createCategorySchema } from "./schema";

const CreateCategoryForm = () => {
  const { mutate: createCategory, isPending: isCreatingCategory } =
    trpc.categories.create.useMutation({
      onSuccess: () => {
        toast.success("Category created successfully");
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createCategorySchema,
    },
    onSubmit: ({ value }) => {
      createCategory({
        name: value.name,
        slug: value.slug,
      });
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
              disabled={!canSubmit || isSubmitting || isCreatingCategory}
              type="submit"
            >
              {isSubmitting || isCreatingCategory ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Create Category"
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export default CreateCategoryForm;
