// IMPORTANT: this is a Convex Node Action
"use node";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { pretty, render } from "@react-email/render";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { resend } from "./resendClient";

export const sendEmail = action({
  args: {
    studentName: v.string(),
    studentEmail: v.string(),
    scope: v.union(v.literal("course"), v.literal("module")),
    courseName: v.string(),
    moduleName: v.optional(v.string()),
    contentUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const subject =
      args.scope === "module"
        ? `Module Enrollment Confirmation - ${args.moduleName}`
        : `Course Enrollment Confirmation - ${args.courseName}`;

    // 1. Generate the HTML from your JSX
    // This can come from a custom component in your /emails/ directory
    // if you would like to view your templates locally. For more info see:
    // https://react.email/docs/getting-started/manual-setup#5-run-locally
    const html = await pretty(
      await render(
        <Html>
          <Head />
          <Preview>
            Welcome to {args.courseName}! Your enrollment is confirmed.
          </Preview>
          <Tailwind
            config={{
              theme: {
                extend: {
                  colors: {
                    agriGreen: "#166534", // deep green
                    agriLight: "#dcfce7", // light sprout green
                    earth: "#57534e", // stone/earth text
                    soil: "#f5f5f4", // light background
                  },
                },
              },
            }}
          >
            <Body className="mx-auto my-auto bg-soil font-sans">
              <Container className="mx-auto my-[40px] w-[465px] overflow-hidden rounded-lg border border-[#e6e6e6] border-solid bg-white shadow-sm">
                {/* 1. Thematic Header Image (Wheat Field/Nature) */}
                <Section className="h-[140px] bg-slate-200">
                  <Img
                    alt="Staff training local farmers"
                    className="h-[140px] w-full object-cover"
                    height="140"
                    src="https://www.aatiupskill.com/agri-foods-1.webp"
                    width="465"
                  />
                </Section>

                <Section className="p-[30px]">
                  {/* Logo / Brand Header */}
                  <Section className="mb-[20px]">
                    <Text className="m-0 mt-2 text-center font-bold text-[20px] text-agriGreen">
                      AATI UPSKILL INSTITUTE
                    </Text>
                  </Section>

                  <Heading className="mx-0 mb-[20px] p-0 text-center font-normal text-[24px] text-agriGreen">
                    Let's Start Growing!
                  </Heading>

                  <Text className="text-[14px] text-earth leading-[24px]">
                    Hello <strong>{args.studentName}</strong>,
                  </Text>

                  <Text className="text-[14px] text-earth leading-[24px]">
                    We are delighted to plant the seeds of knowledge with you.
                    Your enrollment in <strong>{args.courseName}</strong> is now
                    confirmed. If you purchased an individual module, you will
                    see{" "}
                    <strong>{args.moduleName ?? "your selected module"}</strong>{" "}
                    inside the course dashboard.
                  </Text>

                  <Text className="text-[14px] text-earth leading-[24px]">
                    Your payment has been successfully processed. You can now
                    access your learning materials and start cultivating your
                    skills immediately.
                  </Text>

                  {/* Call to Action Button */}
                  <Section className="mt-[25px] mb-[25px] text-center">
                    <Button
                      className="rounded bg-agriGreen px-6 py-3 text-center font-bold text-[14px] text-white no-underline shadow-md"
                      href={args.contentUrl}
                    >
                      Access Your Learning Materials
                    </Button>
                  </Section>

                  <Hr className="mx-0 my-[26px] w-full border border-[#e6e6e6] border-solid" />

                  {/* Document Download Section */}
                  <Section className="rounded bg-agriLight p-4 text-center">
                    <Text className="m-0 mb-2 font-bold text-[14px] text-agriGreen">
                      📄 Official Documents
                    </Text>
                    <Text className="m-0 mb-3 text-[12px] text-earth">
                      Please keep a copy of your admission letter for your
                      records.
                    </Text>
                    <Link
                      className="font-semibold text-[12px] text-agriGreen underline"
                      href={args.contentUrl}
                    >
                      Download Admission Letter (PDF)
                    </Link>
                  </Section>

                  <Text className="mt-[30px] text-center text-[#a8a29e] text-[12px]">
                    © {new Date().getFullYear()} AATI UPSKILL INSTITUTE. <br />
                    Cultivating Excellence in Agriculture.
                  </Text>
                </Section>
              </Container>
            </Body>
          </Tailwind>
        </Html>
      )
    );

    // 2. Send your email as usual using the component
    await resend.sendEmail(ctx, {
      from: "Notifications <alerts@notifications.aatiupskill.com>",
      to: args.studentEmail,
      subject,
      html,
    });
  },
});
