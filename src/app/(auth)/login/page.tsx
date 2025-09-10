import type { Metadata } from "next";
import AuthPageContainer from "@/components/features/auth/auth-page-container";
import { LoginForm } from "@/components/features/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <AuthPageContainer>
      <LoginForm />
    </AuthPageContainer>
  );
}
