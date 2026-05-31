'use client';
import { usePathname } from 'next/navigation';
import AppShell from './AppShell';

const ALWAYS_PUBLIC_PAGES = ['/login', '/register', '/privacy', '/terms', '/about', '/faq', '/reset-password', '/prayer/submit'];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAlwaysPublic = ALWAYS_PUBLIC_PAGES.some(p => pathname === p) || pathname.startsWith('/features/');

  // Home page "/" always uses its own nav (adaptive to login state)
  if (pathname === '/' || isAlwaysPublic) {
    return <>{children}</>;
  }

  // All other pages get AppShell nav
  return <AppShell>{children}</AppShell>;
}
