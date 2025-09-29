import type { UserIdentity } from "convex/server";

export const restrictRoles = (
  identity: UserIdentity | null,
  allowedRoles: string[]
) => {
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const role = (identity.metadata as { role?: string })?.role ?? "learner";

  if (!allowedRoles.includes(role)) {
    throw new Error("Unauthorized");
  }
};
