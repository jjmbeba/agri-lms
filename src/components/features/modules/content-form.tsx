/** biome-ignore-all lint/suspicious/noArrayIndexKey: Have to do this because of the dynamic array */

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/form-error";
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
import { contentSchema } from "./schema";

type ContentFormProps = {
  handleNextStep: () => void;
  handleBackStep: () => void;
  disableBackStep?: boolean;
};

const ContentForm = ({
  handleNextStep,
  handleBackStep,
  disableBackStep = false,
}: ContentFormProps) => {
  const form = useForm({
    defaultValues: {
      content: [{ type: "text", content: "" }],
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: contentSchema,
    },
    onSubmit: () => {
      handleNextStep();
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
                      field.pushValue({ type: "text", content: "" })
                    }
                    type="button"
                    variant="outline"
                  >
                    Add Content
                  </Button>
                </div>
                <ScrollArea className="h-[300px] space-y-4 pb-2">
                  {field.state.value.map((_, i) => {
                    return (
                      <div
                        className="flex flex-col gap-4 rounded-lg border p-4"
                        key={i}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground text-sm">
                            Item {i + 1}
                          </span>
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
                            <div className="mt-3 flex flex-col gap-2">
                              <Label>Type</Label>
                              <Select
                                defaultValue={subField.state.value}
                                onValueChange={(e) => subField.handleChange(e)}
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
                              {subField.state.meta.errors.map((error) => (
                                <FormError
                                  key={error?.message}
                                  message={error?.message ?? ""}
                                />
                              ))}
                            </div>
                          )}
                        </form.Field>
                        <form.Field name={`content[${i}].content`}>
                          {(subField) => (
                            <div className="flex flex-col gap-2">
                              <Label>Content</Label>
                              <Textarea
                                onChange={(e) =>
                                  subField.handleChange(e.target.value)
                                }
                                placeholder="Enter Content"
                                value={subField.state.value}
                              />
                              {subField.state.meta.errors.map((error) => (
                                <FormError
                                  key={error?.message}
                                  message={error?.message ?? ""}
                                />
                              ))}
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
