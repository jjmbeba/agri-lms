import { createAuthClient } from "better-auth/react";

export const {
  signIn,
  signUp,
  useSession,
  signOut,
  requestPasswordReset,
  resetPassword,
} = createAuthClient();
