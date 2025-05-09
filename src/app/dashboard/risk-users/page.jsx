import { PageTemplate } from "../components/page-template";

export const metadata = {
  title: "Risk Users | TrackPro",
  description: "Monitor employees with risky behavior patterns",
};

export default function RiskUsersPage() {
  return (
    <PageTemplate
      title="Risk Users"
      description="Identify and monitor employees showing potentially risky behavior patterns."
      iconName="AlertTriangle"
    />
  );
} 