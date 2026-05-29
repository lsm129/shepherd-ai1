'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    // Check if user is logged in
    async function checkAuth() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return;
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsLoggedIn(true);
          // Load referral code
          const { data } = await supabase.from('referrals').select('referral_code').eq('referrer_id', session.user.id).single();
          if (data) {
            setReferralCode(data.referral_code);
          }
          // Count completed referrals
          const { count } = await supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', session.user.id).eq('status', 'completed');
          setReferralCount(count || 0);
        }
      } catch (e) {}
    }
    checkAuth();
  }, [pathname]);

  if (!mounted) return <>{children}</>;

  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';

  const referralLink = referralCode ? `${window.location.origin}?ref=${referralCode}` : '';

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  }

  return (
    <>
      {/* Top Navigation Bar */}
      {isLoggedIn && !isPublicPage && (
        <nav style={{
          background: 'white',
          borderBottom: '1px solid var(--border)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" fill="#1e3a5f"/>
                <path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/>
                <path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Referral Button in Nav */}
            <button
              onClick={() => setShowReferral(true)}
              style={{
                background: 'linear-gradient(135deg, #f5a623 0%, #f7c948 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              🎁 Refer & Earn
            </button>
          </div>
        </nav>
      )}

      {/* Page Content */}
      <div style={isLoggedIn && !isPublicPage ? { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' } : {}}>
        {children}
      </div>

      {/* Floating Referral Button (for logged-in users on dashboard pages) */}
      {isLoggedIn && !isPublicPage && !showReferral && (
        <button
          onClick={() => setShowReferral(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #f5a623 0%, #f7c948 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(245, 166, 35, 0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🎁
        </button>
      )}

      {/* Referral Modal */}
      {showReferral && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowReferral(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px',
              maxWidth: '480px',
              width: '90%',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎁</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#1e3a5f' }}>Refer a Friend</h2>
            <p style={{ color: '#666', marginBottom: '8px' }}>Share your link. When they sign up, you both get <strong>1 month free</strong>!</p>
            
            {referralCount > 0 && (
              <div style={{ background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#166534', fontSize: '14px' }}>
                ✅ You have {referralCount} successful referral{referralCount > 1 ? 's' : ''}!
              </div>
            )}

            {referralCode ? (
              <div style={{ marginTop: '20px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '14px', color: '#333', outline: 'none' }}
                  />
                  <button
                    onClick={handleCopy}
                    style={{
                      background: copied ? '#22c55e' : '#1e3a5f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#1877f2', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out ShepherdAI - AI-powered church management! ')}&url=${encodeURIComponent(referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#1da1f2', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}
                  >
                    Twitter/X
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent('Check out ShepherdAI')}&body=${encodeURIComponent('I\'ve been using ShepherdAI for church management and thought you might like it! Sign up with my link: ' + referralLink)}`}
                    style={{ background: '#1e3a5f', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}
                  >
                    Email
                  </a>
                </div>
              </div>
            ) : (
              <p style={{ color: '#666', marginTop: '16px', fontSize: '14px' }}>Your referral code is being generated. Please refresh the page.</p>
            )}

            <button
              onClick={() => setShowReferral(false)}
              style={{ marginTop: '24px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '14px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
