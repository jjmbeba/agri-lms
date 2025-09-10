import { Resend } from "resend";
import ForgotPasswordEmail from "@/components/features/auth/forgot-email-template";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

export const sendForgotPasswordEmail = async ({
  to,
  subject,
  resetPasswordLink,
}: {
  to: string;
  subject: string;
  resetPasswordLink: string;
}) => {
  "use server";

  try {
    await resend.emails.send({
      from: env.RESEND_FROM,
      to: ["delivered@resend.dev"],
      subject,
      react: ForgotPasswordEmail({
        resetPasswordLink,
        userFirstname: to,
      }),
    });
  } catch (error) {
    throw new Error((error as Error)?.message ?? "Failed to send email");
  }
};
