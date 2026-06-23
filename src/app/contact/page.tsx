'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

export default function ContactPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-supabase-url') return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (e) {}
    }
    checkAuth();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', zIndex: 100 }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#1e3a5f"/><path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/><path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Home</a>
            <a href="/#pricing" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Pricing</a>
            <Link href={isLoggedIn ? '/dashboard' : '/register'} className="btn-primary" style={{ textDecoration: 'none', fontSize: '14px' }}>{isLoggedIn ? 'Dashboard' : 'Get Started'}</Link>
          </div>
        </div>
      </nav>

      <div className="page-container" style={{ paddingTop: '120px', paddingBottom: '80px', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>Contact Us</h1>
        <p style={{ color: '#999', marginBottom: '40px', fontSize: '14px' }}>We&apos;d love to hear from you</p>

        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '24px' }}>Get in Touch</h2>
          
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px' }}>Email Support</h3>
            <p style={{ color: '#555', lineHeight: '1.8' }}>
              For any questions, feedback, or support requests:<br/>
              <a href="mailto:support@shepherdaitech.com" style={{ color: '#2563eb', fontWeight: 'bold' }}>support@shepherdaitech.com</a>
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px' }}>Response Time</h3>
            <p style={{ color: '#555', lineHeight: '1.8' }}>We typically respond within 24-48 hours during business days.</p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px' }}>For Pastors &amp; Church Leaders</h3>
            <p style={{ color: '#555', lineHeight: '1.8' }}>
              Interested in our Founding Church Program? <Link href="/founding-church" style={{ color: '#2563eb', fontWeight: 'bold' }}>Apply here</Link> for 1 year of free Pro access.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px' }}>Business Inquiries</h3>
            <p style={{ color: '#555', lineHeight: '1.8' }}>
              For partnerships and business opportunities:<br/>
              <a href="mailto:business@shepherdaitech.com" style={{ color: '#2563eb', fontWeight: 'bold' }}>business@shepherdaitech.com</a>
            </p>
          </div>
        </div>
      </div>

      <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: '#999', fontSize: '14px' }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span>&copy; 2026 ShepherdAI. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/" style={{ color: '#999', textDecoration: 'none' }}>Home</a>
            <a href="/privacy" style={{ color: '#999', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/terms" style={{ color: '#999', textDecoration: 'none' }}>Terms of Service</a>
            <a href="/contact" style={{ color: '#999', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
