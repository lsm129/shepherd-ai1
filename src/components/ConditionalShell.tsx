'use client';
import { usePathname } from 'next/navigation';
import AppShell from './AppShell';
import AppShellErrorBoundary from './AppShellErrorBoundary';

const ALWAYS_PUBLIC_PAGES = ['/login', '/register', '/privacy', '/terms', '/about', '/faq', '/reset-password', '/blog'];

const PUBLIC_PATH_PREFIXES = ['/features/', '/blog/', '/tools', '/free-tools', '/free-resources', '/find-church', '/roadmap', '/contact', '/api'];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAlwaysPublic = ALWAYS_PUBLIC_PAGES.some(p => pathname === p)
    || pathname === '/features'
    || pathname === '/pricing'
    || pathname === '/roadmap'
    || pathname === '/contact'
    || PUBLIC_PATH_PREFIXES.some(p => pathname.startsWith(p));
  const isPartnerPage = pathname.startsWith('/partner/');

  if (pathname === '/' || isAlwaysPublic || isPartnerPage) {
    return <>{children}</>;
  }

  // AppShell OUTSIDE error boundary = nav always visible
  // ErrorBoundary INSIDE AppShell = only page content errors, nav survives
  return (
    <AppShell>
      <AppShellErrorBoundary>
        {children}
      </AppShellErrorBoundary>
    </AppShell>
  );
}
