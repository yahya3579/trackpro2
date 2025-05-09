import { PageTemplate } from "../components/page-template";

export const metadata = {
  title: "Screenshots | TrackPro",
  description: "View employee activity screenshots",
};

export default function ScreenshotsPage() {
  return (
    <PageTemplate
      title="Screenshots"
      description="View periodic screenshots of employee monitors to ensure productivity and compliance."
      iconName="Camera"
    />
  );
} 