'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [refParam, setRefParam] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
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

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [mobile, setMobile] = useState(false);
  useEffect(() => { const check = () => setMobile(window.innerWidth < 768); check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check); }, []);

  if (!mounted) return null;

  const ctaHref = isLoggedIn ? '/dashboard' : (refParam ? `/register?ref=${refParam}` : '/register');

  const agents = [
    { emoji: '📧', title: 'Visitor Follow-up', desc: 'AI creates personalized 6-week sequences that match your church tone and denomination', saves: '3 hrs/week', slug: 'visitor-followup' },
    { emoji: '📰', title: 'Weekly Newsletter', desc: 'AI learns your style and writes newsletters that sound like YOU, not a template', saves: '2 hrs/week', slug: 'weekly-newsletter' },
    { emoji: '🙏', title: 'Prayer Requests', desc: 'AI crafts scripture-based responses that fit your theological tradition', saves: '1.5 hrs/week', slug: 'prayer-requests' },
    { emoji: '📱', title: 'Sermon to Social', desc: 'AI adapts your sermon into platform-perfect posts in your church voice', saves: '2 hrs/week', slug: 'sermon-social' },
    { emoji: '📢', title: 'Church Announcements', desc: 'AI generates announcements matching your church formality and style', saves: '1 hr/week', slug: 'church-announcement' },
    { emoji: '📖', title: 'Daily Devotional', desc: 'AI writes devotionals aligned with your liturgical calendar and tradition', saves: '1.5 hrs/week', slug: 'daily-devotional' },
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
      a: 'Absolutely not. ShepherdAI is designed to handle administrative busywork — follow-up emails, newsletters, announcements — so pastors can spend more time on shepherding, counseling, and ministry. AI is a tool that serves your mission, not a replacement for the human heart of pastoral care.',
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
      a: "Under 5 minutes. Sign up, tell us your denomination, congregation size, and worship style — and AI instantly generates your Church Health Report with personalized recommendations. No complex setup, no training required. The AI starts learning your church from the very first interaction.",
    },
    {
      q: 'How much does it cost?',
      a: 'ShepherdAI offers a Free plan with a Church Health Report and 10 generations/month. Starter ($29/mo) unlocks all tools with personalized AI. Pro ($49/mo) adds deep learning, proactive suggestions, and trend alerts. Growth ($99/mo) gives you full auto-pilot — AI generates and sends content automatically. No credit card required to start.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes, you can cancel your subscription at any time with no penalties or hidden fees. Your access continues through the end of your billing period, and you can always downgrade to the Free plan.',
    },
    {
      q: 'What about theological accuracy?',
      a: 'ShepherdAI is trained to reference scripture accurately and generate content that respects theological nuance. You always review and edit before anything is sent. Pastors remain in full control of the message — AI just does the heavy lifting of drafting.',
    },
    {
      q: 'What denominations does ShepherdAI support?',
      a: "All of them! ShepherdAI is denomination-aware — it adapts content based on your specific tradition. Baptist sermons emphasize expository preaching; Catholic content references liturgical seasons; Pentecostal content highlights Spirit-led worship. You tell us your tradition, and AI shapes everything accordingly. Plus, you can correct AI anytime if it gets something wrong.",
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
      a: "Those tools manage church administration (scheduling, attendance, giving). ShepherdAI is fundamentally different — it’s an AI ministry partner that learns your church over time. It adapts to your denomination, proactively suggests content, and gets smarter with every use. Think of it this way: Planning Center is your admin tool; ShepherdAI is your AI assistant that grows with you.",
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
          billingCycle,
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
          {/* Desktop nav */}
          <div style={{ display: mobile ? 'none' : 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="/faq" className="nav-link">FAQ</a>
            <a href="/about" className="nav-link">Our Story</a>
            <Link href={isLoggedIn ? "/dashboard" : "/login"} className="btn-ghost">{isLoggedIn ? "Dashboard" : "Log In"}</Link>
            <Link href={ctaHref} className="btn-primary" style={{ textDecoration: 'none' }}>{isLoggedIn ? "Go to Dashboard" : "Get Started Free"}</Link>
          </div>
          {/* Mobile: only CTA button */}
          <div style={{ display: mobile ? 'flex' : 'none', alignItems: 'center', gap: '8px' }}>
            <Link href={ctaHref} className="btn-primary" style={{ textDecoration: 'none', fontSize: '14px', padding: '8px 16px' }}>{isLoggedIn ? "Dashboard" : "Start Free"}</Link>
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
        color: 'white', textAlign: 'center', padding: mobile ? '80px 16px 60px' : '140px 0 100px',
      }}>
        <div className="page-container">
          <div style={{ fontSize: mobile ? '40px' : '56px', marginBottom: '16px' }}>⛪🤖</div>
          <h1 style={{ fontSize: mobile ? '28px' : '52px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.1' }}>
            An AI Assistant That<br/>Grows With Your Church
          </h1>
          <p style={{ fontSize: mobile ? '16px' : '22px', opacity: 0.9, marginBottom: mobile ? '24px' : '40px', maxWidth: '680px', margin: '0 auto', padding: mobile ? '0 8px' : '0' }}>
            Not just another tool — ShepherdAI learns your church, understands your denomination, and proactively handles your ministry busywork.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', flexDirection: mobile ? 'column' : 'row', padding: mobile ? '0 16px' : '0' }}>
            <Link href={ctaHref} className="btn-primary" style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '8px', textDecoration: 'none' }}>
              {isLoggedIn ? "Go to Dashboard →" : "Start Free — No credit card required →"}
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
      <section id="features" style={{ padding: mobile ? '48px 16px' : '100px 0', background: '#f8fafc' }}>
        <div className="page-container">
          <h2 style={{ fontSize: mobile ? '24px' : '40px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#1e3a5f' }}>
            6 Smart AI Agents That Know Your Church
          </h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: mobile ? '14px' : '18px', marginBottom: mobile ? '32px' : '60px' }}>
            Denomination-aware, habit-learning AI that creates content tailored to YOUR church
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
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


      {/* Comparison */}
      <section style={{ padding: mobile ? '48px 16px' : '100px 0', background: '#f8fafc' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: mobile ? '24px' : '40px', fontWeight: 'bold', marginBottom: '16px', color: '#1e3a5f' }}>
            Not Just Another AI Tool
          </h2>
          <p style={{ color: '#666', fontSize: '18px', marginBottom: '60px' }}>
            See how ShepherdAI compares to what you might be using today
          </p>

          <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '16px', overflow: 'auto', border: '1px solid var(--border)', fontSize: mobile ? '12px' : '15px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
              <thead>
                <tr style={{ background: '#1e3a5f', color: 'white' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600' }}>Capability</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '600' }}>ChatGPT / Generic AI</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '600', background: '#2a5080' }}>ShepherdAI</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Knows your denomination', '❌', '✅'],
                  ['Learns your church style over time', '❌', '✅'],
                  ['Proactive suggestions & reminders', '❌', '✅'],
                  ['Church Health Report on signup', '❌', '✅'],
                  ['Liturgical calendar awareness', '❌', '✅'],
                  ['Visitor follow-up automation', '❌', '✅'],
                  ['Editable AI memory & preferences', '❌', '✅'],
                  ['Church-specific content templates', '❌', '✅'],
                  ['Bulk church admin tools', '❌', '✅'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? 'white' : '#fafbfc' }}>
                    <td style={{ padding: '14px 20px', textAlign: 'left', fontWeight: '500', color: '#333' }}>{row[0]}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: '18px' }}>{row[1]}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: '18px', background: '#f0f7ff' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '100px 0', background: 'white' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: mobile ? '24px' : '40px', fontWeight: 'bold', marginBottom: '16px', color: '#1e3a5f' }}>
            How It Works
          </h2>
          <p style={{ color: '#666', fontSize: '18px', marginBottom: '60px' }}>
            Three steps to an AI that truly knows your church
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            {[
              { step: '1', icon: '⛪', title: 'Sign Up & Get Diagnosed', desc: 'Enter your church name, denomination, size, and worship style. AI instantly analyzes your church profile and generates a personalized Church Health Report with actionable recommendations.' },
              { step: '2', icon: '🧠', title: 'AI Learns As You Use It', desc: 'Every time you generate content, ShepherdAI learns your preferences, tone, and ministry focus. The more you use it, the more personalized and accurate it becomes.' },
              { step: '3', icon: '🚀', title: 'AI Works For You Proactively', desc: 'ShepherdAI doesn\'t wait for you — it pushes weekly suggestions, seasonal content, follow-up reminders, and trend alerts. You review, tweak, and send with confidence.' },
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
          <h2 style={{ fontSize: mobile ? '24px' : '40px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#1e3a5f' }}>
            Why Choose ShepherdAI?
          </h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: mobile ? '14px' : '18px', marginBottom: mobile ? '32px' : '60px' }}>
            Other tools give you features. We give you a growing ministry partner.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            {[
              { emoji: '🧠', title: 'AI That Learns Your Church', desc: "Every interaction teaches ShepherdAI your tone, style, and priorities. The longer you use it, the more personalized it gets — no other tool does this." },
              { emoji: '⛪', title: 'Denomination-Aware Content', desc: "Baptist sermons sound different from Catholic homilies. ShepherdAI adapts to YOUR theological tradition, liturgical calendar, and worship style." },
              { emoji: '🚀', title: 'Proactive, Not Passive', desc: "ShepherdAI doesn't wait for you to click. It pushes weekly sermon outlines, visitor follow-up reminders, seasonal content, and trend alerts." },
              { emoji: '📋', title: 'Church Health Report on Signup', desc: "The moment you register, AI diagnoses your church's needs and creates a tailored action plan. Not a blank dashboard — a ready roadmap." },
              { emoji: '✏️', title: 'You Control What AI Learns', desc: "AI learned something wrong? Correct it anytime. Tell it your priorities directly. Every insight is transparent and editable — no black box." },
              { emoji: '🔒', title: 'Your Data Stays Yours', desc: "Encrypted, private, never shared. You can delete everything anytime. We respect your church and your privacy." },
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
              Learn More About Us →
            </Link>
          </div>
        </div>
      </section>

{/* Pricing */}
      <section id="pricing" style={{ padding: mobile ? '48px 16px' : '100px 0', background: '#f8fafc' }}>
        <div className="page-container">
          <h2 style={{ fontSize: mobile ? '24px' : '40px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#1e3a5f' }}>
            Simple Pricing
          </h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '18px', marginBottom: '24px' }}>
            Start free, upgrade when you need more
          </p>

          {/* Billing cycle toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '12px', padding: '4px', gap: '4px' }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '10px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600',
                  background: billingCycle === 'monthly' ? 'white' : 'transparent', color: billingCycle === 'monthly' ? '#1e3a5f' : '#64748b',
                  boxShadow: billingCycle === 'monthly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s',
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                style={{
                  padding: '10px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600',
                  background: billingCycle === 'annual' ? 'white' : 'transparent', color: billingCycle === 'annual' ? '#1e3a5f' : '#64748b',
                  boxShadow: billingCycle === 'annual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                Annual <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>SAVE 20%</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Free */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Free</h3>
              <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
                $0<span style={{ fontSize: '14px', color: '#666' }}>/mo</span>
              </div>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>See what AI can do for your church</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '28px' }}>
                {['Church Health Report on signup', '10 AI generations/month', '2 free modules preview', 'Visitor follow-up'].map((item, i) => (
                  <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>{item}</li>
                ))}
              </ul>
              <Link href={ctaHref} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', fontSize: '14px' }}>{isLoggedIn ? "Go to Dashboard" : "Get Started"}</Link>
            </div>

            {/* Starter */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Starter</h3>
              <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
                ${billingCycle === 'annual' ? '23' : '29'}<span style={{ fontSize: '14px', color: '#666' }}>/mo</span>
              </div>
              {billingCycle === 'annual' && <p style={{ color: '#16a34a', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>$278 billed annually · Save $70/yr</p>}
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>Full AI toolkit for your church</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '28px' }}>
                {['50 AI generations/month', 'All 6 AI tools unlocked', 'Church profile personalization', 'Email sending', 'AI learns your style'].map((item, i) => (
                  <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>{item}</li>
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
                ${billingCycle === 'annual' ? '39' : '49'}<span style={{ fontSize: '14px', color: '#666' }}>/mo</span>
              </div>
              {billingCycle === 'annual' && <p style={{ color: '#16a34a', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>$470 billed annually · Save $118/yr</p>}
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>AI that deeply understands you</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '28px' }}>
                {['200 AI generations/month', 'All 6 AI tools + AI insights', 'Deep learning — AI knows your habits', 'Proactive weekly suggestions', 'Trend alerts & reminders', 'Seasonal content auto-planning', 'Email sending'].map((item, i) => (
                  <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>{item}</li>
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
                ${billingCycle === 'annual' ? '79' : '99'}<span style={{ fontSize: '14px', color: '#666' }}>/mo</span>
              </div>
              {billingCycle === 'annual' && <p style={{ color: '#16a34a', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>$950 billed annually · Save $238/yr</p>}
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>AI runs your ministry busywork</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '28px' }}>
                {['Unlimited AI generations', 'Full auto-pilot mode', 'AI generates & sends automatically', 'Multi-campus support', 'Team accounts (5 users)', 'Monthly AI calibration', 'Priority support & onboarding'].map((item, i) => (
                  <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>{item}</li>
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
          <div style={{ background: 'white', borderRadius: '16px', border: '2px solid var(--accent)', padding: '32px', maxWidth: '680px', margin: '40px auto 0', textAlign: 'center' }}>
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
            🎁 Refer a friend and you BOTH get 2,000 bonus points!
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '100px 0', background: 'white' }}>
        <div className="page-container" style={{ maxWidth: '800px', padding: mobile ? '0 8px' : '0' }}>
          <h2 style={{ fontSize: mobile ? '24px' : '40px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#1e3a5f' }}>
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
            Ready to Meet Your AI Ministry Partner?
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '40px' }}>
            Join pastors who let AI handle the busywork so they can focus on shepherding
          </p>
          <Link href={ctaHref} style={{ background: 'white', color: '#1e3a5f', padding: '16px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '18px' }}>
            {isLoggedIn ? "Go to Dashboard →" : "Start Free — No credit card required →"}
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
            <a href="/about" style={{ color: '#999', textDecoration: 'none' }}>Our Story</a>
            <a href="#pricing" style={{ color: '#999', textDecoration: 'none' }}>Pricing</a>
            <a href="/privacy" style={{ color: '#999', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/terms" style={{ color: '#999', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
