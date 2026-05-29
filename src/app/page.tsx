'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [refParam, setRefParam] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setRefParam(ref);

    // Check login status
    (async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey && supabaseUrl !== 'your-supabase-url') {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      }
    })();
  }, []);

  if (!mounted) return null;

  const ctaHref = isLoggedIn ? '/dashboard' : (refParam ? `/register?ref=${refParam}` : '/register');

  const agents = [
    { emoji: '📧', title: 'Visitor Follow-up', desc: 'AI-generated 6-week email sequences for new visitors', saves: '3 hrs/week', slug: 'visitor-followup' },
    { emoji: '📰', title: 'Weekly Newsletter', desc: 'Transform highlights into professional newsletters', saves: '2 hrs/week', slug: 'weekly-newsletter' },
    { emoji: '🙏', title: 'Prayer Requests', desc: 'Manage prayers with AI-crafted responses and verses', saves: '1.5 hrs/week', slug: 'prayer-requests' },
    { emoji: '📱', title: 'Sermon to Social', desc: 'Turn sermon notes into Facebook, Instagram & X posts', saves: '2 hrs/week', slug: 'sermon-social' },
    { emoji: '📢', title: 'Church Announcements', desc: 'Generate formal announcements for any occasion', saves: '1 hr/week', slug: 'church-announcement' },
    { emoji: '📖', title: 'Daily Devotional', desc: 'Create devotionals with scripture and prayer', saves: '1.5 hrs/week', slug: 'daily-devotional' },
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
      a: 'ShepherdAI offers a generous Free plan with 10 AI generations per month. Starter is $29/mo for 50 generations and 3 core tools. Pro is $49/mo for 200 generations and all 7 AI tools. Growth is $99/mo for unlimited generations, multi-campus support, and priority assistance. No credit card required to start.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes, you can cancel your subscription at any time with no penalties or hidden fees. Your access continues through the end of your billing period, and you can always downgrade to the Free plan.',
    },
    {
      q: 'What about theological accuracy?',
      a: 'ShepherdAI is trained to reference scripture accurately and generate content that respects theological nuance. You always review and edit before anything is sent. Pastors remain in full control of the message \u2014 AI just does the heavy lifting of drafting.',
    },
    {
      q: 'What denominations does ShepherdAI support?',
      a: "All of them! Whether you're Baptist, Methodist, Pentecostal, non-denominational, or any other tradition, ShepherdAI adapts to your theological emphasis. You always review and edit content before it goes out.",
    },
    {
      q: 'Can multiple staff members use one account?',
      a: 'The Growth plan ($99/mo) supports up to 5 team members with individual logins. Starter and Pro plans are designed for solo pastors or single-user access.',
    },
    {
      q: 'What if the AI generates something I disagree with?',
      a: "You're always in control. Every piece of content is a draft until you approve it. If something doesn't feel right, simply edit it or regenerate with different guidance.",
    },
    {
      q: 'Do I need to be tech-savvy to use ShepherdAI?',
      a: "Not at all. If you can send an email, you can use ShepherdAI. Our interface is designed for pastors, not programmers. Most users generate their first content within 5 minutes of signing up.",
    },
    {
      q: 'How is ShepherdAI different from Planning Center or Church Community Builder?',
      a: 'Those tools focus on church administration (scheduling, attendance, giving). ShepherdAI focuses on content creation \u2014 generating emails, newsletters, social posts, and devotionals. Think of us as a complement, not a competitor.',
    },
  ];

  async function handleSubscribe(planId: string) {
    // If not logged in, redirect to register first
    if (!isLoggedIn) {
      window.location.href = `/register?plan=${planId}`;
      return;
    }
    setCheckoutLoading(planId);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-url') {
        alert('Configuration error. Please contact support.');
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        window.location.href = `/register?plan=${planId}`;
        return;
      }

      const response = await fetch('/api/creem/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userId: session.user.id,
          userEmail: session.user.email,
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || 'Failed to create checkout session. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)', zIndex: 100,
      }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="#1e3a5f"/>
              <path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/>
              <path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
          </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="/faq" className="nav-link">FAQ</a>
            <a href="/about" className="nav-link">Our Story</a>
            <Link href={isLoggedIn ? "/dashboard" : "/login"} className="btn-ghost">{isLoggedIn ? "Dashboard" : "Log In"}</Link>
            <Link href={ctaHref} className="btn-primary" style={{ textDecoration: 'none' }}>{isLoggedIn ? "Go to Dashboard" : "Get Started Free"}</Link>
          </div>
      </nav>

      {/* Referral Banner */}
      {refParam && (
        <div style={{ marginTop: '72px', background: 'linear-gradient(135deg, #f5a623, #f7c948)', color: 'white', textAlign: 'center', padding: '12px', fontWeight: '600', fontSize: '15px' }}>
          🎁 You were referred! Sign up and you both get 2,000 bonus points
        </div>
      )}

      {/* Hero */}
      <section style={{
        paddingTop: refParam ? '140px' : '72px',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)',
        color: 'white', textAlign: 'center', padding: '140px 0 100px',
      }}>
        <div className="page-container">
          <div style={{ fontSize: '56px', marginBottom: '24px' }}>⛪🤖</div>
          <h1 style={{ fontSize: '52px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.1' }}>
            Your AI-Powered<br/>Church Staff
          </h1>
          <p style={{ fontSize: '22px', opacity: 0.9, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Save 15+ hours/week on follow-ups, newsletters, prayer responses, social media, and devotionals.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={ctaHref} className="btn-primary" style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '8px', textDecoration: 'none' }}>
              {isLoggedIn ? "Go to Dashboard \u2192" : "Start Free \u2014 No credit card required \u2192"}
            </Link>
            <a href="#pricing" className="btn-ghost" style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '8px' }}>
              View Pricing
            </a>
          </div>

          {/* Trusted by */}
          <div style={{ marginTop: '80px' }}>
            <p style={{ color: '#999', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>
              Trusted by churches across the country
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', opacity: 0.5 }}>
              {churchLogos.map((name, i) => (
                <span key={i} style={{ fontSize: '14px', fontWeight: '600', color: '#999' }}>{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '100px 0', background: '#f8fafc' }}>
        <div className="page-container">
          <h2 style={{ fontSize: '40px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#1e3a5f' }}>
            Your AI Church Staff
          </h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '18px', marginBottom: '60px' }}>
            6 AI-powered agents that handle your weekly busywork
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {agents.map((agent, i) => (
              <Link key={i} href={`/features/${agent.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '24px', cursor: 'pointer' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{agent.emoji}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1e3a5f' }}>{agent.title}</h3>
                  <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}>{agent.desc}</p>
                  <span className="badge badge-primary" style={{ fontSize: '12px' }}>Saves {agent.saves}</span>
                </div>
              </Link>
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
            Five simple steps to reclaim your week
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            {[
              { step: '1', icon: '\u270f\ufe0f', title: 'Sign Up Free', desc: 'No credit card required. Create your account in under 2 minutes.' },
              { step: '2', icon: '\u26ea', title: 'Set Your Church Profile', desc: 'Enter your church name, denomination, and preferred communication style.' },
              { step: '3', icon: '\ud83e\udd16', title: 'Choose Your AI Tool', desc: 'Pick from 6 AI-powered tools: visitor follow-up, newsletter, prayer responses, social media, announcements, or devotionals.' },
              { step: '4', icon: '\u2728', title: 'AI Generates Content', desc: "ShepherdAI creates polished, on-brand content in seconds \u2014 tailored to your church's voice." },
              { step: '5', icon: '\u2705', title: 'Review & Share', desc: 'You always have the final say. Review, tweak, and send with confidence.' },
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
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#1e3a5f' }}>{item.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.6', fontSize: '15px' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose ShepherdAI */}
      <section style={{ padding: '100px 0', background: 'white' }}>
        <div className="page-container">
          <h2 style={{ fontSize: '40px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#1e3a5f' }}>
            Why Choose ShepherdAI?
          </h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '18px', marginBottom: '60px' }}>
            Built with purpose. Driven by conviction.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            {[
              { emoji: '\u23f0', title: 'Save 10+ Hours Per Week', desc: "AI handles your admin work so you can focus on shepherding souls." },
              { emoji: '\ud83d\ude4f', title: '7 Powerful AI Tools', desc: "From visitor follow-up to daily devotionals \u2014 everything a pastor needs." },
              { emoji: '\ud83c\udfaf', title: 'Smart & Simple', desc: "No bloated features. No steep learning curve. Just tools that work." },
              { emoji: '\ud83d\udcb0', title: 'Fair, Transparent Pricing', desc: "No hidden fees. No per-member charges. Plans start at $29/month." },
              { emoji: '\ud83d\udd12', title: 'Your Data Stays Yours', desc: "Encrypted, private, and never shared. We don\u2019t monetize your data." },
              { emoji: '\ud83e\udd1d', title: 'Built for Pastors, Not Corporations', desc: "Designed by people who respect your calling and your time." },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#f8fafc', borderRadius: '16px', padding: '28px',
                border: '1px solid var(--border)', transition: 'all 0.3s ease',
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(30,58,95,0.12)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '28px' }}>{item.emoji}</span>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a5f', margin: 0 }}>{item.title}</h3>
                </div>
                <p style={{ color: '#555', lineHeight: '1.7', fontSize: '15px', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/about" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none', fontSize: '17px' }}>
              Learn More About Us \u2192
            </Link>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Free */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Free</h3>
              <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
                $0<span style={{ fontSize: '14px', color: '#666' }}>/mo</span>
              </div>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>For trying it out</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '28px' }}>
                {['10 AI generations/month', 'Visitor follow-up', 'Weekly newsletter', 'Prayer requests'].map((item, i) => (
                  <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>\u2713 {item}</li>
                ))}
              </ul>
              <Link href={ctaHref} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', fontSize: '14px' }}>{isLoggedIn ? "Go to Dashboard" : "Get Started"}</Link>
            </div>

            {/* Starter */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Starter</h3>
              <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
                $29<span style={{ fontSize: '14px', color: '#666' }}>/mo</span>
              </div>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>Small churches (&lt;50 members)</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '28px' }}>
                {['50 AI generations/month', '3 core AI tools', 'Email sending', 'Custom AI tone'].map((item, i) => (
                  <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>\u2713 {item}</li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe('starter')}
                disabled={checkoutLoading === 'starter'}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '14px', cursor: checkoutLoading === 'starter' ? 'wait' : 'pointer' }}
              >
                {checkoutLoading === 'starter' ? 'Redirecting...' : 'Subscribe'}
              </button>
            </div>

            {/* Pro - Most Popular */}
            <div className="pricing-card featured">
              <div className="badge badge-primary" style={{ marginBottom: '12px' }}>Most Popular</div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Pro</h3>
              <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
                $49<span style={{ fontSize: '14px', color: '#666' }}>/mo</span>
              </div>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>Growing churches (50-200)</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '28px' }}>
                {['200 AI generations/month', 'All 7 AI tools', 'Email sending', 'Priority support', 'Referral program', 'Custom AI tone'].map((item, i) => (
                  <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>\u2713 {item}</li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe('pro')}
                disabled={checkoutLoading === 'pro'}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '14px', cursor: checkoutLoading === 'pro' ? 'wait' : 'pointer' }}
              >
                {checkoutLoading === 'pro' ? 'Redirecting...' : 'Subscribe'}
              </button>
            </div>

            {/* Growth */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Growth</h3>
              <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
                $99<span style={{ fontSize: '14px', color: '#666' }}>/mo</span>
              </div>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>Large churches (200+)</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '28px' }}>
                {['Unlimited AI generations', 'Everything in Pro', 'Multi-campus support', 'Team accounts (5 users)', 'Dedicated onboarding', 'API access', 'Custom integrations'].map((item, i) => (
                  <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>\u2713 {item}</li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe('growth')}
                disabled={checkoutLoading === 'growth'}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '14px', cursor: checkoutLoading === 'growth' ? 'wait' : 'pointer' }}
              >
                {checkoutLoading === 'growth' ? 'Redirecting...' : 'Subscribe'}
              </button>
            </div>
          </div>

          {/* ROI Calculator */}
          <div style={{ background: 'white', borderRadius: '16px', border: '2px solid var(--accent)', padding: '32px', maxWidth: '600px', margin: '40px auto 0', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>\ud83d\udcb0</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#1e3a5f' }}>ROI Calculator</h3>
            <p style={{ color: '#666', marginBottom: '16px', fontSize: '15px' }}>
              If your time is worth $25/hour:
            </p>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e', marginBottom: '4px' }}>
              15 hrs/week \u00d7 $25/hr = $19,500/year
            </div>
            <p style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>
              ShepherdAI pays for itself in the first week
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: '32px', color: '#f5a623', fontSize: '16px', fontWeight: '600' }}>
            \ud83c\udf81 Refer a friend and you BOTH get 2,000 bonus points!
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
              View all FAQ \u2192
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
          <Link href={ctaHref} style={{ background: 'white', color: '#1e3a5f', padding: '16px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '18px' }}>
            {isLoggedIn ? "Go to Dashboard \u2192" : "Start Free \u2014 No credit card required \u2192"}
          </Link>
          <p style={{ marginTop: '16px', opacity: 0.7, fontSize: '14px' }}>Free plan available forever \u2022 Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: '#999', fontSize: '14px' }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span>\u00a9 2026 ShepherdAI. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/faq" style={{ color: '#999', textDecoration: 'none' }}>FAQ</a>
            <a href="/about" style={{ color: '#999', textDecoration: 'none' }}>Our Story</a>
            <a href="#pricing" style={{ color: '#999', textDecoration: 'none' }}>Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
