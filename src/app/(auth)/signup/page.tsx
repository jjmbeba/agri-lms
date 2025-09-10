import type { Metadata } from "next";
import AuthPageContainer from "@/components/features/auth/auth-page-container";
import { SignupForm } from "@/components/features/auth/signup-form";

export const metadata: Metadata = {
  title: "Signup",
};

export default function LoginPage() {
  return (
    <AuthPageContainer>
      <SignupForm />
    </AuthPageContainer>
  );
}
