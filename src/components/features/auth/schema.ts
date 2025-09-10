import { z } from "zod";

const MIN_PASSWORD_LENGTH = 8;

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(MIN_PASSWORD_LENGTH, {
    message: "Password must be at least 8 characters long",
  }),
});

export const signupSchema = z
  .object({
    email: z.email(),
    password: z.string().min(MIN_PASSWORD_LENGTH, {
      message: "Password must be at least 8 characters long",
    }),
    confirmPassword: z.string().min(MIN_PASSWORD_LENGTH, {
      message: "Confirm Password must be at least 8 characters long",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
