'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userRole, setUserRole] = useState<'pastor' | 'congregant'>('pastor');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    
    async function checkAuth() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey || cancelled) return;
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
          const meta = session.user.user_metadata || {};
          const role = meta.role || 'pastor';
          setUserRole(role as 'pastor' | 'congregant');
        }
      } catch (e) {
        // Auth check failed silently
      }
    }
    checkAuth();
    return () => { cancelled = true; };
  }, []);

  if (!mounted) return <>{children}</>;

  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';

  const pastorNavItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/community', label: 'Community', icon: '🌍' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const congregantNavItems = [
    { href: '/member/dashboard', label: 'Home', icon: '🏠' },
    { href: '/member/dashboard#devotional', label: 'Devotional', icon: '📖' },
    { href: '/prayer/submit', label: 'Prayer', icon: '🙏' },
    { href: '/member/dashboard#announcements', label: 'Announcements', icon: '📢' },
    { href: '/community', label: 'Community', icon: '🌍' },
  ];

  const navItems = userRole === 'congregant' ? congregantNavItems : pastorNavItems;

  return (
    <>
      {isLoggedIn && !isPublicPage && (
        <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, height: '56px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" fill="#1e3a5f"/>
                <path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/>
                <path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
            </Link>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="desktop-nav">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} style={{ padding: '8px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: pathname === item.href ? '600' : '400', color: pathname === item.href ? '#1e3a5f' : '#666', background: pathname === item.href ? 'rgba(30,58,95,0.08)' : 'transparent', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {userRole === 'congregant' && (
              <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>🙋 Member</span>
            )}
            <button onClick={async () => {
              try {
                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
                await supabase.auth.signOut();
                window.location.href = '/';
              } catch(e) {}
            }} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#666' }}>
              Logout
            </button>
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', display: 'none' }} className="mobile-menu-btn">☰</button>
          </div>
        </nav>
      )}

      {showMobileMenu && isLoggedIn && !isPublicPage && (
        <div style={{ position: 'fixed', top: '56px', left: 0, right: 0, bottom: 0, background: 'white', zIndex: 99, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setShowMobileMenu(false)} style={{ padding: '12px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '16px', color: pathname === item.href ? '#1e3a5f' : '#666', background: pathname === item.href ? 'rgba(30,58,95,0.08)' : 'transparent', fontWeight: pathname === item.href ? '600' : '400' }}>
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
      )}

      <div style={isLoggedIn && !isPublicPage ? { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' } : {}}>
        {children}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}} />
    </>
  );
}
