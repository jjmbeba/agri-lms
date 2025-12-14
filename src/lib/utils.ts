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
  /Cannot publish:\s*module total ([\d,]+(?:\s*KES)?)\s+must be greater than or equal to the course price ([\d,]+(?:\s*KES)?)/i;
const calledByClientPattern = /Called by client.*/i;

function extractReadableServerMessage(rawMessage: string) {
  if (!rawMessage) {
    return "";
  }

  // Remove "Called by client" prefix if present
  let cleanedMessage = rawMessage.replace(calledByClientPattern, "").trim();

  // Handle Convex error format: "[CONVEX M(...)] [Request ID: ...] Server Error"
  // The actual error might be in the cause or after "Uncaught ConvexError:"
  const convexErrorMatch = cleanedMessage.match(
    /Uncaught ConvexError:\s*(.+?)(?:\s+at\s|$)/i
  );
  if (convexErrorMatch && convexErrorMatch[1]) {
    cleanedMessage = convexErrorMatch[1].trim();
  }

  // Try to find the actual error message after "Error:" markers
  const errorMarkers = ["ConvexError:", "Error:", "Uncaught ConvexError:"];
  for (const marker of errorMarkers) {
    const lastErrorIndex = cleanedMessage.lastIndexOf(marker);
    if (lastErrorIndex !== -1) {
      const afterError = cleanedMessage
        .slice(lastErrorIndex + marker.length)
        .trim();
      if (afterError && afterError.length > 0) {
        cleanedMessage = afterError;
        break;
      }
    }
  }

  // Remove Convex wrapper format: "[CONVEX M(...)] [Request ID: ...] Server Error"
  cleanedMessage = cleanedMessage
    .replace(
      /\[CONVEX\s+M\([^)]+\)\]\s*\[Request ID:[^\]]+\]\s*Server Error/gi,
      ""
    )
    .trim();

  // Split by newlines and get the last meaningful line
  const lines = cleanedMessage
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.match(/^at\s+/));

  // Return the last line, or the whole message if no lines found
  return lines.length > 0 ? lines[lines.length - 1] : cleanedMessage;
}

