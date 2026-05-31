'use client';
import { usePathname } from 'next/navigation';
import AppShell from './AppShell';

const PUBLIC_PAGES = ['/', '/login', '/register', '/privacy', '/terms', '/about', '/faq', '/reset-password', '/prayer/submit'];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PAGES.some(p => pathname === p) || pathname.startsWith('/features/');
  
  if (isPublic) {
    return <>{children}</>;
  }
  
  return <AppShell>{children}</AppShell>;
}
