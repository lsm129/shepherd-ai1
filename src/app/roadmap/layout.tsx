import { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Product Roadmap — ShepherdAI' },
  description: 'Shape the future of ShepherdAI. Vote on features like donation tracking, attendance check-in, volunteer scheduling, and more. We build for pastors, not investors.',
  alternates: { canonical: 'https://www.shepherdaitech.com/roadmap' },
};

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
