import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createLoader, parseAsString, type SearchParams } from "nuqs/server";
import AuthPageContainer from "@/components/features/auth/auth-page-container";
import { LoginForm } from "@/components/features/auth/login-form";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = {
  title: "Login",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const loginSearchParams = {
  redirectTo: parseAsString.withDefault(""),
};

const loadSearchParams = createLoader(loginSearchParams);

export default async function LoginPage({ searchParams }: PageProps) {
  const { redirectTo } = await loadSearchParams(searchParams);

  const user = await fetchQuery(api.auth.getCurrentUser, {});

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthPageContainer>
      <LoginForm redirect={redirectTo} />
    </AuthPageContainer>
  );
}
