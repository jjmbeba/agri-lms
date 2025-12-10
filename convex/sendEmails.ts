import { internalMutation } from "./_generated/server";
import { resend } from "./resendClient";

export const sendTestEmail = internalMutation({
  handler: async (ctx) => {
    await resend.sendEmail(ctx, {
      from: "Notifications <alerts@notifications.aatiupskill.com>",
      to: "delivered@resend.dev",
      subject: "Hi there",
      html: "This is a test email",
    });
  },
});
