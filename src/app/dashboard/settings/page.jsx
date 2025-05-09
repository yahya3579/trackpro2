import { PageTemplate } from "../components/page-template";

export const metadata = {
  title: "Settings | TrackPro",
  description: "Configure system settings and preferences",
};

export default function SettingsPage() {
  return (
    <PageTemplate
      title="Settings"
      description="Customize system preferences, notification settings, and monitoring configurations."
      iconName="Settings"
    />
  );
} 