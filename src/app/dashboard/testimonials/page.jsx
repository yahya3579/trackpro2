import { PageTemplate } from "../components/page-template";

export const metadata = {
  title: "Testimonials | TrackPro",
  description: "View and manage customer testimonials",
};

export default function TestimonialsPage() {
  return (
    <PageTemplate
      title="Testimonials"
      description="View, add, and manage testimonials and success stories from your organization."
      iconName="MessageCircle"
    />
  );
} 