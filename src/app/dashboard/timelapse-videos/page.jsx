import { PageTemplate } from "../components/page-template";

export const metadata = {
  title: "Timelapse Videos | TrackPro",
  description: "Generate and view timelapse videos of employee activity",
};

export default function TimelapseVideosPage() {
  return (
    <PageTemplate
      title="Timelapse Videos"
      description="Generate and view timelapse videos of employee screen activity throughout the day."
      iconName="Video"
    />
  );
} 