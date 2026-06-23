'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function BlogNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch {}
    };
    checkAuth();

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/#features', label: 'Features' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog', active: true },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid #f1f5f9',
      zIndex: 100,
      transition: 'all 0.2s'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" fill="#1e3a5f"/>
            <path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8ZM16 12C17.105 12 18 12.895 18 14C18 15.105 17.105 16 16 16C14.895 16 14 15.105 14 14C14 12.895 14.895 12 16 12Z" fill="white"/>
            <path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
        </Link>

        {/* Desktop nav links */}
        <div className="blog-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: '15px',
                color: link.active ? '#1e3a5f' : '#475569',
                textDecoration: 'none',
                fontWeight: link.active ? 700 : 500,
                whiteSpace: 'nowrap',
              }}
            >
              {link.label}
            </Link>
          ))}
          <LanguageSwitcher />
          {isLoggedIn ? (
            <Link href="/dashboard" style={{
              background: '#1e3a5f',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}>Dashboard</Link>
          ) : (
            <Link href="/register" style={{
              background: '#1e3a5f',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}>Get Started Free</Link>
          )}
          {/* Mobile hamburger */}
          <button
            className="blog-nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'none',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4 7H24M4 14H24M4 21H24" stroke="#1e3a5f" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'white',
          zIndex: 99,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: '14px 16px',
                borderRadius: '8px',
                color: link.active ? '#1e3a5f' : '#475569',
                fontWeight: link.active ? 700 : 500,
                fontSize: '16px',
                textDecoration: 'none',
                background: link.active ? 'rgba(30,58,95,0.08)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ padding: '14px 16px' }}>
            <LanguageSwitcher />
          </div>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: '14px 16px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                textDecoration: 'none',
                background: '#1e3a5f',
                textAlign: 'center',
                marginTop: '8px',
              }}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: '14px 16px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                textDecoration: 'none',
                background: '#1e3a5f',
                textAlign: 'center',
                marginTop: '8px',
              }}
            >
              Get Started Free
            </Link>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .blog-nav-desktop > a,
          .blog-nav-desktop > a[style] {
            display: none !important;
          }
          .blog-nav-mobile-toggle {
            display: flex !important;
          }
        }
      `}} />
    </nav>
  );
}
