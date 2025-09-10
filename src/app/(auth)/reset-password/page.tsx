import { createLoader, parseAsString, type SearchParams } from "nuqs";
import AuthPageContainer from "@/components/features/auth/auth-page-container";
import { ResetPasswordForm } from "@/components/features/auth/reset-password-form";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const resetPasswordSearchParams = {
  token: parseAsString.withDefault(""),
};

const loadSearchParams = createLoader(resetPasswordSearchParams);

const ResetPasswordPage = async ({ searchParams }: PageProps) => {
  const { token } = await loadSearchParams(searchParams);

  return (
    <AuthPageContainer>
      <ResetPasswordForm token={token} />
    </AuthPageContainer>
  );
};

export default ResetPasswordPage;
