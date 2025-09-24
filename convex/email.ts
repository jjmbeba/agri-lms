import { Resend } from "@convex-dev/resend";
import { render } from "@react-email/components";
import { components } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";
import ForgotPasswordEmail from "./emails/ForgotPasswordEmail";

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
});

export const sendForgotPasswordEmail = async ({
  to,
  subject,
  resetPasswordLink,
  ctx,
}: {
  to: string;
  subject: string;
  resetPasswordLink: string;
  ctx: ActionCtx;
}) => {
  try {
    await resend.sendEmail(ctx, {
      from: process.env.RESEND_FROM as string,
      to: "delivered@resend.dev",
      subject,
      html: await render(
        ForgotPasswordEmail({
          resetPasswordLink,
          userFirstname: to,
        })
      ),
    });
  } catch (error) {
    throw new Error((error as Error)?.message ?? "Failed to send email");
  }
};
