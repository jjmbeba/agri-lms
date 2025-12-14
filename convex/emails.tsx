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
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { resend } from "./resendClient";

export const sendEnrollmentEmail = action({
  args: {
    studentName: v.string(),
    studentEmail: v.string(),
    scope: v.union(v.literal("course"), v.literal("module")),
    courseName: v.string(),
    moduleName: v.optional(v.string()),
    contentUrl: v.string(),
    admissionDate: v.string(),
    refNumber: v.string(),
    studentId: v.string(),
    transactionId: v.optional(v.string()),
    admissionLetterUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const subject =
      args.scope === "module"
        ? `Module Enrollment Confirmation - ${args.moduleName}`
        : `Course Enrollment Confirmation - ${args.courseName}`;

    const pdfDataUrl = args.admissionLetterUrl ?? args.contentUrl;

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
                  <Section className="mb-[20px] flex flex-col items-center">
                    <Img
                      alt="AATI Upskill Institute Logo"
                      className="mx-auto mb-2"
                      height="64"
                      src="https://www.aatiupskill.com/aati-logo.png"
                      width="64"
                    />
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
                      Your admission letter is available below.
                    </Text>
                    <Link
                      className="font-semibold text-[12px] text-agriGreen underline"
                      href={pdfDataUrl}
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
      from: "AATI UPSKILL LMS - Notifications <alerts@notifications.aatiupskill.com>",
      to: args.studentEmail,
      subject,
      html,
    });
  },
});

export const sendCourseAvailableEmail = action({
  args: {
    subscriberEmail: v.string(),
    subscriberName: v.string(),
    courseName: v.string(),
    courseUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const subject = `Course Now Available - ${args.courseName}`;

    const html = await pretty(
      await render(
        <Html>
          <Head />
          <Preview>
            Great news! The course {args.courseName} you subscribed to is now
            available for enrollment.
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
                {/* Thematic Header Image */}
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
                  <Section className="mb-[20px] flex flex-col items-center">
                    <Img
                      alt="AATI Upskill Institute Logo"
                      className="mx-auto mb-2"
                      height="60"
                      src="https://www.aatiupskill.com/aati-logo.png"
                      width="60"
                    />
                    <Text className="m-0 mt-2 text-center font-bold text-[20px] text-agriGreen">
                      AATI UPSKILL INSTITUTE
                    </Text>
                  </Section>

                  <Heading className="mx-0 mb-[20px] p-0 text-center font-normal text-[24px] text-agriGreen">
                    Your Course is Ready!
                  </Heading>

                  <Text className="text-[14px] text-earth leading-[24px]">
                    Hello <strong>{args.subscriberName}</strong>,
                  </Text>

                  <Text className="text-[14px] text-earth leading-[24px]">
                    Great news! The course <strong>{args.courseName}</strong>{" "}
                    you subscribed to is now available for enrollment. You can
                    now access the course and start your learning journey.
                  </Text>

                  <Text className="text-[14px] text-earth leading-[24px]">
                    We're excited to have you join us and begin cultivating your
                    skills in this course.
                  </Text>

                  {/* Call to Action Button */}
                  <Section className="mt-[25px] mb-[25px] text-center">
                    <Button
                      className="rounded bg-agriGreen px-6 py-3 text-center font-bold text-[14px] text-white no-underline shadow-md"
                      href={args.courseUrl}
                    >
                      View Course
                    </Button>
                  </Section>

                  <Hr className="mx-0 my-[26px] w-full border border-[#e6e6e6] border-solid" />

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

    await resend.sendEmail(ctx, {
      from: "AATI UPSKILL LMS - Notifications <alerts@notifications.aatiupskill.com>",
      to: args.subscriberEmail,
      subject,
      html,
    });
  },
});

export const notifyCourseSubscribers = action({
  args: {
    courseId: v.id("course"),
    courseName: v.string(),
    courseSlug: v.string(),
  },
  handler: async (ctx, args): Promise<{ notified: number }> => {
    // Import the query to get subscribers
    const { api } = await import("./_generated/api");

    // Get all subscribers for this course
    const subscribers = await ctx.runQuery(
      api.courses.getCourseNotificationSubscribers,
      {
        courseId: args.courseId,
      }
    );

    if (subscribers.length === 0) {
      return { notified: 0 } as const;
    }

    // Generate course URL
    const courseUrl = `${process.env.SITE_URL}/courses/${args.courseSlug}`;

    // Send email to each subscriber and delete subscription after success
    const emailPromises = subscribers.map(
      async (subscriber: {
        notificationId: Id<"courseNotification">;
        userId: string;
        userEmail: string;
        userName: string;
      }) => {
        try {
          await ctx.runAction(api.emails.sendCourseAvailableEmail, {
            subscriberEmail: subscriber.userEmail,
            subscriberName: subscriber.userName,
            courseName: args.courseName,
            courseUrl,
          });
          // Delete subscription after successfully sending email
          await ctx.runMutation(api.courses.deleteCourseNotification, {
            notificationId: subscriber.notificationId,
          });
          return true;
        } catch (error) {
          // biome-ignore lint/suspicious/noConsole: Implement logger later
          console.error(
            `Failed to send notification email to ${subscriber.userEmail}:`,
            error
          );
          // Silently fail for individual emails to not block others
          return false;
        }
      }
    );

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r === true).length;

    return { notified: successCount } as const;
  },
});
