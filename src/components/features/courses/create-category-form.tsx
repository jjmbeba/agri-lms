"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategorySchema } from "./schema";

const CreateCategoryForm = () => {
  const form = useForm({
    defaultValues: {
      name: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createCategorySchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });
  return (
    <>
      <h3 className="scroll-m-20 font-semibold text-xl tracking-tight">
        Create Category
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-6">
          <form.Field name="name">
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
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button disabled={!canSubmit || isSubmitting} type="submit">
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Create Category"
                )}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </>
  );
};

export default CreateCategoryForm;
