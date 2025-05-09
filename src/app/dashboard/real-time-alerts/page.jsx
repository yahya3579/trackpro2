import { PageTemplate } from "../components/page-template";

export const metadata = {
  title: "Real-Time Alerts | TrackPro",
  description: "Configure and manage real-time activity alerts",
};

export default function RealTimeAlertsPage() {
  return (
    <PageTemplate
      title="Real-Time Alerts"
      description="Configure and receive instant alerts for specific employee activities or policy violations."
      iconName="Bell"
    />
  );
} 