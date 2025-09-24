"use server";

import { fetchQuery } from "convex/nextjs";
import { getToken } from "@/lib/auth-server";
import { api } from "../../../../convex/_generated/api";

// Authenticated mutation via server function
export async function getSession() {
  const token = await getToken();
  return await fetchQuery(api.auth.getCurrentUser, {}, { token });
}
