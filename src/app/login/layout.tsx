import { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Log In — ShepherdAI' },
  description: 'Sign in to your ShepherdAI account to manage your church ministry, generate sermons, send visitor follow-ups, and more.',
  alternates: { canonical: 'https://www.shepherdaitech.com/login' },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
