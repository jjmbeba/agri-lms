"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { resetPasswordSchema } from "./schema";

export function ResetPasswordForm({
  className,
  token,
  ...props
}: React.ComponentProps<"form"> & { token: string }) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      if (!token || token === "") {
        toast.error("Token is required");
        return;
      }

      await resetPassword(
        {
          newPassword: value.password,
          token,
        },
        {
          onSuccess: () => {
            toast.success("Password reset successful");
            router.push("/login");
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
        <h1 className="font-bold text-2xl">Reset your password</h1>
        <p className="text-balance text-muted-foreground text-sm">
          Enter your password below to reset your password
        </p>
      </div>
      <div className="grid gap-6">
        <form.Field name="password">
          {(field) => (
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">New Password</Label>
              </div>
              <div className="relative">
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id="password"
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="New Password"
                  type={isVisible ? "text" : "password"}
                  value={field.state.value}
                />
                <button
                  aria-controls="password"
                  aria-label={isVisible ? "Hide password" : "Show password"}
                  aria-pressed={isVisible}
                  className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={toggleVisibility}
                  type="button"
                >
                  {isVisible ? (
                    <EyeOffIcon aria-hidden="true" size={16} />
                  ) : (
                    <EyeIcon aria-hidden="true" size={16} />
                  )}
                </button>
              </div>
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
              <div className="flex items-center">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
              </div>
              <div className="relative">
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id="confirmPassword"
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Confirm Password"
                  type={isVisible ? "text" : "password"}
                  value={field.state.value}
                />
                <button
                  aria-controls="confirmPassword"
                  aria-label={isVisible ? "Hide password" : "Show password"}
                  aria-pressed={isVisible}
                  className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={toggleVisibility}
                  type="button"
                >
                  {isVisible ? (
                    <EyeOffIcon aria-hidden="true" size={16} />
                  ) : (
                    <EyeIcon aria-hidden="true" size={16} />
                  )}
                </button>
              </div>
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
