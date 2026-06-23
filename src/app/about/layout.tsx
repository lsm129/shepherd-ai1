import { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'About — ShepherdAI' },
  description: 'The story behind ShepherdAI — from a grandfather who served without counting to an AI platform serving churches across America. Heritage. Purpose. Service.',
  alternates: { canonical: 'https://www.shepherdaitech.com/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
