import { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Create Your Free Account — ShepherdAI' },
  description: 'Sign up for ShepherdAI in 30 seconds. Create your free church account — no credit card required. AI-powered visitor follow-up, sermon prep, prayer management, and more.',
  alternates: { canonical: 'https://www.shepherdaitech.com/register' },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
