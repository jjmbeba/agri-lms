"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { forgotPasswordSchema } from "./schema";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const form = useForm({
    defaultValues: {
      email: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.requestPasswordReset(
        {
          email: value.email,
          redirectTo: "/reset-password",
        },
        {
          onSuccess: () => {
            toast.success("Password reset email sent");
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        }
      );
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
        <h1 className="font-bold text-2xl">Forgot your password?</h1>
        <p className="text-balance text-muted-foreground text-sm">
          Enter your email below to reset your password
        </p>
      </div>
      <div className="grid gap-6">
        <form.Field name="email">
          {(field) => (
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                aria-invalid={field.state.meta.errors.length > 0}
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
                "Reset password"
              )}
            </Button>
          )}
        </form.Subscribe>
        {/* <SocialOptions /> */}
      </div>
    </form>
  );
}
