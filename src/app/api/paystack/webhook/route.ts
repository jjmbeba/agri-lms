import crypto from "node:crypto";
import { fetchMutation } from "convex/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify/";

type ConvexStatus = "pending" | "success" | "failed" | "abandoned";

const normalizeStatus = (status?: string | null): ConvexStatus => {
  if (status === "success") {
    return "success";
  }
  if (status === "failed") {
    return "failed";
  }
  if (status === "abandoned") {
    return "abandoned";
  }
  return "pending";
};

const verifyPaystackTransaction = async (reference: string) => {
  const response = await fetch(`${PAYSTACK_VERIFY_URL}${reference}`, {
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    data?: {
      status?: string;
      amount?: number;
      currency?: string;
    };
  };

  if (!response.ok) {
    throw new Error(
      payload?.data?.status ?? "Unable to verify Paystack transaction"
    );
  }

  return payload.data;
};

const verifySignature = (payload: string, signature: string | null) => {
  if (!signature) {
    return false;
  }

  const generated = crypto
    .createHmac("sha512", env.PAYSTACK_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generated, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: <error logging>
    console.error(error);
    return false;
  }
};

type WebhookEvent = {
  event?: string;
  data?: {
    reference?: string;
    amount?: number;
    currency?: string;
    metadata?: Record<string, unknown>;
  };
};

type ParsedMetadata = {
  userId: string;
  courseId: Id<"course">;
  moduleId?: Id<"module">;
  accessScope: "course" | "module";
};

const parseEvent = (rawBody: string): WebhookEvent => {
  return JSON.parse(rawBody) as WebhookEvent;
};

const extractMetadata = (
  metadata: Record<string, unknown>
): ParsedMetadata | null => {
  const userIdRaw = metadata.userId;
  const courseIdRaw = metadata.courseId;
  const moduleIdRaw = metadata.moduleId;
  const userId = typeof userIdRaw === "string" ? userIdRaw : "";
  const courseId =
    typeof courseIdRaw === "string" ? (courseIdRaw as Id<"course">) : undefined;
  const moduleId =
    typeof moduleIdRaw === "string" ? (moduleIdRaw as Id<"module">) : undefined;
  const accessScopeRaw = metadata.accessScope;
  const accessScope: "course" | "module" =
    accessScopeRaw === "module" ? "module" : "course";

  if (!(userId && courseId)) {
    return null;
  }

  if (accessScope === "module" && !moduleId) {
    return null;
  }

  return {
    userId,
    courseId,
    moduleId,
    accessScope,
  };
};

const validateWebhookRequest = (
  event: WebhookEvent,
  parsedMetadata: ParsedMetadata | null
): { error: string } | null => {
  const reference = event?.data?.reference;
  if (!reference) {
    return { error: "Missing transaction reference" };
  }

  if (!parsedMetadata) {
    return { error: "Missing course or user metadata" };
  }

  if (parsedMetadata.accessScope === "module" && !parsedMetadata.moduleId) {
    return { error: "Module metadata required for module purchases" };
  }

  return null;
};

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = parseEvent(rawBody);
    const metadata = event?.data?.metadata ?? {};
    const parsedMetadata = extractMetadata(metadata);

    const validationError = validateWebhookRequest(event, parsedMetadata);
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 });
    }

    // After validation, parsedMetadata is guaranteed to be non-null
    if (!parsedMetadata) {
      return NextResponse.json(
        { error: "Missing course or user metadata" },
        { status: 400 }
      );
    }

    const reference = event?.data?.reference ?? "";
    const verifiedData = await verifyPaystackTransaction(reference);
    const transactionStatus = normalizeStatus(verifiedData?.status);

    await fetchMutation(api.payments.recordPaystackTransaction, {
      reference,
      status: transactionStatus,
      amountCents: verifiedData?.amount ?? event?.data?.amount ?? 0,
      currency: verifiedData?.currency ?? event?.data?.currency ?? "KES",
      userId: parsedMetadata.userId,
      courseId: parsedMetadata.courseId,
      moduleId: parsedMetadata.moduleId,
      accessScope: parsedMetadata.accessScope,
      metadata,
      rawEvent: event,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected webhook error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
