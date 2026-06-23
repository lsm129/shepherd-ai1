import { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'FAQ — ShepherdAI' },
  description: 'Common questions about ShepherdAI — AI replacing pastors? Data safety? Theological accuracy? Pricing? Get honest answers to your concerns.',
  alternates: { canonical: 'https://www.shepherdaitech.com/faq' },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
