'use client';
import Link from "next/link";
import { useState, useEffect } from 'react';

const allFeatures = [
  { icon: '📧', title: 'Visitor Follow-up', desc: 'Personalized 6-week email sequences for new visitors. Warm, welcoming messages that make guests feel valued.', color: '#1e3a5f', href: '/visitor-followup' },
  { icon: '📰', title: 'Weekly Newsletter', desc: 'Transform your week highlights into professional, engaging newsletters your congregation will actually read.', color: '#4a90a4', href: '/weekly-newsletter' },
  { icon: '🙏', title: 'Prayer Management', desc: 'AI-generated responses with Bible verses for prayer requests. Congregants can submit prayers anytime.', color: '#8b5cf6', href: '/prayer-requests' },
  { icon: '📱', title: 'Sermon to Social Media', desc: 'Turn sermon notes into multiple engaging social media posts - Facebook, Instagram, Twitter, all at once.', color: '#ec4899', href: '/sermon-social' },
  { icon: '📢', title: 'Announcements', desc: 'Generate polished church announcements for services, events, and special occasions in seconds.', color: '#f59e0b', href: '/church-announcement' },
  { icon: '📖', title: 'Daily Devotional', desc: 'Bible verses, meditation prompts, life application, and closing prayer - generated fresh every day.', color: '#10b981', href: '/daily-devotional' },
  { icon: '⚡', title: 'Batch Content', desc: 'One sermon to 50 social media posts. One theme to a month of devotionals. Scale your ministry content.', color: '#6366f1', href: '/batch-content' },
  { icon: '📋', title: 'Template Marketplace', desc: 'Share your gift, bless thousands. Browse and use sermon outlines and templates from pastors worldwide.', color: '#22c55e', href: '/templates' },
  { icon: '🌍', title: 'Community Knowledge Base', desc: 'Share wisdom and learn from ministry leaders around the world. Ask questions, get answers.', color: '#0ea5e9', href: '/community' },
  { icon: '🧠', title: 'AI Habit Learning', desc: 'ShepherdAI learns your style, tone, and preferences over time. The more you use it, the better it gets.', color: '#f97316', href: '/settings' },
];

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
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
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', zIndex: 100 }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#1e3a5f"/><path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8ZM16 12C17.105 12 18 12.895 18 14C18 15.105 17.105 16 16 16C14.895 16 14 15.105 14 14C14 12.895 14.895 12 16 12Z" fill="white"/><path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>ShepherdAI</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <Link href="/about" className="nav-link">About</Link>
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="btn-primary">Dashboard</Link>
                <button onClick={async () => {
                  try {
                    const { createClient } = await import('@supabase/supabase-js');
                    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
                    await supabase.auth.signOut();
                    window.location.reload();
                  } catch(e) {}
                }} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#666' }}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">Log In</Link>
                <Link href="/register" className="btn-primary">Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section style={{ paddingTop: isLoggedIn ? '80px' : '160px', paddingBottom: '120px', background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <div className="badge badge-primary" style={{ marginBottom: '24px', fontSize: '14px', padding: '8px 20px' }}>AI-Powered Ministry Platform</div>
          <h1 style={{ fontSize: '56px', fontWeight: 'bold', color: 'var(--primary)', lineHeight: '1.2', marginBottom: '24px', maxWidth: '800px', margin: '0 auto 24px' }}>
            Your AI Ministry Platform for<br /><span style={{ color: 'var(--secondary)' }}>Pastors and Congregations</span>
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
            Stop spending hours on visitor follow-up and newsletter writing. ShepherdAI handles the busywork so you can focus on what matters - shepherding your flock.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ fontSize: '18px', padding: '16px 32px' }}>Start Free Today</Link>
            <a href="#features" className="btn-secondary" style={{ fontSize: '18px', padding: '16px 32px' }}>See All Features</a>
          </div>
          <p style={{ marginTop: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>No credit card required. Free plan available forever</p>
        </div>
      </section>

      <section id="features" style={{ padding: '100px 0', background: 'white' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>Everything You Need to Serve Better</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>10 powerful AI tools designed for pastors and congregations</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {allFeatures.map((f, i) => (
              <Link key={i} href={f.href} style={{ textDecoration: 'none' }}>
                <div className="dashboard-card" style={{ textAlign: 'left', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ width: '48px', height: '48px', background: f.color + '15', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '24px' }}>{f.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14px' }}>{f.desc}</p>
                  <div style={{ color: f.color, fontWeight: '600', fontSize: '14px', marginTop: '12px' }}>Learn More →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 0', background: '#f8fafc' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>How It Works</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Three steps to transform your ministry workflow</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', color: 'white', fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>1</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Sign Up Free</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Create your account in 30 seconds. No credit card required.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', color: 'white', fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>2</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Set Up Your Church</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Enter your church name and preferences. AI adapts to your style.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', color: 'white', fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>3</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Let AI Do the Work</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>From visitor follow-ups to devotionals, generate content in seconds.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" style={{ padding: '100px 0', background: 'white' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>Simple, Transparent Pricing</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Start free, upgrade when you are ready</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Free</h3>
              <div style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>$0<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/mo</span></div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>Try everything, risk-free</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', textAlign: 'left', fontSize: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> <strong>10 AI generations/month</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Visitor follow-up agent</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Sermon to Social media</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Prayer request responses</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Daily devotional</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Community knowledge base</li>
              </ul>
              <Link href="/register" className="btn-primary" style={{ width: '100%' }}>Start Free</Link>
            </div>
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Starter</h3>
              <div className="plan-amount" style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>$19<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/mo</span></div>
              <div className="plan-annual" style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px', display: 'none' }}>$190<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/yr</span></div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>For individual pastors</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', textAlign: 'left', fontSize: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> <strong>100 AI generations/month</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Everything in Free</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Newsletter agent</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Template marketplace</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Congregant portal (25 seats)</li>
              </ul>
              <Link href="/register" className="btn-primary" style={{ width: '100%' }}>Start Free Trial</Link>
            </div>
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Pro</h3>
              <div className="plan-amount" style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>$39<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/mo</span></div>
              <div className="plan-annual" style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px', display: 'none' }}>$390<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/yr</span></div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>For growing ministries</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', textAlign: 'left', fontSize: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> <strong>300 AI generations/month</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Everything in Starter</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> AI habit learning + memory</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Batch content generation</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Share templates and earn</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Unlimited congregant seats</li>
              </ul>
              <Link href="/register" className="btn-primary" style={{ width: '100%' }}>Start Free Trial</Link>
            </div>
            <div className="pricing-card">
              <div style={{ marginBottom: '12px' }}><span style={{ background: 'linear-gradient(135deg, #f5a623, #f7c948)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>BEST VALUE</span></div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Growth</h3>
              <div className="plan-amount" style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>$79<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/mo</span></div>
              <div className="plan-annual" style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px', display: 'none' }}>$790<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/yr</span></div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>Full ministry automation</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', textAlign: 'left', fontSize: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> <strong>Unlimited AI generations</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Everything in Pro</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> AI runs your ministry</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Prayer Tap for congregants</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Community knowledge base</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Dedicated account manager</li>
              </ul>
              <Link href="/register" className="btn-primary" style={{ width: '100%' }}>Start Free Trial</Link>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '48px', padding: '24px', background: '#f0fdf4', borderRadius: '16px', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
            <p style={{ fontSize: '16px', color: '#166534', fontWeight: '600', marginBottom: '8px' }}>Why pay $997/year for Gloo+ when ShepherdAI Growth is just $790/year?</p>
            <p style={{ fontSize: '14px', color: '#16a34a' }}>Same AI power. More features. 1/3 the price. That is the DeepSeek advantage.</p>
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 0', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Ready to Serve Your Flock Better?</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', marginBottom: '32px' }}>Join hundreds of pastors who are saving hours every week with ShepherdAI</p>
          <Link href="/register" className="btn-primary" style={{ fontSize: '18px', padding: '16px 40px', background: 'white', color: 'var(--primary)' }}>Start Your Free Account</Link>
        </div>
      </section>

      <footer style={{ padding: '48px 0', background: '#0a1929', color: 'rgba(255,255,255,0.7)' }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="white"/><path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8ZM16 12C17.105 12 18 12.895 18 14C18 15.105 17.105 16 16 16C14.895 16 14 15.105 14 14C14 12.895 14.895 12 16 12Z" fill="#1e3a5f"/><path d="M16 22V26M12 24H20" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>ShepherdAI</span>
            </div>
            <p style={{ fontSize: '14px' }}>AI-powered ministry platform for pastors and congregations.</p>
          </div>
          <div style={{ display: 'flex', gap: '32px', fontSize: '14px' }}>
            <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.7)' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: 'rgba(255,255,255,0.7)' }}>Terms of Service</Link>
            <Link href="/about" style={{ color: 'rgba(255,255,255,0.7)' }}>About</Link>
          </div>
        </div>
        <div className="page-container" style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '14px' }}>
          <p>2026 ShepherdAI. All rights reserved. Built for pastors and congregations.</p>
        </div>
      </footer>
    </div>
  );
}
