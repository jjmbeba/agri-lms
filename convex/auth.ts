import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

// biome-ignore lint/style/noNonNullAssertion: Corrects type
const siteUrl = process.env.SITE_URL!;

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);
const SESSION_MAX_AGE_IN_MINUTES = 5; // 5 minutes

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    // disable logging when createAuth is called just to generate options.
    // this is not required, but there's a lot of noise in logs without it.
    logger: {
      disabled: optionsOnly,
    },
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    // Configure simple, non-verified email/password to get started
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "learner",
          input: false,
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      //   sendResetPassword: async ({ user, url }) => {
      //     await sendForgotPasswordEmail({
      //       to: user.name,
      //       subject: "Reset your password",
      //       resetPasswordLink: url,
      //     });
      //   },
    },
    plugins: [
      // The Convex plugin is required for Convex compatibility
      convex(),
    ],
    session: {
      cookieCache: {
        enabled: true,
        maxAge: SESSION_MAX_AGE_IN_MINUTES * 60,
      },
    },
    rateLimit: {
      enabled: true,
      window: 10, // time window in seconds
      max: 100, // max requests in the window
    },
  });
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
// export const getCurrentUser = query({
//   args: {},
//   handler: async (ctx) => {
//     return authComponent.getAuthUser(ctx);
//   },
// });