export function displayToastError(error: Error) {
  // Convex errors might have the actual message in different properties
  // Check error.data, error.cause, or error.message
  const errorData = (error as { data?: unknown; cause?: Error }).data;
  const errorCause = (error as { cause?: Error }).cause;

  // Try to extract the actual error message from various possible locations
  let rawMessage = error.message ?? "";

  // Collect all possible message sources
  const messageSources: string[] = [rawMessage];

  // Check error.stack - often contains the full error message
  if (error.stack) {
    messageSources.push(error.stack);
  }

  // Check error.cause - Convex often wraps errors in cause
  if (errorCause?.message) {
    messageSources.push(errorCause.message);
  }

  // Check error.cause.stack as well
  if (errorCause?.stack) {
    messageSources.push(errorCause.stack);
  }

  // Check if error.data contains the message
  if (errorData && typeof errorData === "object") {
    const dataMessage = (errorData as { message?: string }).message;
    if (dataMessage && typeof dataMessage === "string") {
      messageSources.push(dataMessage);
    }
  }

  // Try stringifying the error to find nested messages
  try {
    const errorString = JSON.stringify(error, null, 2);
    if (errorString.includes("Cannot publish")) {
      // Extract the message from JSON string
      const match = errorString.match(/"Cannot publish[^"]+"/);
      if (match) {
        messageSources.push(match[0].replace(/"/g, ""));
      }
    }
    // Check for coming-soon errors in JSON string
    if (errorString.includes("coming-soon")) {
      const comingSoonMatch = errorString.match(
        /"Cannot (?:set course status to 'coming-soon'|add draft modules to a course with 'coming-soon' status)[^"]*"/
      );
      if (comingSoonMatch) {
        messageSources.push(comingSoonMatch[0].replace(/"/g, ""));
      }
    }
  } catch {
    // Ignore JSON stringify errors
  }

  // Try to find the message that contains the actual error (not just wrapper)
  for (const msg of messageSources) {
    if (
      msg.includes("Cannot publish") ||
      msg.includes("module total") ||
      msg.includes("coming-soon") ||
      (msg.includes("ConvexError") && !msg.includes("[CONVEX M("))
    ) {
      rawMessage = msg;
      break;
    }
  }

  // If we still have a wrapper message, try to extract from cause recursively
  if (
    rawMessage.includes("[CONVEX") &&
    !rawMessage.includes("Cannot publish") &&
    !rawMessage.includes("coming-soon")
  ) {
    if (errorCause?.message && !errorCause.message.includes("[CONVEX")) {
      rawMessage = errorCause.message;
    }
    // Also check if cause has a cause
    const nestedCause = (errorCause as { cause?: Error })?.cause;
    if (
      nestedCause?.message &&
      (nestedCause.message.includes("Cannot publish") ||
        nestedCause.message.includes("coming-soon"))
    ) {
      rawMessage = nestedCause.message;
    }
  }

  if (rawMessage.includes("Not authenticated")) {
    toast.error("Not authenticated");
    return;
  }
  if (rawMessage.includes("Unauthorized")) {
    toast.error("You are not authorized to perform this action.");
    return;
  }

  // Check for coming-soon status errors early (before extraction)
  // This handles cases where the error might be wrapped
  if (rawMessage.includes("Cannot set course status to 'coming-soon'")) {
    toast.error(
      "Cannot set course status to 'coming-soon' when draft modules exist. Please delete all draft modules first."
    );
    return;
  }
  if (
    rawMessage.includes(
      "Cannot add draft modules to a course with 'coming-soon' status"
    )
  ) {
    toast.error(
      "Cannot add draft modules to a course with 'coming-soon' status. Please change the course status first."
    );
    return;
  }

  // Check publish pricing error first in raw message (before extraction)
  // This handles cases where the error might be wrapped
  const rawPublishMatch = rawMessage.match(publishPricingPattern);
  if (rawPublishMatch) {
    const [, moduleTotal, coursePrice] = rawPublishMatch;
    toast.error(
      `Cannot publish: module total ${moduleTotal.trim()} must be greater than or equal to the course price ${coursePrice.trim()}. Adjust prices and try again.`
    );
    return;
  }

  const readableMessage = extractReadableServerMessage(rawMessage);

  // Check for coming-soon status errors in extracted message as fallback
  if (readableMessage.includes("Cannot set course status to 'coming-soon'")) {
    toast.error(
      "Cannot set course status to 'coming-soon' when draft modules exist. Please delete all draft modules first."
    );
    return;
  }
  if (
    readableMessage.includes(
      "Cannot add draft modules to a course with 'coming-soon' status"
    )
  ) {
    toast.error(
      "Cannot add draft modules to a course with 'coming-soon' status. Please change the course status first."
    );
    return;
  }

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

  // Check for publish pricing error in readable message
  const publishPricingMatch = readableMessage.match(publishPricingPattern);
  if (publishPricingMatch) {
    const [, moduleTotal, coursePrice] = publishPricingMatch;
    toast.error(
      `Cannot publish: module total ${moduleTotal.trim()} must be greater than or equal to the course price ${coursePrice.trim()}. Adjust prices and try again.`
    );
    return;
  }

  // Fallback: check if the message contains the key phrase
  if (
    readableMessage.includes("Cannot publish: module total") ||
    rawMessage.includes("Cannot publish: module total")
  ) {
    // Try to extract numbers from the message
    const numbers =
      readableMessage.match(/(\d+(?:,\d+)*)\s*KES/g) ||
      rawMessage.match(/(\d+(?:,\d+)*)\s*KES/g);
    if (numbers && numbers.length >= 2) {
      toast.error(
        `Cannot publish: module total ${numbers[0]} must be greater than or equal to the course price ${numbers[1]}. Adjust prices and try again.`
      );
    } else {
      toast.error(
        "Cannot publish because the total module prices are below the course price. Adjust prices and try again."
      );
    }
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
