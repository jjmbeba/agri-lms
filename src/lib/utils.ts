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

export function displayToastError(error: Error) {
  if (error.message.includes("Unauthenticated")) {
    toast.error("Not authenticated");
    return;
  }
  if (error.message.includes("Unauthorized")) {
    toast.error("You are not authorized to perform this action.");
    return;
  }

  toast.error(error.message);
}
