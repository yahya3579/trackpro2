import { PageTemplate } from "../components/page-template";

export const metadata = {
  title: "Billing | TrackPro",
  description: "Manage subscription and billing information",
};

export default function BillingPage() {
  return (
    <PageTemplate
      title="Billing"
      description="View and manage your subscription plan, billing history, and payment methods."
      iconName="CreditCard"
    />
  );
} 