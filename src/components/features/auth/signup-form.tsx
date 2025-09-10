"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signupSchema } from "./schema";
import SocialOptions from "./social-options";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: signupSchema,
    },
    onSubmit: () => {
      toast.success("Signup successful");
    },
  });

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-bold text-2xl">Create your account</h1>
        <p className="text-balance text-muted-foreground text-sm">
          Enter your email below to create your account
        </p>
      </div>
      <div className="grid gap-6">
        <form.Field name="email">
          {(field) => (
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="m@example.com"
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
        <form.Field name="password">
          {(field) => (
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                onChange={(e) => field.handleChange(e.target.value)}
                type="password"
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
        <form.Field name="confirmPassword">
          {(field) => (
            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                onChange={(e) => field.handleChange(e.target.value)}
                type="password"
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
              className="w-full"
              disabled={!canSubmit || isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Create account"
              )}
            </Button>
          )}
        </form.Subscribe>
        <SocialOptions />
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link className="underline underline-offset-4" href="/login">
          Login
        </Link>
      </div>
    </form>
  );
}
