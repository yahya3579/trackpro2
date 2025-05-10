import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date in a human-readable format
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
