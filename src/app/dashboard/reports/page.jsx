import { BarChart3 } from "lucide-react";
import { PageTemplate } from "../components/page-template";

export const metadata = {
  title: "Reports | TrackPro",
  description: "Generate and view detailed employee activity reports",
};

export default function ReportsPage() {
  return (
    <PageTemplate
      title="Reports"
      description="Generate, customize, and export detailed reports on employee productivity, attendance, and activities."
      iconName="BarChart3"
    />
  );
} 