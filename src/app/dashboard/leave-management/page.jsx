import { PageTemplate } from "../components/page-template";

export const metadata = {
  title: "Leave Management | TrackPro",
  description: "Manage employee leave requests and schedules",
};

export default function LeaveManagementPage() {
  return (
    <PageTemplate
      title="Leave Management"
      description="Approve, track, and manage employee leaves, time-off requests, and absences."
      iconName="Calendar"
    />
  );
} 