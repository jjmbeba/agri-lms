import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import db from "@/db";
import { sendForgotPasswordEmail } from "./email";

const SESSION_MAX_AGE_IN_MINUTES = 5; // 5 minutes

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendForgotPasswordEmail({
        to: user.name,
        subject: "Reset your password",
        resetPasswordLink: url,
      });
    },
  },
  plugins: [nextCookies()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: SESSION_MAX_AGE_IN_MINUTES * 60,
    },
  },
});
