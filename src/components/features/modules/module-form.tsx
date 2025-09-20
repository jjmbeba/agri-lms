import { revalidateLogic, useForm, useStore } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
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
import { moduleTypes } from "./constants";
import { createModuleSchema } from "./schema";

const ModuleForm = () => {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      type: "",
      position: 0,
      content: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createModuleSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  const selectType = useStore(form.store, (state) => state.values.type);
  console.log("selectType", selectType);
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
        <form.Field name="type">
          {(field) => (
            <div className="grid gap-3">
              <Label htmlFor="type">Type</Label>
              <Select
                defaultValue={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={"Select a type"} />
                </SelectTrigger>
                <SelectContent>
                  {moduleTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
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
        <form.Field name="content">
          {(field) => (
            <div className="grid gap-3">
              <Label htmlFor="content">Content</Label>
              {selectType === "text" && (
                <Textarea
                  aria-invalid={field.state.meta.errors.length > 0}
                  id="content"
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Type your text here"
                  value={field.state.value}
                />
              )}
              {selectType === "video" && (
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id="content"
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Type your video url here"
                  value={field.state.value}
                />
              )}
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
                "Create Module"
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export default ModuleForm;
