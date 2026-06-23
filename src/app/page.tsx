'use client';
import Link from "next/link";
import { useState, useEffect } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


const PLAN_ORDER = ['free', 'starter', 'pro', 'growth'];

const allFeatures = [
  { icon: '📖', title: 'Sermon Preparation', desc: 'From scripture to sermon in minutes — outlines, word studies, cross-references, illustrations, and applications. All AI-generated for your tradition.', color: '#1a56db', href: '/sermon-prep', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '📧', title: 'Visitor Follow-up', desc: 'AI writes 6 unique personalized emails per visitor based on their background. Pastor previews, edits, then auto-sends. No two emails are the same.', color: '#1e3a5f', href: '/visitor-followup', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '🙏', title: 'Prayer Management', desc: 'AI-generated responses with Bible verses for prayer requests. Review and respond to congregant prayers.', color: '#8b5cf6', href: '/prayer-requests', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '📢', title: 'Announcements', desc: 'Generate polished church announcements for services, events, and special occasions in seconds.', color: '#f59e0b', href: '/church-announcement', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '📱', title: 'Sermon to Social Media', desc: 'Turn sermon notes into multiple engaging social media posts - Facebook, Instagram, Twitter, all at once.', color: '#ec4899', href: '/sermon-social', minPlan: 'starter', forRole: 'pastor' as const },
  { icon: '📖', title: 'Daily Devotional', desc: 'Bible verses, meditation prompts, life application, and closing prayer - generated fresh every day. Email delivery included.', color: '#10b981', href: '/daily-devotional', minPlan: 'free', forRole: 'both' as const },
  { icon: '📰', title: 'Weekly Newsletter', desc: 'Transform your week highlights into professional, engaging newsletters your congregation will actually read.', color: '#4a90a4', href: '/weekly-newsletter', minPlan: 'starter', forRole: 'pastor' as const },
  { icon: '📋', title: 'Template Marketplace', desc: 'Share your gift, bless thousands. Browse and use sermon outlines and templates from pastors worldwide.', color: '#22c55e', href: '/templates', minPlan: 'starter', forRole: 'pastor' as const },
  { icon: '⚡', title: 'Batch Content', desc: 'One sermon to 50 social media posts. One theme to a month of devotionals. Scale your ministry content.', color: '#6366f1', href: '/batch-content', minPlan: 'pro', forRole: 'pastor' as const },
  { icon: '🏥', title: 'Ministry Health Report', desc: 'See how your church is doing and get personalized recommendations to grow.', color: '#ef4444', href: '/diagnosis', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '🌍', title: 'Community Knowledge Base', desc: 'Share wisdom and learn from ministry leaders around the world. Ask questions, get answers.', color: '#0ea5e9', href: '/community', minPlan: 'free', forRole: 'both' as const },
  { icon: '🧠', title: 'AI Habit Learning', desc: 'ShepherdAI learns your style, tone, and preferences over time. The more you use it, the better it gets.', color: '#f97316', href: '/settings', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '🎯', title: 'AI Member Pastoral Plan', desc: 'When congregants join, AI analyzes their background, occupation, and needs to generate a personalized pastoral care plan for the pastor — instantly.', color: '#14b8a6', href: '/member/profile', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '🤝', title: 'Prayer Community', desc: 'Congregants lift each other up with likes and replies on prayer requests. Build a praying community that cares.', color: '#a855f7', href: '/church-community', minPlan: 'free', forRole: 'congregant' as const },
  { icon: '⭐', title: 'Congregant Engagement', desc: 'Points, badges, and daily devotionals keep your congregation active and growing. Reward participation automatically.', color: '#eab308', href: '/points-center', minPlan: 'free', forRole: 'congregant' as const },
  { icon: '🔍', title: 'Church Discovery', desc: 'Newcomers find and join your church online. AI matches them to the right congregation based on location and denomination.', color: '#06b6d4', href: '/find-church', minPlan: 'free', forRole: 'congregant' as const },
  { icon: '🕊️', title: 'Sunday Worship Planner', desc: 'AI creates complete worship service plans — call to worship, hymns, scripture readings, sermon, benediction. Tailored to your tradition and season.', color: '#7c3aed', href: '/sunday-worship-planner', minPlan: 'starter', forRole: 'pastor' as const },
  { icon: '📰', title: 'Monthly Church Newsletter', desc: 'AI writes a full monthly newsletter — pastor message, highlights, events, ministry updates, prayer focus. Send to your congregation in one click.', color: '#0891b2', href: '/monthly-newsletter', minPlan: 'starter', forRole: 'pastor' as const },
  { icon: '👥', title: 'Membership Management', desc: 'Complete member directory, AI pastoral care plans, attendance tracking, small groups, volunteer scheduling — know and care for every member.', color: '#3b82f6', href: '/membership-management', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '💰', title: 'Donation Management', desc: 'Track tithes and offerings, generate giving statements, run pledge campaigns, and analyze giving trends — all in one place.', color: '#16a34a', href: '/donation-management', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '⛪', title: 'For Religious Organizations', desc: 'Purpose-built for churches with 13+ denomination support, Scripture-centered AI, and church-specific workflows. Not a generic business tool.', color: '#7c3aed', href: '/for-churches', minPlan: 'free', forRole: 'both' as const },
];

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPlan, setUserPlan] = useState('free');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [foundingSpotsLeft, setFoundingSpotsLeft] = useState<number>(10);
  const [userRole, setUserRole] = useState<string>('pastor');
  const [featureTab, setFeatureTab] = useState<'pastor' | 'congregant'>('pastor');
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recentPosts, setRecentPosts] = useState<{title: string; slug: string; excerpt: string; published_at: string}[]>([]);

  async function handleUpgrade(planId: string) {
    if (!userId) return;
    setUpgrading(planId);
    try {
      const r = await fetch('/api/creem/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId, userEmail: userEmail || undefined, billingCycle })
      });
      const d = await r.json();
      if (d.checkoutUrl) {
        window.location.href = d.checkoutUrl;
      } else {
        alert(d.error || 'Failed to start checkout');
        setUpgrading(null);
      }
    } catch (e) {
      alert('Network error, please try again');
      setUpgrading(null);
    }
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
        if (session) {
          try {
            const r = await fetch('/api/subscription?userId=' + session.user.id);
            const d = await r.json();
            if (d.plan) setUserPlan(d.plan);
          setUserId(session.user.id);
          setUserEmail(session.user.email || '');
          } catch (e) {}
          const meta = session.user.user_metadata || {};
          const role = meta.role || 'pastor';
          setUserRole(role);
          setFeatureTab(role === 'congregant' ? 'congregant' : 'pastor');
        }
      } catch (e) {}
    }
    checkAuth();

    async function fetchFoundingSpots() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { count } = await supabase.from('founding_church_applications').select('*', { count: 'exact', head: true });
        const taken = count || 0;
        setFoundingSpotsLeft(Math.max(0, 10 - taken));
      } catch (e) {}
    }
    fetchFoundingSpots();
    
    async function fetchRecentPosts() {
      try {
        const r = await fetch('/api/blog');
        const d = await r.json();
        if (d.posts && d.posts.length > 0) {
          setRecentPosts(d.posts.slice(0, 3));
        }
      } catch {}
    }
    fetchRecentPosts();
  }, []);

  // Hero carousel slides
  const heroSlides = [
    {
      badge: 'AI-Powered Ministry Tools',
      title1: 'Do Ministry,',
      titleHighlight: 'Not Admin',
      title2: '— Starting Free',
      desc: "You didn't get called to manage spreadsheets. Our AI handles visitor follow-ups, sermon content, newsletters, and prayer responses — so you can focus on your congregation. Free plan, no credit card.",
      btnText: isLoggedIn ? 'Go to Dashboard' : 'Start Free — No Credit Card',
      btn2Text: 'See All Features',
      btnHref: isLoggedIn ? (userRole === 'congregant' ? '/member/dashboard' : '/dashboard') : '/register',
      btn2Href: '#features',
      bg: 'linear-gradient(180deg, #f8fafc 0%, white 100%)',
    },
    {
      badge: '📝 Latest from Our Blog',
      title1: recentPosts[0]?.title?.substring(0,30) || 'AI for Churches:',
      titleHighlight: 'New Posts',
      title2: '',
      desc: recentPosts[0]?.excerpt?.substring(0,120) || 'From sermon prep to visitor follow-up, AI is already changing how churches operate.',
      btnText: 'Read Post →',
      btn2Text: 'See All Posts',
      btnHref: recentPosts[0] ? '/blog/' + recentPosts[0].slug : '/blog/ai-for-churches-complete-guide',
      btn2Href: '/blog',
      bg: 'linear-gradient(180deg, #eff6ff 0%, white 100%)',
    },
    {
      badge: '🌍 Community Wisdom',
      title1: 'Learn from Ministry',
      titleHighlight: 'Leaders Worldwide',
      title2: '',
      desc: 'Share wisdom, ask questions, and grow together with pastors and church leaders from around the world.',
      btnText: 'Join the Community →',
      btn2Text: 'See All Features',
      btnHref: '/community',
      btn2Href: '#features',
      bg: 'linear-gradient(180deg, #f0fdf4 0%, white 100%)',
    },
    {
      badge: '🆕 New Feature',
      title1: 'Sunday Worship',
      titleHighlight: 'Planner',
      title2: '— Now Available!',
      desc: 'AI creates complete worship service plans: call to worship, hymns, scripture, sermon, benediction. Tailored to your tradition and season.',
      btnText: 'Try It Now →',
      btn2Text: 'See All Features',
      btnHref: '/sunday-worship-planner',
      btn2Href: '#features',
      bg: 'linear-gradient(180deg, #faf5ff 0%, white 100%)',
    },
  ];

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setHeroSlideIndex(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Mobile menu links
  const mobileMenuLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'For Churches', href: '/for-churches' },
    { label: 'Blog', href: '/blog' },
    { label: 'Roadmap', href: '/roadmap' },
    // PT handled by LanguageSwitcher component
    { label: 'Log In', href: '/login', highlight: false },
    { label: 'Get Started Free', href: '/register', highlight: true },
  ];

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* SEO: Organization / WebSite schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'ShepherdAI',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'AggregateOffer',
            lowPrice: '0',
            highPrice: '79',
            priceCurrency: 'USD',
            offerCount: '4',
          },
          description: 'AI-powered church management platform helping pastors save 8+ hours per week with automated visitor follow-up, sermon-to-social media, prayer management, devotionals, and newsletters.',
          url: 'https://www.shepherdaitech.com',
          image: 'https://www.shepherdaitech.com/og-image.png',
        }) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'ShepherdAI',
          url: 'https://www.shepherdaitech.com',
          logo: 'https://www.shepherdaitech.com/og-image.png',
          description: 'AI-powered church management platform for pastors and congregations.',
          sameAs: [
            'https://www.youtube.com/@liangshuming-k1c',
            'https://www.tiktok.com/@shumingliang0',
            'https://www.instagram.com/su.pport272',
            'https://www.facebook.com/profile.php?id=61590767607017',
          ],
        }) }}
      />

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', zIndex: 100 }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#1e3a5f"/><path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8ZM16 12C17.105 12 18 12.895 18 14C18 15.105 17.105 16 16 16C14.895 16 14 15.105 14 14C14 12.895 14.895 12 16 12Z" fill="white"/><path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>ShepherdAI</span>
          </Link>
          {/* Desktop nav links */}
          <div className="nav-desktop-links" style={{ alignItems: 'center', gap: '24px' }}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <Link href="/for-churches" className="nav-link">For Churches</Link>
            <Link href="/blog" className="nav-link">Blog</Link>
            <Link href="/roadmap" className="nav-link">Roadmap</Link>
            <LanguageSwitcher />
            {isLoggedIn ? (
              <>
                <Link href={userRole === 'congregant' ? "/member/dashboard" : "/dashboard"} className="btn-primary">Dashboard</Link>
                <button onClick={async () => {
                  try {
                    const { createClient } = await import('@supabase/supabase-js');
                    const supabase = createClient((supabaseUrl), (supabaseAnonKey));
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
          {/* Mobile hamburger button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', flexShrink: 0 }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4 7H24M4 14H24M4 21H24" stroke="#1e3a5f" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay + panel */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-menu-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f' }}>Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}
              >✕</button>
            </div>
            {mobileMenuLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="mobile-menu-link"
                onClick={() => setMobileMenuOpen(false)}
                style={link.highlight ? {
                  background: '#1e3a5f',
                  color: 'white',
                  textAlign: 'center' as const,
                  marginTop: '8px',
                  fontWeight: '700',
                } : {}}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ padding: '4px 16px', marginTop: '8px' }}>
              <LanguageSwitcher />
            </div>
            {isLoggedIn && (
              <>
                <Link
                  href={userRole === 'congregant' ? "/member/dashboard" : "/dashboard"}
                  className="mobile-menu-link"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ background: '#10b981', color: 'white', textAlign: 'center', marginTop: '8px', fontWeight: '700' }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    try {
                      const { createClient } = await import('@supabase/supabase-js');
                      const supabase = createClient((supabaseUrl), (supabaseAnonKey));
                      await supabase.auth.signOut();
                      window.location.reload();
                    } catch(e) {}
                  }}
                  className="mobile-menu-link"
                  style={{ border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', background: 'transparent', color: '#ef4444' }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Founding Church Banner - single fixed bar */}
      <div style={{ background: 'linear-gradient(90deg, #f5a623 0%, #f7c948 50%, #f5a623 100%)', padding: '8px 0', position: 'fixed', top: '72px', left: 0, right: 0, zIndex: 99, boxShadow: '0 2px 8px rgba(245,166,35,0.3)' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a5f' }}>⛪ Founding Church</span>
          <span style={{ fontSize: '16px', fontWeight: '900', color: '#dc2626' }}>Only {foundingSpotsLeft} spots left!</span>
          <span style={{ fontSize: '18px', fontWeight: '900', color: '#15803d' }}>FREE for 1 Year!</span>
          <Link href="/founding-church" style={{ background: '#1e3a5f', color: 'white', padding: '6px 16px', borderRadius: '6px', fontWeight: '700', textDecoration: 'none', fontSize: '14px', whiteSpace: 'nowrap' }}>Claim Now →</Link>
        </div>
      </div>

      <section style={{ paddingTop: isLoggedIn ? '130px' : '210px', paddingBottom: '120px', background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)' }}>
        <div className="page-container" style={{ textAlign: 'center', position: 'relative' }}>
          {/* Carousel content */}
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              transition: 'transform 0.5s ease',
              transform: `translateX(-${heroSlideIndex * 100}%)`,
            }}>
              {heroSlides.map((slide, i) => (
                <div key={i} style={{ minWidth: '100%' }}>
                  <div className="badge badge-primary" style={{ marginBottom: '24px', fontSize: '14px', padding: '8px 20px' }}>{slide.badge}</div>
                  {i === heroSlideIndex ? (
                    <h1 style={{ fontSize: '56px', fontWeight: 'bold', color: 'var(--primary)', lineHeight: '1.2', marginBottom: '24px', maxWidth: '800px', margin: '0 auto 24px' }}>
                      {slide.title1}<br />{slide.titleHighlight && <span style={{ color: 'var(--secondary)' }}>{slide.titleHighlight}</span>}{slide.title2 && <span style={{ color: 'var(--primary)' }}>{slide.title2}</span>}
                    </h1>
                  ) : (
                    <h2 style={{ fontSize: '56px', fontWeight: 'bold', color: 'var(--primary)', lineHeight: '1.2', marginBottom: '24px', maxWidth: '800px', margin: '0 auto 24px' }}>
                      {slide.title1}<br />{slide.titleHighlight && <span style={{ color: 'var(--secondary)' }}>{slide.titleHighlight}</span>}{slide.title2 && <span style={{ color: 'var(--primary)' }}>{slide.title2}</span>}
                    </h2>
                  )}
                  <p style={{ fontSize: '20px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                    {slide.desc}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Link href={slide.btnHref} style={{ display: 'inline-block', fontSize: '20px', padding: '18px 40px', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: '800', textDecoration: 'none', boxShadow: '0 4px 20px rgba(16,185,129,0.4)', transition: 'transform 0.2s, box-shadow 0.2s', border: 'none', cursor: 'pointer' }}>{slide.btnText}</Link>
                      <a href={slide.btn2Href} className="btn-secondary" style={{ fontSize: '18px', padding: '18px 32px' }}>{slide.btn2Text}</a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <span>✅ Free forever plan</span>
                      <span>🔒 No credit card</span>
                      <span>⚡ Setup in 2 minutes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Navigation arrows */}
          <button
            onClick={() => setHeroSlideIndex(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            aria-label="Previous slide"
          >‹</button>
          <button
            onClick={() => setHeroSlideIndex(prev => (prev + 1) % heroSlides.length)}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            aria-label="Next slide"
          >›</button>
          {/* Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '28px' }}>
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => setHeroSlideIndex(i)} style={{
                width: heroSlideIndex === i ? '28px' : '10px',
                height: '10px',
                borderRadius: '5px',
                background: heroSlideIndex === i ? '#1e3a5f' : '#d1d5db',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0,
              }} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
          {/* Church Member CTA - always visible below carousel */}
          <div style={{ marginTop: '32px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderRadius: '16px', padding: '24px 32px', maxWidth: '620px', width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(5,150,105,0.3)', marginLeft: 'auto', marginRight: 'auto' }}>
            <p style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>🙏 Church Member?</p>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', marginBottom: '16px' }}>Pray together, grow daily, find community</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/daily-devotional" style={{ background: 'white', color: '#059669', padding: '10px 24px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>📖 Daily Devotional</Link>
              <Link href="/community" style={{ background: 'white', color: '#059669', padding: '10px 24px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>🙏 Prayer Community</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section style={{ padding: '48px 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '28px' }}>Trusted by pastors and church leaders</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e3a5f', lineHeight: '1.2' }}>500+</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>AI Generations<br />Delivered</div>
            </div>
            <div style={{ width: '1px', height: '48px', background: '#e2e8f0' }} />
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e3a5f', lineHeight: '1.2' }}>11</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Registered<br />Pastors</div>
            </div>
            <div style={{ width: '1px', height: '48px', background: '#e2e8f0' }} />
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e3a5f', lineHeight: '1.2' }}>11</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Tools<br />Available</div>
            </div>
            <div style={{ width: '1px', height: '48px', background: '#e2e8f0' }} />
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e3a5f', lineHeight: '1.2' }}>69%</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Use Devotional<br />Generator</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 0', background: '#f0f7ff' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>🎁</span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a5f' }}>Free Tools — No Sign-up Required</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '900px', margin: '0 auto' }}>
            <Link href="/free-tools/church-announcement" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'transform 0.2s', fontWeight: '600', color: '#1e3a5f' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <span>📢</span> Announcement Generator
            </Link>
            <Link href="/free-tools/church-budget-template" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'transform 0.2s', fontWeight: '600', color: '#1e3a5f' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <span>💰</span> Budget Template
            </Link>
            <Link href="/free-tools/visitor-followup-checklist" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'transform 0.2s', fontWeight: '600', color: '#1e3a5f' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <span>📋</span> Visitor Follow-Up Checklist
            </Link>
            <Link href="/free-tools/weekly-bulletin-template" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'transform 0.2s', fontWeight: '600', color: '#1e3a5f' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <span>📰</span> Bulletin Template
            </Link>
            <Link href="/sermon-prep" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'transform 0.2s', fontWeight: '600', color: '#1e3a5f' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <span>📖</span> Sermon Prep <span style={{ fontSize: '11px', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>NEW</span>
            </Link>
          </div>
          <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>Try before you sign up. 3 uses per day, completely free.</p>
        </div>
      </section>

      {/* Church Management Quick Links */}
      <section style={{ padding: '20px 0 0', background: 'white' }}>
        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { emoji: '👥', title: 'Membership Management', desc: 'Member directory, pastoral care plans, attendance tracking', href: '/membership-management', color: '#3b82f6', bg: '#eff6ff' },
              { emoji: '💰', title: 'Donation Management', desc: 'Tithe tracking, giving statements, pledge campaigns', href: '/donation-management', color: '#16a34a', bg: '#f0fdf4' },
              { emoji: '⛪', title: 'For Religious Organizations', desc: '13+ denominations, church-specific workflows', href: '/for-churches', color: '#7c3aed', bg: '#f5f3ff' },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '20px 24px', borderRadius: 14,
                  background: card.bg, border: `1px solid ${card.color}20`,
                  textDecoration: 'none',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
              >
                <div style={{ fontSize: 32, flexShrink: 0 }}>{card.emoji}</div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 4 }}>{card.title}</h3>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: 0 }}>{card.desc}</p>
                </div>
                <span style={{ marginLeft: 'auto', color: card.color, fontWeight: 600, fontSize: 17, flexShrink: 0 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="features" style={{ padding: '100px 0', background: 'white' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>Everything You Need to Serve Better</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>AI tools designed for pastors and congregations</p>
            <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginTop: '24px', gap: '4px' }}>
              <button onClick={() => setFeatureTab('pastor')} style={{ padding: '10px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s', background: featureTab === 'pastor' ? '#1e3a5f' : 'transparent', color: featureTab === 'pastor' ? 'white' : '#64748b' }}>⛪ Pastor</button>
              <button onClick={() => setFeatureTab('congregant')} style={{ padding: '10px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s', background: featureTab === 'congregant' ? '#10b981' : 'transparent', color: featureTab === 'congregant' ? 'white' : '#64748b' }}>🙏 Congregant</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {allFeatures.filter(f => f.forRole === featureTab || f.forRole === 'both').map((f, i) => {
              const roleLocked = isLoggedIn && userRole === 'congregant' && f.forRole === 'pastor';
              const planLocked = isLoggedIn && f.minPlan !== 'free' && PLAN_ORDER.indexOf(userPlan) < PLAN_ORDER.indexOf(f.minPlan);
              const locked = roleLocked || planLocked;
              const cardHref = locked ? (roleLocked ? '/member/dashboard' : '/settings') : f.href;
              return (
                <Link key={i} href={cardHref} style={{ textDecoration: 'none' }}>
                  <div className="dashboard-card" style={{ textAlign: 'left', cursor: locked ? 'default' : 'pointer', position: 'relative', opacity: locked ? 0.6 : 1, transition: 'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={(e) => { if (!locked) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}>
                    {locked && (
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase' }}>
                        🔒 {roleLocked ? 'Pastor Only' : f.minPlan.charAt(0).toUpperCase() + f.minPlan.slice(1) + '+'}
                      </div>
                    )}
                    <div style={{ width: '48px', height: '48px', background: f.color + '15', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '24px' }}>{f.icon}</div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>{f.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14px' }}>{f.desc}</p>
                    {locked ? (
                      <div style={{ color: '#ef4444', fontWeight: '600', fontSize: '14px', marginTop: '12px' }}>{roleLocked ? 'Pastor Account Required →' : 'Upgrade to Unlock →'}</div>
                    ) : (
                      <div style={{ color: f.color, fontWeight: '600', fontSize: '14px', marginTop: '12px' }}>Learn More →</div>
                    )}
                  </div>
                </Link>
              );
            })}
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
            <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '10px', padding: '4px', marginTop: '20px' }}>
              <button onClick={() => setBillingCycle('monthly')} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', background: billingCycle === 'monthly' ? 'white' : 'transparent', color: billingCycle === 'monthly' ? '#1e3a5f' : '#64748b', boxShadow: billingCycle === 'monthly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>Monthly</button>
              <button onClick={() => setBillingCycle('annual')} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', background: billingCycle === 'annual' ? 'white' : 'transparent', color: billingCycle === 'annual' ? '#1e3a5f' : '#64748b', boxShadow: billingCycle === 'annual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>Annual <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>SAVE 17%</span></button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Free Trial</h3>
              <div style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>$0<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/mo</span></div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>7-day full-feature trial, then 20 AI generations/month</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', textAlign: 'left', fontSize: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> <strong>7-day free trial</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Visitor follow-up agent</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Sermon to Social media</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Prayer request responses</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Daily devotional</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Community knowledge base</li>
              </ul>
              {isLoggedIn ? (userPlan !== 'free' ? <div className="btn-primary" style={{ width: '100%', opacity: 0.5, cursor: 'default', textAlign: 'center' }}>Included in Your Plan</div> : <Link href={userRole === 'congregant' ? "/member/dashboard" : "/dashboard"} className="btn-primary" style={{ width: '100%' }}>Go to Dashboard</Link>) : <Link href="/register" className="btn-primary" style={{ width: '100%' }}>Start Free</Link>}
            </div>
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Starter</h3>
              <div style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>{billingCycle === 'annual' ? '$190' : '$19'}<span style={{ fontSize: '16px', fontWeight: 'normal' }}>{billingCycle === 'annual' ? '/yr' : '/mo'}</span></div>
              {billingCycle === 'annual' && <p style={{ color: '#16a34a', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>≈ $15.83/mo · Save $38/yr</p>}
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>For individual pastors</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', textAlign: 'left', fontSize: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> <strong>100 AI generations/month</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Everything in Free</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Newsletter agent</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Template marketplace</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Congregant portal (25 seats)</li>
              </ul>
              {isLoggedIn ? (userPlan === 'starter' && billingCycle === 'monthly' ? <div className="btn-primary" style={{ width: '100%', opacity: 0.5, cursor: 'default', textAlign: 'center' }}>Current Plan</div> : userPlan === 'starter' && billingCycle === 'annual' ? <button onClick={() => handleUpgrade('starter')} className="btn-primary" style={{ width: '100%', cursor: upgrading === 'starter' ? 'wait' : 'pointer' }}>{upgrading === 'starter' ? 'Redirecting...' : `Switch to Annual $190/yr`}</button> : PLAN_ORDER.indexOf(userPlan) > PLAN_ORDER.indexOf('starter') ? <div className="btn-primary" style={{ width: '100%', opacity: 0.5, cursor: 'default', textAlign: 'center' }}>Included in Your Plan</div> : <button onClick={() => handleUpgrade('starter')} className="btn-primary" style={{ width: '100%', cursor: upgrading === 'starter' ? 'wait' : 'pointer' }}>{upgrading === 'starter' ? 'Redirecting...' : `Upgrade ${billingCycle === 'annual' ? '$190/yr' : '$19/mo'}`}</button>) : <Link href="/register" className="btn-primary" style={{ width: '100%' }}>Start Free Trial</Link>}
            </div>
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Pro — Team Collaboration</h3>
              <div style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>{billingCycle === 'annual' ? '$390' : '$39'}<span style={{ fontSize: '16px', fontWeight: 'normal' }}>{billingCycle === 'annual' ? '/yr' : '/mo'}</span></div>
              {billingCycle === 'annual' && <p style={{ color: '#16a34a', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>≈ $32.50/mo · Save $78/yr</p>}
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>AI that learns your style + team collaboration</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', textAlign: 'left', fontSize: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> <strong>300 AI generations/month</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Everything in Starter</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> 🧠 AI that learns your style — gets smarter every time you use it</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Batch content generation (1 sermon → 50 posts)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Share templates and earn</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Unlimited congregant seats</li>
              </ul>
              {isLoggedIn ? (userPlan === 'pro' && billingCycle === 'monthly' ? <div className="btn-primary" style={{ width: '100%', opacity: 0.5, cursor: 'default', textAlign: 'center' }}>Current Plan</div> : userPlan === 'pro' && billingCycle === 'annual' ? <button onClick={() => handleUpgrade('pro')} className="btn-primary" style={{ width: '100%', cursor: upgrading === 'pro' ? 'wait' : 'pointer' }}>{upgrading === 'pro' ? 'Redirecting...' : `Switch to Annual $390/yr`}</button> : PLAN_ORDER.indexOf(userPlan) > PLAN_ORDER.indexOf('pro') ? <div className="btn-primary" style={{ width: '100%', opacity: 0.5, cursor: 'default', textAlign: 'center' }}>Included in Your Plan</div> : <button onClick={() => handleUpgrade('pro')} className="btn-primary" style={{ width: '100%', cursor: upgrading === 'pro' ? 'wait' : 'pointer' }}>{upgrading === 'pro' ? 'Redirecting...' : `Upgrade ${billingCycle === 'annual' ? '$390/yr' : '$39/mo'}`}</button>) : <Link href="/register" className="btn-primary" style={{ width: '100%' }}>Start Free Trial</Link>}
            </div>
            <div className="pricing-card">
              <div style={{ marginBottom: '12px' }}><span style={{ background: 'linear-gradient(135deg, #f5a623, #f7c948)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>BEST VALUE</span></div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Growth — Full Automation</h3>
              <div style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>{billingCycle === 'annual' ? '$790' : '$79'}<span style={{ fontSize: '16px', fontWeight: 'normal' }}>{billingCycle === 'annual' ? '/yr' : '/mo'}</span></div>
              {billingCycle === 'annual' && <p style={{ color: '#16a34a', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>≈ $65.83/mo · Save $158/yr</p>}
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>Let AI run your entire ministry workflow</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', textAlign: 'left', fontSize: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> <strong>Unlimited AI generations</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Everything in Pro</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> 🤖 Full automation — AI writes, sends, and follows up</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Prayer Tap for congregants</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Community knowledge base</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>✓</span> Dedicated account manager</li>
              </ul>
              {isLoggedIn ? (userPlan === 'growth' && billingCycle === 'monthly' ? <div className="btn-primary" style={{ width: '100%', opacity: 0.5, cursor: 'default', textAlign: 'center' }}>Current Plan</div> : userPlan === 'growth' && billingCycle === 'annual' ? <button onClick={() => handleUpgrade('growth')} className="btn-primary" style={{ width: '100%', cursor: upgrading === 'growth' ? 'wait' : 'pointer' }}>{upgrading === 'growth' ? 'Redirecting...' : `Switch to Annual $790/yr`}</button> : <button onClick={() => handleUpgrade('growth')} className="btn-primary" style={{ width: '100%', cursor: upgrading === 'growth' ? 'wait' : 'pointer' }}>{upgrading === 'growth' ? 'Redirecting...' : `Upgrade ${billingCycle === 'annual' ? '$790/yr' : '$79/mo'}`}</button>) : <Link href="/register" className="btn-primary" style={{ width: '100%' }}>Start Free Trial</Link>}
            </div>
          </div>
          {/* Competitor Comparison */}
          <div style={{ marginTop: '64px', maxWidth: '960px', marginLeft: 'auto', marginRight: 'auto' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', textAlign: 'center', marginBottom: '8px' }}>How We Compare</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px' }}>Same job. Fraction of the cost. AI that actually does the work.</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <thead>
                  <tr style={{ background: '#1e3a5f', color: 'white' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '600' }}>Feature</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600', background: '#2d5a8e' }}>ShepherdAI<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>$19-79/mo</span></th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600' }}>Bree__<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>$72/mo</span></th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600' }}>Tith__y<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>$49+/mo</span></th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600' }}>Plan___ Center<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>$0-279/mo</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '10px 14px', fontWeight: '600', color: '#1e3a5f' }} colSpan={5}>AI &amp; Automation</td></tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fffbeb' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: '#92400e' }}>🔥 Sermon Prep & Research</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓ Free</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>AI Content Generation</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓ Unlimited</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>AI Learns Your Style</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓ Pro+</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Sermon → Social Media</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓ 1-click</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Personalized Visitor Emails</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓ 6 emails/visitor</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>Manual</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>Manual</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Batch Content (1→50)</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓ Pro+</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>AI Prayer Responses</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Weekly Newsletter AI</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Daily Devotional + Email</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓ + Daily email</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '10px 14px', fontWeight: '600', color: '#1e3a5f' }} colSpan={5}>Ministry Tools</td></tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Church Health Diagnosis</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓ AI-powered</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Denomination-Aware AI</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓ 13+ denominations</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Community Wisdom Sharing</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Church Announcement AI</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>AI Member Pastoral Plan</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓ Auto-generated</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Prayer Community</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓ Likes + Replies</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Congregant Engagement</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓ Points + Badges</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Church Discovery</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓ Find + Join</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Sunday Worship Planner</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Monthly Church Newsletter</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '10px 14px', fontWeight: '600', color: '#1e3a5f' }} colSpan={5}>Value &amp; Pricing</td></tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Starting Price</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d', fontSize: '15px' }}>$0</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#b91c1c', fontWeight: '600' }}>$72/mo</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#b91c1c', fontWeight: '600' }}>$49/mo</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#b91c1c', fontWeight: '600' }}>$0-279/mo</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Cost for Full Features</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d', fontSize: '15px' }}>$79/mo</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#b91c1c', fontWeight: '600' }}>$72/mo</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#b91c1c', fontWeight: '600' }}>$99+/mo</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#b91c1c', fontWeight: '600' }}>$279/mo</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>Setup Time</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>2 minutes</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#666' }}>Weeks</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#666' }}>Days</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#666' }}>Days</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>No Training Needed</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: '700', color: '#15803d' }}>✓ Just type</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#666' }}>Training req.</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#666' }}>Training req.</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#666' }}>Training req.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: 'center', marginTop: '24px', padding: '20px', background: '#f0fdf4', borderRadius: '12px' }}>
              <p style={{ fontSize: '15px', color: '#166534', fontWeight: '600', marginBottom: '6px' }}>They manage your church. We automate your ministry.</p>
              <p style={{ fontSize: '13px', color: '#16a34a' }}>Use ShepherdAI alongside your existing ChMS — or let us handle everything. <Link href="/roadmap" style={{ color: '#15803d', fontWeight: '600', textDecoration: 'underline' }}>See what is coming →</Link></p>
            </div>
          </div>
        </div>
      </section>



      {/* Congregant Section */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#166534', marginBottom: '12px' }}>For Church Members Too</h2>
          <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>ShepherdAI isn't just for pastors. Grow your faith with free tools anyone can use.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '32px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🙏</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a5f', marginBottom: '8px' }}>Community & Prayer</h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>Share prayer requests, support others, and grow together in a faith community.</p>
              <Link href="/community" style={{ color: '#16a34a', fontWeight: '600', fontSize: '15px', textDecoration: 'none' }}>Join the Community →</Link>
            </div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '32px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📖</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a5f', marginBottom: '8px' }}>Daily Devotionals</h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>Start every day with Scripture and reflection. Personalized to your spiritual journey.</p>
              <Link href="/register" style={{ color: '#16a34a', fontWeight: '600', fontSize: '15px', textDecoration: 'none' }}>Start for Free →</Link>
            </div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '32px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>⛪</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a5f', marginBottom: '8px' }}>Find a Church</h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>Discover churches near you that use ShepherdAI. Connect with a welcoming community.</p>
              <Link href="/church-discovery" style={{ color: '#16a34a', fontWeight: '600', fontSize: '15px', textDecoration: 'none' }}>Explore Churches →</Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 0', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Ready to Serve Your Flock Better?</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', marginBottom: '32px' }}>Start saving hours every week on sermons, follow-ups, and church communications</p>
          <Link href={isLoggedIn ? (userRole === 'congregant' ? "/member/dashboard" : "/dashboard") : "/register"} className="btn-primary" style={{ fontSize: '18px', padding: '16px 40px', background: 'white', color: 'var(--primary)' }}>{isLoggedIn ? "Go to Dashboard" : "Start Your Free Account"}</Link>
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
            <Link href="/for-churches" style={{ color: 'rgba(255,255,255,0.7)' }}>For Churches</Link>
            <Link href="/donation-management" style={{ color: 'rgba(255,255,255,0.7)' }}>Donation Management</Link>
            <Link href="/membership-management" style={{ color: 'rgba(255,255,255,0.7)' }}>Membership Management</Link>
            <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.7)' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: 'rgba(255,255,255,0.7)' }}>Terms of Service</Link>
            <Link href="/contact" style={{ color: 'rgba(255,255,255,0.7)' }}>Contact</Link>
            <Link href="/about" style={{ color: 'rgba(255,255,255,0.7)' }}>About</Link>
            <Link href="/blog" style={{ color: 'rgba(255,255,255,0.7)' }}>Blog</Link>
            <Link href="/roadmap" style={{ color: 'rgba(255,255,255,0.7)' }}>Roadmap</Link>
          </div>
        </div>
        <div className="page-container" style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '14px' }}>
          <p>2026 ShepherdAI. All rights reserved. Built for pastors and congregations.</p>
          <p style={{ marginTop: '8px' }}>Support: <a href="mailto:support@shepherdaitech.com" style={{ color: 'rgba(255,255,255,0.7)' }}>support@shepherdaitech.com</a></p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
            <a href="https://www.youtube.com/@liangshuming-k1c" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>▶️ YouTube</a>
            <a href="https://www.tiktok.com/@shumingliang0" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>🎵 TikTok</a>
            <a href="https://www.instagram.com/su.pport272" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>📸 Instagram</a>
            <a href="https://www.facebook.com/profile.php?id=61590767607017" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>📘 Facebook</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
