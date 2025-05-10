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

// Email sending function (placeholder - needs actual email service integration)
export async function sendEmail({ to, subject, text, html }) {
  // Implementation depends on your email service provider
  // This is a placeholder for the actual implementation
  console.log(`Sending email to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Text: ${text}`);
  
  // In a real implementation, you would use a service like SendGrid, AWS SES, etc.
  // For example with Nodemailer:
  // await transporter.sendMail({ to, subject, text, html });
  
  return true;
}
