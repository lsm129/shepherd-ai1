'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [refParam, setRefParam] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setRefParam(ref);
  }, []);

  if (!mounted) return null;

  const registerHref = refParam ? `/register?ref=${refParam}` : '/register';

  const agents = [
    { emoji: '📧', title: 'Visitor Follow-up', desc: 'AI-generated 6-week email sequences for new visitors', saves: '3 hrs/week' },
    { emoji: '📰', title: 'Weekly Newsletter', desc: 'Transform highlights into professional newsletters', saves: '2 hrs/week' },
    { emoji: '🙏', title: 'Prayer Requests', desc: 'Manage prayers with AI-crafted responses and verses', saves: '1.5 hrs/week' },
    { emoji: '📱', title: 'Sermon to Social', desc: 'Turn sermon notes into Facebook, Instagram & X posts', saves: '2 hrs/week' },
    { emoji: '📢', title: 'Church Announcements', desc: 'Generate formal announcements for any occasion', saves: '1 hr/week' },
    { emoji: '📖', title: 'Daily Devotional', desc: 'Create devotionals with scripture and prayer', saves: '1.5 hrs/week' },
  ];

  const churchLogos = [
    'Grace Community Church',
    'First Baptist',
    'Life Church',
    'Cornerstone Fellowship',
    'New Hope Community',
    'Faith United',
  ];

  const faqs = [
    {
      q: 'Will AI replace my pastor role?',
      a: 'Absolutely not. ShepherdAI is designed to handle administrative busywork \u2014 follow-up emails, newsletters, announcements \u2014 so pastors can spend more time on shepherding, counseling, and ministry. AI is a tool that serves your mission, not a replacement for the human heart of pastoral care.',
    },
    {
      q: 'Is my data safe?',
      a: 'Yes. We use enterprise-grade encryption (AES-256) for all data at rest and in transit. Your church data is never shared with third parties or used to train AI models. We are fully compliant with data privacy best practices, and you can delete your data at any time.',
    },
    {
      q: 'Do I need to replace my existing church software?',
      a: 'No! ShepherdAI works alongside your current tools. Whether you use Planning Center, Church Community Builder, or simple spreadsheets, ShepherdAI integrates smoothly. Think of it as an add-on assistant, not a replacement.',
    },
    {
      q: 'How quickly can I get started?',
      a: "Under 5 minutes. Sign up, enter your church name, and start generating content immediately. No complex setup, no training required. Our AI learns your church's voice from day one.",
    },
    {
      q: 'How much does it cost?',
      a: 'ShepherdAI offers a generous Free plan with 10 AI generations per month. The Pro plan is $49/mo for unlimited generations and all 6 AI tools. The Church plan is $99/mo for multi-campus support and priority assistance. No credit card required to start.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes, you can cancel your subscription at any time with no penalties or hidden fees. Your access continues through the end of your billing period, and you can always downgrade to the Free plan.',
    },
    {
      q: 'What about theological accuracy?',
      a: 'ShepherdAI is trained to reference scripture accurately and generate content that respects theological nuance. You always review and edit before anything is sent. Pastors remain in full control of the message \u2014 AI just does the heavy lifting of drafting.',
    },
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
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="#1e3a5f"/>
              <path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/>
              <path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="/faq" className="nav-link">FAQ</a>
            <Link href="/login" className="btn-ghost">Log In</Link>
            <Link href={registerHref} className="btn-primary" style={{ textDecoration: 'none' }}>Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Referral Banner */}
      {refParam && (
        <div style={{ marginTop: '72px', background: 'linear-gradient(135deg, #f5a623, #f7c948)', color: 'white', textAlign: 'center', padding: '12px', fontWeight: '600', fontSize: '16px' }}>
          🎁 You were referred by a friend! Sign up and you BOTH get 1 month free!
        </div>
      )}

      {/* Hero Section */}
      <section style={{ paddingTop: refParam ? '140px' : '160px', paddingBottom: '100px', background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)' }}>
        <div className="page-container fade-in" style={{ textAlign: 'center' }}>
          <div className="badge badge-primary" style={{ marginBottom: '24px', fontSize: '14px', padding: '8px 20px' }}>
            AI-Powered Church Management
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 'bold', color: '#1e3a5f', lineHeight: '1.1', marginBottom: '24px', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
            Save 15 hours/week with AI that handles your church busywork
          </h1>

          <p style={{ fontSize: '20px', color: '#666', maxWidth: '650px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '16px', lineHeight: '1.6' }}>
            Automate visitor follow-ups, newsletters, devotionals, and more — so you can focus on shepherding your flock.
          </p>

          {/* Time savings stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e3a5f' }}>15 hrs</div>
              <div style={{ fontSize: '14px', color: '#666' }}>saved per week</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e3a5f' }}>6</div>
              <div style={{ fontSize: '14px', color: '#666' }}>AI agents</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e3a5f' }}>$19,500</div>
              <div style={{ fontSize: '14px', color: '#666' }}>annual value</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={registerHref} className="btn-primary" style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '8px', textDecoration: 'none' }}>
              Start Free — No credit card required →
            </Link>
            <a href="#how-it-works" style={{ background: 'white', color: '#1e3a5f', padding: '16px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '18px', border: '2px solid #1e3a5f', transition: 'all 0.2s' }}>
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ padding: '60px 0', background: 'white', borderTop: '1px solid var(--border)' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <p style={{ color: '#999', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '32px' }}>
            Trusted by pastors at churches of all sizes
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', alignItems: 'center' }}>
            {churchLogos.map((name, i) => (
              <span key={i} style={{ fontSize: '16px', fontWeight: '700', color: '#cbd5e1', letterSpacing: '0.5px' }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agent Showcase */}
      <section id="features" style={{ padding: '100px 0', background: '#f8fafc' }}>
        <div className="page-container">
          <h2 style={{ fontSize: '40px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#1e3a5f' }}>
            Your AI Church Assistants
          </h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '18px', marginBottom: '60px' }}>
            Each agent is purpose-built for church ministry — and tells you exactly how much time you save
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {agents.map((agent, i) => (
              <div key={i} className="card" style={{ textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '40px' }}>{agent.emoji}</span>
                  <span className="badge badge-success" style={{ fontSize: '13px', padding: '6px 14px', fontWeight: '700' }}>
                    Saves {agent.saves}
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#1e3a5f' }}>{agent.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.6', fontSize: '15px' }}>{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '100px 0', background: 'white' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '16px', color: '#1e3a5f' }}>
            How It Works
          </h2>
          <p style={{ color: '#666', fontSize: '18px', marginBottom: '60px' }}>
            Three simple steps to reclaim your week
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', maxWidth: '900px', margin: '0 auto' }}>
            {[
              { step: '1', icon: '✏️', title: 'Enter Info', desc: 'Input your visitor details, sermon notes, or announcement content' },
              { step: '2', icon: '🤖', title: 'AI Generates', desc: 'ShepherdAI creates polished, on-brand content in seconds' },
              { step: '3', icon: '✅', title: 'Review & Send', desc: "Review, tweak if needed, then send — you're always in control" },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', fontSize: '36px', boxShadow: '0 4px 20px rgba(30,58,95,0.2)',
                }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Step {item.step}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: '#1e3a5f' }}>{item.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '100px 0', background: '#f8fafc' }}>
        <div className="page-container">
          <h2 style={{ fontSize: '40px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#1e3a5f' }}>
            Simple Pricing
          </h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '18px', marginBottom: '60px' }}>
            Start free, upgrade when you need more
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Free */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Free</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
                $0<span style={{ fontSize: '16px', color: '#666' }}>/mo</span>
              </div>
              <p style={{ color: '#666', marginBottom: '24px' }}>For getting started</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '32px' }}>
                {['10 AI generations/month', 'Visitor follow-up', 'Weekly newsletter', 'Prayer requests'].map((item, i) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>✓ {item}</li>
                ))}
              </ul>
              <Link href={registerHref} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>Get Started</Link>
            </div>

            {/* Pro */}
            <div className="pricing-card featured">
              <div className="badge badge-primary" style={{ marginBottom: '16px' }}>Most Popular</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Pro</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
                $49<span style={{ fontSize: '16px', color: '#666' }}>/mo</span>
              </div>
              <p style={{ color: '#666', marginBottom: '24px' }}>For growing churches</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '32px' }}>
                {['Unlimited AI generations', 'All 6 AI tools', 'Email sending', 'Priority support', 'Referral program', 'Custom AI tone'].map((item, i) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>✓ {item}</li>
                ))}
              </ul>
              <Link href={registerHref} className="btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>Start Free Trial</Link>
            </div>

            {/* Church */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Church</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
                $99<span style={{ fontSize: '16px', color: '#666' }}>/mo</span>
              </div>
              <p style={{ color: '#666', marginBottom: '24px' }}>For multi-campus ministries</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '32px' }}>
                {['Everything in Pro', 'Multi-campus support', 'Team accounts (5 users)', 'Dedicated onboarding', 'API access', 'Custom integrations'].map((item, i) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>✓ {item}</li>
                ))}
              </ul>
              <Link href={registerHref} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>Contact Us</Link>
            </div>
          </div>

          {/* ROI Calculator */}
          <div style={{ background: 'white', borderRadius: '16px', border: '2px solid var(--accent)', padding: '32px', maxWidth: '600px', margin: '40px auto 0', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#1e3a5f' }}>ROI Calculator</h3>
            <p style={{ color: '#666', marginBottom: '16px', fontSize: '15px' }}>
              If your time is worth $25/hour:
            </p>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e', marginBottom: '4px' }}>
              15 hrs/week × $25/hr = $19,500/year
            </div>
            <p style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>
              ShepherdAI pays for itself in the first week
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: '32px', color: '#f5a623', fontSize: '16px', fontWeight: '600' }}>
            🎁 Refer a friend and you BOTH get 1 month Pro free!
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '100px 0', background: 'white' }}>
        <div className="page-container" style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#1e3a5f' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '18px', marginBottom: '48px' }}>
            Common concerns, honest answers
          </p>

          <div style={{ display: 'grid', gap: '16px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', padding: '20px 24px', background: openFaq === i ? '#f8fafc' : 'white',
                    border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', textAlign: 'left', fontSize: '16px', fontWeight: '600', color: '#1e3a5f',
                    transition: 'all 0.2s',
                  }}
                >
                  {faq.q}
                  <span style={{ fontSize: '20px', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', flexShrink: 0, marginLeft: '16px' }}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 24px 20px', color: '#666', lineHeight: '1.7', fontSize: '15px' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <a href="/faq" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
              View all FAQ →
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 0', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)', color: 'white', textAlign: 'center' }}>
        <div className="page-container">
          <h2 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '16px' }}>
            Ready to Reclaim 15 Hours This Week?
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '40px' }}>
            Join pastors who focus on ministry, not busywork
          </p>
          <Link href={registerHref} style={{ background: 'white', color: '#1e3a5f', padding: '16px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '18px' }}>
            Start Free — No credit card required →
          </Link>
          <p style={{ marginTop: '16px', opacity: 0.7, fontSize: '14px' }}>Free plan available forever • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: '#999', fontSize: '14px' }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span>© 2026 ShepherdAI. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/faq" style={{ color: '#999', textDecoration: 'none' }}>FAQ</a>
            <a href="#pricing" style={{ color: '#999', textDecoration: 'none' }}>Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
