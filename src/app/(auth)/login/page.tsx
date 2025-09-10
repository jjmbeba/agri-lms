import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createLoader, parseAsString, type SearchParams } from "nuqs/server";
import AuthPageContainer from "@/components/features/auth/auth-page-container";
import { LoginForm } from "@/components/features/auth/login-form";
import { auth } from "@/lib/auth";

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

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }

  return (
    <AuthPageContainer>
      <LoginForm redirect={redirectTo} />
    </AuthPageContainer>
  );
}
