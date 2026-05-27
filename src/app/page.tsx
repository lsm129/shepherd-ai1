'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [refParam, setRefParam] = useState('');

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setRefParam(ref);
  }, []);

  if (!mounted) return null;

  const registerHref = refParam ? `/register?ref=${refParam}` : '/register';

  const features = [
    { emoji: '📧', title: 'Visitor Follow-up', desc: 'AI-generated 6-week email sequences for new visitors' },
    { emoji: '📰', title: 'Weekly Newsletter', desc: 'Transform highlights into professional newsletters' },
    { emoji: '🙏', title: 'Prayer Requests', desc: 'Manage prayers with AI-crafted responses and verses' },
    { emoji: '📱', title: 'Sermon to Social', desc: 'Turn sermon notes into Facebook, Instagram & X posts' },
    { emoji: '📢', title: 'Church Announcements', desc: 'Generate formal announcements for any occasion' },
    { emoji: '📖', title: 'Daily Devotional', desc: 'Create devotionals with scripture and prayer' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)', zIndex: 100,
      }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#1e3a5f"/><path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/><path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <Link href="/login" className="btn-ghost">Log In</Link>
            <Link href={registerHref} className="btn-primary">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Referral Banner */}
      {refParam && (
        <div style={{ marginTop: '72px', background: 'linear-gradient(135deg, #f5a623, #f7c948)', color: 'white', textAlign: 'center', padding: '12px', fontWeight: '600', fontSize: '16px' }}>
          🎁 You were referred by a friend! Sign up and you BOTH get 1 month free!
        </div>
      )}

      {/* Hero */}
      <section style={{ paddingTop: refParam ? '120px' : '160px', paddingBottom: '120px', background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <div className="badge badge-primary" style={{ marginBottom: '24px', fontSize: '14px', padding: '8px 20px' }}>
            AI-Powered Church Management
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: 'bold', color: '#1e3a5f', lineHeight: '1.1', marginBottom: '24px', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
            Your AI Assistant for Growing Church Community
          </h1>
          <p style={{ fontSize: '20px', color: '#666', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '40px', lineHeight: '1.6' }}>
            Stop spending hours on visitor follow-up and newsletter writing. ShepherdAI handles the busywork so you can focus on what matters — shepherding your flock.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={registerHref} style={{ background: '#1e3a5f', color: 'white', padding: '16px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Today →
            </Link>
            <a href="#features" style={{ background: 'white', color: '#1e3a5f', padding: '16px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '18px', border: '2px solid #1e3a5f' }}>
              See How It Works
            </a>
          </div>
          <p style={{ marginTop: '20px', color: '#999', fontSize: '14px' }}>No credit card required • Free plan available forever</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '100px 0', background: 'white' }}>
        <div className="page-container">
          <h2 style={{ fontSize: '40px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#1e3a5f' }}>Everything You Need</h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '18px', marginBottom: '60px' }}>AI-powered tools designed specifically for church ministry</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{f.emoji}</div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#1e3a5f' }}>{f.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '100px 0', background: '#f8fafc' }}>
        <div className="page-container">
          <h2 style={{ fontSize: '40px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#1e3a5f' }}>Simple Pricing</h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '18px', marginBottom: '60px' }}>Start free, upgrade when you need more</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="pricing-card">
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Free</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>$0<span style={{ fontSize: '16px', color: '#666' }}>/mo</span></div>
              <p style={{ color: '#666', marginBottom: '24px' }}>For getting started</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '32px' }}>
                {['10 AI generations/month', 'Visitor follow-up', 'Weekly newsletter', 'Prayer requests'].map((item, i) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>✓ {item}</li>
                ))}
              </ul>
              <Link href={registerHref} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>Get Started</Link>
            </div>
            <div className="pricing-card featured">
              <div className="badge badge-primary" style={{ marginBottom: '16px' }}>Most Popular</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Pro</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>$19<span style={{ fontSize: '16px', color: '#666' }}>/mo</span></div>
              <p style={{ color: '#666', marginBottom: '24px' }}>For growing churches</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '32px' }}>
                {['Unlimited AI generations', 'All 6 AI tools', 'Email sending', 'Priority support', 'Referral program'].map((item, i) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>✓ {item}</li>
                ))}
              </ul>
              <Link href={registerHref} className="btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>Start Free Trial</Link>
            </div>
          </div>
          <p style={{ textAlign: 'center', marginTop: '32px', color: '#f5a623', fontSize: '16px', fontWeight: '600' }}>
            🎁 Refer a friend and you BOTH get 1 month Pro free!
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 0', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)', color: 'white', textAlign: 'center' }}>
        <div className="page-container">
          <h2 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '16px' }}>Ready to Transform Your Ministry?</h2>
          <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '40px' }}>Join hundreds of churches already using ShepherdAI</p>
          <Link href={registerHref} style={{ background: 'white', color: '#1e3a5f', padding: '16px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '18px' }}>
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: '#999', fontSize: '14px' }}>
        <p>&copy; 2026 ShepherdAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
