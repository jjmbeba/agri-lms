"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { env } from "@/env";
import { authClient } from "@/lib/auth-client";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL, {
  // Optionally pause queries until the user is authenticated
  expectAuth: true,
});

const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});
convexQueryClient.connect(queryClient);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexBetterAuthProvider authClient={authClient} client={convex}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ConvexBetterAuthProvider>
  );
}
