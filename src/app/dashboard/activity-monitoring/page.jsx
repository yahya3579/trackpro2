import { PageTemplate } from "../components/page-template";

export const metadata = {
  title: "Activity Monitoring | TrackPro",
  description: "Monitor employee activities in real-time",
};

export default function ActivityMonitoringPage() {
  return (
    <PageTemplate
      title="Activity Monitoring"
      description="Track employee activities, applications usage, and productivity in real-time."
      iconName="Activity"
    />
  );
} 