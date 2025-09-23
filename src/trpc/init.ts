import {
  type inferRouterInputs,
  type inferRouterOutputs,
  initTRPC,
  TRPCError,
} from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import db from "@/db";
import { auth } from "@/lib/auth";
import type { AppRouter } from "./routers/_app";

export const createTRPCContext = cache(async (opts: { headers: Headers }) => {
  /**
   * @see: https://trpc.io/docs/server/context
   */

  const authSession = await auth.api.getSession({
    headers: opts.headers,
  });

  return { user: authSession?.user, db };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<typeof createTRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});
