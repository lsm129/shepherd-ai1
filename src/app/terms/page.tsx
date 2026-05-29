'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
export default function TermsOfService() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-url') return;
        const supabase = createClient(supabaseUrl, supabaseKey);
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
          <a href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Home</a>
          <a href="/#pricing" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Pricing</a>
          <Link href={isLoggedIn ? '/dashboard' : '/register'} className="btn-primary" style={{ textDecoration: 'none', fontSize: '14px' }}>{isLoggedIn ? 'Dashboard' : 'Get Started'}</Link>
        </div>
      </nav>
      <div className="page-container" style={{ paddingTop: '120px', paddingBottom: '80px', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>Terms of Service</h1>
        <p style={{ color: '#999', marginBottom: '40px', fontSize: '14px' }}>Last updated: May 29, 2026</p>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>1. Acceptance of Terms</h2>
        <p style={{ color: '#555', lineHeight: '1.8' }}>By accessing or using ShepherdAI, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>2. Description of Service</h2>
        <p style={{ color: '#555', lineHeight: '1.8' }}>ShepherdAI is an AI-powered church management platform that helps pastors and ministry leaders generate content including visitor follow-up emails, newsletters, prayer responses, social media posts, announcements, and devotionals.</p>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>3. Account Registration</h2>
        <p style={{ color: '#555', lineHeight: '1.8' }}>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You must be at least 18 years old to use this service.</p>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>4. Subscription and Payments</h2>
        <ul style={{ color: '#555', lineHeight: '2', paddingLeft: '24px' }}>
          <li>Free plan includes 10 AI generations per month</li>
          <li>Paid plans are billed monthly or annually as selected</li>
          <li>Payments are processed securely through Creem (Merchant of Record)</li>
          <li>You may cancel your subscription at any time</li>
          <li>Refund requests must be submitted within 7 days of purchase</li>
        </ul>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>5. AI-Generated Content</h2>
        <ul style={{ color: '#555', lineHeight: '2', paddingLeft: '24px' }}>
          <li>AI-generated content is provided as a draft for your review</li>
          <li>You are responsible for reviewing and approving all content before distribution</li>
          <li>We do not guarantee theological accuracy — pastors maintain full editorial control</li>
          <li>You retain ownership of your input data and generated content</li>
        </ul>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>6. Acceptable Use</h2>
        <p style={{ color: '#555', lineHeight: '1.8', marginBottom: '12px' }}>You agree not to:</p>
        <ul style={{ color: '#555', lineHeight: '2', paddingLeft: '24px' }}>
          <li>Use the service for illegal or harmful purposes</li>
          <li>Generate content that promotes hate, violence, or discrimination</li>
          <li>Attempt to bypass usage limits or security measures</li>
          <li>Share your account with unauthorized users</li>
          <li>Reverse engineer or copy our platform</li>
        </ul>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>7. Intellectual Property</h2>
        <p style={{ color: '#555', lineHeight: '1.8' }}>The ShepherdAI platform, including its design, code, and branding, is our intellectual property. Content you generate using the service belongs to you.</p>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>8. Limitation of Liability</h2>
        <p style={{ color: '#555', lineHeight: '1.8' }}>ShepherdAI is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service, including but not limited to the accuracy of AI-generated content.</p>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>9. Termination</h2>
        <p style={{ color: '#555', lineHeight: '1.8' }}>We may suspend or terminate your account for violations of these terms. You may delete your account at any time. Upon termination, your right to use the service ceases immediately.</p>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>10. Changes to Terms</h2>
        <p style={{ color: '#555', lineHeight: '1.8' }}>We may update these terms from time to time. Material changes will be notified via email. Continued use after changes constitutes acceptance.</p>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>11. Contact</h2>
        <p style={{ color: '#555', lineHeight: '1.8' }}>Questions? Contact us at: <strong>yunjia_ai@outlook.com</strong></p>
      </div>
      <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: '#999', fontSize: '14px' }}>© 2026 ShepherdAI. All rights reserved.</footer>
    </div>
  );
}
