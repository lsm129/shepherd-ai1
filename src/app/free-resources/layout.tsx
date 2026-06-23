import { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Free Church Resources & Tools — ShepherdAI' },
  description: 'Free AI-powered church tools — budget template, visitor follow-up checklist, bulletin template, sermon prep, and announcement generator. No sign-up required.',
  alternates: { canonical: 'https://www.shepherdaitech.com/free-resources' },
};

export default function FreeResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
