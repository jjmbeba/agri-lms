import { renderToBuffer } from "@react-pdf/renderer";
import { fetchMutation } from "convex/nextjs";
import { NextResponse } from "next/server";
import { UTApi, UTFile } from "uploadthing/server";
import { z } from "zod";
import AdmissionLetterPdf from "@/components/features/notifications/admission-letter";
import { env } from "@/env";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

const BodySchema = z.object({
  enrollmentId: z.string(),
  courseName: z.string(),
  courseSlug: z.string(),
  studentName: z.string(),
  studentEmail: z.string().email(),
  studentId: z.string(),
  admissionDate: z.string(),
  refNumber: z.string(),
  transactionId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const args = parsed.data;

    const utapi = env.UPLOADTHING_TOKEN?.trim()
      ? new UTApi({ token: env.UPLOADTHING_TOKEN })
      : null;

    const pdfBuffer = await renderToBuffer(
      <AdmissionLetterPdf
        admissionDate={args.admissionDate}
        courseName={args.courseName}
        refNumber={args.refNumber}
        studentEmail={args.studentEmail}
        studentId={args.studentId}
        studentName={args.studentName}
        transactionId={args.transactionId}
      />
    );

    const base64 = pdfBuffer.toString("base64");
    const dataUrl = `data:application/pdf;base64,${base64}`;

    let uploadedUrl: string | null = null;
    if (utapi) {
      const pdfBytes = new Uint8Array(pdfBuffer);
      const file = new UTFile(
        [pdfBytes],
        `admission-letter-${args.enrollmentId}.pdf`,
        { type: "application/pdf" }
      );
      const uploaded = await utapi.uploadFiles([file]);
      const result = Array.isArray(uploaded) ? uploaded[0] : uploaded;
      uploadedUrl = result?.data?.ufsUrl ?? result?.data?.ufsUrl ?? null;
    }

    const url = uploadedUrl ?? dataUrl;

    await fetchMutation(api.enrollments.setAdmissionLetterUrl, {
      enrollmentId: args.enrollmentId as Id<"enrollment">,
      url,
    });

    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
