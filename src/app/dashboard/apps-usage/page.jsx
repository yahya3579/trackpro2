import { PageTemplate } from "../components/page-template";

export const metadata = {
  title: "Apps Usage | TrackPro",
  description: "Monitor employee application usage statistics",
};

export default function AppsUsagePage() {
  return (
    <PageTemplate
      title="Apps Usage"
      description="Track and analyze which applications and websites your employees use and for how long."
      iconName="AppWindow"
    />
  );
} 