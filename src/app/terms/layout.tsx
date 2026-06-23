import { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Terms of Service — ShepherdAI' },
  description: 'Terms and conditions for using ShepherdAI — the AI-powered church ministry platform.',
  alternates: { canonical: 'https://www.shepherdaitech.com/terms' },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
