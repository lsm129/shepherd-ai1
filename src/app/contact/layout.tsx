import { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Contact Us — ShepherdAI' },
  description: 'Get in touch with the ShepherdAI team. Email support, founding church program inquiries, and business partnerships.',
  alternates: { canonical: 'https://www.shepherdaitech.com/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
