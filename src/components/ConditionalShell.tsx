'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AppShell from './AppShell';

const ALWAYS_PUBLIC_PAGES = ['/login', '/register', '/privacy', '/terms', '/about', '/faq', '/reset-password', '/prayer/submit'];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function checkAuth() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return;
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (e) {}
    }
    checkAuth();
  }, [pathname]);

  if (!mounted) return <>{children}</>;

  const isAlwaysPublic = ALWAYS_PUBLIC_PAGES.some(p => pathname === p) || pathname.startsWith('/features/');

  // Home page "/" — show AppShell if logged in (consistent nav bar)
  if (pathname === '/') {
    if (isLoggedIn) {
      return <AppShell>{children}</AppShell>;
    }
    return <>{children}</>;
  }

  if (isAlwaysPublic) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
