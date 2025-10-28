import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Feedback - Image Optimizer',
  description: 'Request features, report bugs, and help shape the future of Image Optimizer. View open issues and vote on what matters most.',
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
