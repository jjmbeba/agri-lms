import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createLoader, parseAsString, type SearchParams } from "nuqs/server";
import { getSession } from "@/components/features/auth/actions";
import AuthPageContainer from "@/components/features/auth/auth-page-container";
import { LoginForm } from "@/components/features/auth/login-form";

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

  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthPageContainer>
      <LoginForm redirect={redirectTo} />
    </AuthPageContainer>
  );
}
