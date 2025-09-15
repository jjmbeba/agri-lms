"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { type Tag, TagInput } from "emblor";
import { Loader2 } from "lucide-react";
import { useState } from "react";
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
import { mockCategories } from "./dummy";
import { createCourseSchema } from "./schema";

const CreateCourseForm = () => {
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      tags: [] as Tag[],
      categoryId: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createCourseSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
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
          <form.Field name="categoryId">
            {(field) => (
              <div className="grid gap-3">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  defaultValue={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCategories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
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
            <Button disabled={!canSubmit} type="submit">
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Create Course"
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export default CreateCourseForm;
