import { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy — ShepherdAI' },
  description: 'How ShepherdAI collects, uses, and protects your church data. TLS/SSL encryption, AES-256 at rest, no data selling, no AI training on your content.',
  alternates: { canonical: 'https://www.shepherdaitech.com/privacy' },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
