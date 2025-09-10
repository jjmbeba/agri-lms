"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { loginSchema } from "./schema";

export function LoginForm({
  redirect,
  className,
  ...props
}: React.ComponentProps<"form"> & { redirect: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: loginSchema,
    },
    onSubmit: async ({ value }) => {
      const safeRedirect = redirect.startsWith("/") ? redirect : `/${redirect}`;
      await signIn.email(
        {
          email: value.email,
          password: value.password,
          callbackURL: safeRedirect,
        },
        {
          onSuccess: () => {
            toast.success("Login successful");
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
        <h1 className="font-bold text-2xl">Login to your account</h1>
        <p className="text-balance text-muted-foreground text-sm">
          Enter your email below to login to your account
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
        <form.Field name="password">
          {(field) => (
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                  href="/forgot-password"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id="password"
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Password"
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
                "Login"
              )}
            </Button>
          )}
        </form.Subscribe>
        {/* <SocialOptions /> */}
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link className="underline underline-offset-4" href="/signup">
          Sign up
        </Link>
      </div>
    </form>
  );
}
