import { PageTemplate } from "../components/page-template";

export const metadata = {
  title: "Timeline | TrackPro",
  description: "View chronological employee activity timeline",
};

export default function TimelinePage() {
  return (
    <PageTemplate
      title="Timeline"
      description="View a chronological timeline of employee activities and events."
      iconName="History"
    />
  );
} 