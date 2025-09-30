import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useModuleFormContext } from "./module-form-context";
import { basicInformationSchema } from "./schema";

const BasicModuleInfoForm = ({
  handleNextStep,
  handleBackStep,
  disableBackStep = false,
}: {
  handleNextStep: () => void;
  handleBackStep: () => void;
  disableBackStep?: boolean;
}) => {
  const { setBasicInfo, formData } = useModuleFormContext();

  const form = useForm({
    defaultValues: {
      title: formData.basicInfo?.title || "",
      description: formData.basicInfo?.description || "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: basicInformationSchema,
    },
    onSubmit: ({ value }) => {
      setBasicInfo({
        title: value.title,
        description: value.description,
      });
      handleNextStep();
    },
  });

  // Sync form with context data when it changes
  useEffect(() => {
    if (formData.basicInfo) {
      form.setFieldValue("title", formData.basicInfo.title);
      form.setFieldValue("description", formData.basicInfo.description);
    }
  }, [formData.basicInfo, form]);

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
                  "Proceed to Content Type"
                )}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export default BasicModuleInfoForm;
