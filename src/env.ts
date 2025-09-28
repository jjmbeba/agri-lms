import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    RESEND_API_KEY: z.string(),
    BETTER_AUTH_URL: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    RESEND_FROM: z.string(),
    UPLOADTHING_TOKEN: z.string(),
    SITE_URL: z.string(),
    CLERK_JWT_ISSUER_DOMAIN: z.string(),
  },
  client: {
    NEXT_PUBLIC_CONVEX_URL: z.string(),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    RESEND_FROM: process.env.RESEND_FROM,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    SITE_URL: process.env.SITE_URL,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    CLERK_JWT_ISSUER_DOMAIN: process.env.CLERK_JWT_ISSUER_DOMAIN,
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  // experimental__runtimeEnv: {
  //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  // }
});
