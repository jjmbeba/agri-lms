import { type ClassValue, clsx } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const MAX_SLUG_LENGTH = 50;

export function generateSlug(title: string) {
  const slug = title
    .toLowerCase() // Convert to lowercase
    .replace(/[^\w\s-]/g, "") // Remove non-word characters except spaces and hyphens
    .trim() // Trim spaces
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .slice(0, MAX_SLUG_LENGTH); // Limit to 50 characters
  return slug;
}

const modulePricingPattern =
  /(Total|Combined) module prices \(([^)]+)\) cannot exceed course price \(([^)]+)\)/i;
const coursePricingPattern =
  /Course price \(([^)]+)\) cannot exceed combined module prices \(([^)]+)\)/i;
const publishPricingPattern =
  /Cannot publish:\s*module total ([^ ]+)\s+must be greater than or equal to the course price ([^ ]+)/i;
const calledByClientPattern = /Called by client.*/i;

function extractReadableServerMessage(rawMessage: string) {
  if (!rawMessage) {
    return "";
  }
  const lastErrorIndex = rawMessage.lastIndexOf("Error:");
  if (lastErrorIndex !== -1) {
    const afterError = rawMessage
      .slice(lastErrorIndex + "Error:".length)
      .trim();
    if (afterError) {
      return afterError.replace(calledByClientPattern, "").trim();
    }
  }
  const lines = rawMessage
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.pop() ?? rawMessage.trim();
}

export function displayToastError(error: Error) {
  const rawMessage = error.message ?? "";
  if (rawMessage.includes("Not authenticated")) {
    toast.error("Not authenticated");
    return;
  }
  if (rawMessage.includes("Unauthorized")) {
    toast.error("You are not authorized to perform this action.");
    return;
  }

  const readableMessage = extractReadableServerMessage(rawMessage);
  const coursePricingMatch =
    readableMessage.match(coursePricingPattern) ||
    rawMessage.match(coursePricingPattern);
  if (coursePricingMatch) {
    const [, coursePrice, moduleTotal] = coursePricingMatch;
    toast.error(
      `Course price ${coursePrice} must be less than or equal to the combined module prices ${moduleTotal}. Lower the course price or increase module prices and try again.`
    );
    return;
  }
  const pricingMatch =
    readableMessage.match(modulePricingPattern) ||
    rawMessage.match(modulePricingPattern);
  if (pricingMatch) {
    const [, , moduleTotal, coursePrice] = pricingMatch;
    toast.error(
      `Module total ${moduleTotal} must be less than or equal to the course price ${coursePrice}. Update the course or module prices and try again.`
    );
    return;
  }
  const publishPricingMatch =
    readableMessage.match(publishPricingPattern) ||
    rawMessage.match(publishPricingPattern);
  if (publishPricingMatch) {
    const [, moduleTotal, coursePrice] = publishPricingMatch;
    toast.error(
      `Cannot publish: module total ${moduleTotal} must be greater than or equal to the course price ${coursePrice}. Adjust prices and try again.`
    );
    return;
  }
  if (readableMessage.includes("Cannot publish: module total")) {
    toast.error(
      "Cannot publish because the total module prices are below the course price. Adjust prices and try again."
    );
    return;
  }
  if (readableMessage.includes("Total module prices")) {
    toast.error(
      "Module prices must be less than or equal to the course price. Adjust either the course or module price and try again."
    );
    return;
  }

  toast.error(readableMessage || rawMessage);
}

const shillingFormatter = new Intl.NumberFormat("en-KE", {
  currency: "KES",
  minimumFractionDigits: 2,
  style: "currency",
});

export function formatPriceShillings(amount?: number) {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return shillingFormatter.format(0);
  }
  return shillingFormatter.format(amount);
}

export function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
