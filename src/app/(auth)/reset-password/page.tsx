import type { Metadata } from "next";
import { createLoader, parseAsString, type SearchParams } from "nuqs/server";
import AuthPageContainer from "@/components/features/auth/auth-page-container";
import { ResetPasswordForm } from "@/components/features/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const resetPasswordSearchParams = {
  token: parseAsString.withDefault(""),
};

const loadSearchParams = createLoader(resetPasswordSearchParams);

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await loadSearchParams(searchParams);

  return (
    <AuthPageContainer>
      <ResetPasswordForm token={token} />
    </AuthPageContainer>
  );
}
