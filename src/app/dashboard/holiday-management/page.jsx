import { PageTemplate } from "../components/page-template";

export const metadata = {
  title: "Holiday Management | TrackPro",
  description: "Configure company holidays and time-off policies",
};

export default function HolidayManagementPage() {
  return (
    <PageTemplate
      title="Holiday Management"
      description="Set up and manage company holidays, time-off policies, and special leave days."
      iconName="Briefcase"
    />
  );
} 