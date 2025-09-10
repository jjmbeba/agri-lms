import type { Metadata } from "next";
import { createLoader, parseAsString, type SearchParams } from "nuqs/server";
import AuthPageContainer from "@/components/features/auth/auth-page-container";
import { LoginForm } from "@/components/features/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const loginSearchParams = {
  redirect: parseAsString.withDefault(""),
};

const loadSearchParams = createLoader(loginSearchParams);

export default async function LoginPage({ searchParams }: PageProps) {
  const { redirect } = await loadSearchParams(searchParams);
  return (
    <AuthPageContainer>
      <LoginForm redirect={redirect} />
    </AuthPageContainer>
  );
}
