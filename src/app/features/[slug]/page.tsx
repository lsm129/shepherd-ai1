'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface FeatureData {
  emoji: string;
  title: string;
  subtitle: string;
  hero: string;
  challenge: string;
  steps: { icon: string; title: string; desc: string }[];
  benefits: { title: string; desc: string }[];
  savings: string;
  toolPath: string;
}

const featuresMap: Record<string, FeatureData> = {
  'visitor-followup': {
    emoji: '📧',
    title: 'Visitor Follow-up',
    subtitle: 'Never Lose a Visitor Again',
    hero: 'AI generates personalized 6-week email sequences that turn first-time visitors into active members.',
    challenge: 'Studies show 80% of church visitors never return. Most pastors intend to follow up but get buried in Sunday preparation, counseling, and administration. By the time you write that first email, weeks have passed — and the visitor is gone.',
    steps: [
      { icon: '✏️', title: 'Enter Visitor Info', desc: "Enter your visitor's name and a brief note about their visit" },
      { icon: '🤖', title: 'AI Crafts Your Sequence', desc: "AI crafts a warm, personalized 6-week email sequence tailored to your church's voice" },
      { icon: '✉️', title: 'Review & Send', desc: 'Review, edit, and send — or schedule emails for the perfect timing' },
    ],
    benefits: [
      { title: '6-Week Nurture Sequence', desc: 'Automatically generate a full follow-up journey: welcome → invitation → connection → involvement → belonging → commitment' },
      { title: 'Personalized Tone', desc: "AI adapts to your church's unique voice and theological emphasis — no generic templates" },
      { title: 'Time Saved: 3 hrs/week', desc: 'Writing 6 personalized emails used to take an entire evening. Now it takes 5 minutes.' },
      { title: 'Higher Engagement', desc: 'Timely, personal follow-up dramatically increases the chance visitors return and integrate' },
    ],
    savings: '$3,900/year',
    toolPath: '/visitor-followup',
  },
  'weekly-newsletter': {
    emoji: '📰',
    title: 'Weekly Newsletter',
    subtitle: 'Professional Newsletters in Minutes',
    hero: 'Transform your weekly highlights into polished, engaging newsletters your congregation actually reads.',
    challenge: "Members miss announcements. Newsletters take hours to write. You gather notes from 5 different people, try to make it sound cohesive, format it, and by then it's Thursday night and you're exhausted. No wonder most church newsletters look like afterthoughts.",
    steps: [
      { icon: '📝', title: 'Drop In Your Notes', desc: 'Drop in your bulletin notes, sermon highlights, and upcoming events' },
      { icon: '🤖', title: 'AI Weaves It Together', desc: 'AI weaves everything into a professional, warm newsletter' },
      { icon: '📤', title: 'Review & Share', desc: 'One click to review, tweak, and share with your congregation' },
    ],
    benefits: [
      { title: 'One-Input Generation', desc: 'Paste your raw notes and AI turns them into a beautifully structured newsletter' },
      { title: 'Consistent Brand Voice', desc: 'Every newsletter sounds like YOUR church — warm, welcoming, and professional' },
      { title: 'Time Saved: 2 hrs/week', desc: 'From scattered notes to finished newsletter in under 10 minutes' },
      { title: 'Better Read Rates', desc: 'Engaging content means more members actually read and respond' },
    ],
    savings: '$2,600/year',
    toolPath: '/weekly-newsletter',
  },
  'prayer-requests': {
    emoji: '🙏',
    title: 'Prayer Requests',
    subtitle: 'Every Prayer Heard, Every Heart Cared For',
    hero: 'AI-crafted responses with scripture verses ensure no prayer request goes unanswered.',
    challenge: 'Your congregation shares their deepest needs — illness, grief, uncertainty. You care deeply, but responding to each prayer request with the right scripture and pastoral words takes time you don\'t have. Some requests slip through the cracks, and people feel unseen.',
    steps: [
      { icon: '🙏', title: 'Submit a Prayer Request', desc: 'Submit a prayer request from your congregation' },
      { icon: '📖', title: 'AI Generates Response', desc: 'AI generates a compassionate response paired with relevant scripture' },
      { icon: '💌', title: 'Review & Share', desc: 'Review, personalize, and share — every request gets a thoughtful reply' },
    ],
    benefits: [
      { title: 'Scripture-Rooted Responses', desc: 'AI selects relevant Bible verses that bring comfort and hope to each specific need' },
      { title: 'No Request Missed', desc: 'Every prayer gets acknowledged — even on your busiest weeks' },
      { title: 'Time Saved: 1.5 hrs/week', desc: 'Composing thoughtful, scripture-based responses now takes minutes instead of hours' },
      { title: 'Pastoral Warmth at Scale', desc: 'Maintain that personal touch even as your congregation grows' },
    ],
    savings: '$1,950/year',
    toolPath: '/prayer-requests',
  },
  'sermon-social': {
    emoji: '📱',
    title: 'Sermon to Social',
    subtitle: 'One Sermon, Unlimited Reach',
    hero: 'Turn your Sunday sermon into a full week of social media content that extends your ministry beyond the sanctuary.',
    challenge: "You spend 10-15 hours preparing a sermon. It reaches your congregation on Sunday — and then it's gone. Meanwhile, your community scrolls past generic content online. Your most powerful messages never make it beyond the church walls.",
    steps: [
      { icon: '📋', title: 'Paste Sermon Notes', desc: 'Paste your sermon notes or key points' },
      { icon: '🤖', title: 'AI Generates Posts', desc: 'AI generates platform-specific posts for Facebook, Instagram, and X (Twitter)' },
      { icon: '📅', title: 'Schedule & Share', desc: 'Schedule and share — one sermon becomes a week of content' },
    ],
    benefits: [
      { title: 'Multi-Platform Posts', desc: 'Get Facebook posts, Instagram captions, and X threads — all from one sermon' },
      { title: 'Extended Ministry Reach', desc: "Your message reaches people who couldn't make it to service" },
      { title: 'Time Saved: 2 hrs/week', desc: 'Creating a week of social content now takes 5 minutes instead of 2 hours' },
      { title: 'Consistent Online Presence', desc: 'Keep your church visible and engaging all week long' },
    ],
    savings: '$2,600/year',
    toolPath: '/sermon-social',
  },
  'church-announcement': {
    emoji: '📢',
    title: 'Church Announcements',
    subtitle: 'Clear, Compelling Communication',
    hero: 'Generate professional announcements for any occasion — from bake sales to building campaigns.',
    challenge: "Writing announcements shouldn't take an hour. But making them clear, engaging, and professional? That's harder than it sounds. Too many announcements are either boring, confusing, or buried in jargon that newcomers don't understand.",
    steps: [
      { icon: '💡', title: 'Describe What You Need', desc: 'Describe what you need to announce — a single sentence is enough' },
      { icon: '🤖', title: 'AI Crafts It', desc: 'AI crafts a polished, engaging announcement' },
      { icon: '✅', title: 'Review & Share', desc: 'Review, adjust the tone, and share it everywhere' },
    ],
    benefits: [
      { title: 'Any Occasion, Any Tone', desc: 'From joyful celebrations to urgent updates — AI adapts to the moment' },
      { title: 'Newcomer-Friendly', desc: 'Announcements written so everyone understands — not just the insiders' },
      { title: 'Time Saved: 1 hr/week', desc: 'Professional announcements in under 2 minutes' },
      { title: 'Multi-Channel Ready', desc: 'Use the same announcement for email, social media, bulletins, or projection' },
    ],
    savings: '$1,300/year',
    toolPath: '/church-announcement',
  },
  'daily-devotional': {
    emoji: '📖',
    title: 'Daily Devotional',
    subtitle: 'Daily Bread, Delivered Fresh',
    hero: 'Create scripture-centered devotionals with prayer and reflection — giving your congregation spiritual nourishment every day.',
    challenge: "Your congregation hungers for daily spiritual guidance, but writing devotionals 7 days a week is impossible for any pastor already working 60+ hours. Most churches simply don't offer daily devotionals, leaving a gap between Sundays.",
    steps: [
      { icon: '🎯', title: 'Choose a Theme', desc: 'Choose a theme or scripture passage for the day' },
      { icon: '🤖', title: 'AI Generates Devotional', desc: 'AI generates a complete devotional: scripture, reflection, and closing prayer' },
      { icon: '✨', title: 'Review & Share', desc: 'Review, add your personal touch, and share with your community' },
    ],
    benefits: [
      { title: 'Complete Devotional Package', desc: 'Scripture reading, thoughtful reflection, and closing prayer — all in one' },
      { title: 'Theologically Sound', desc: 'AI respects denominational nuance and keeps scripture at the center' },
      { title: 'Time Saved: 1.5 hrs/week', desc: 'Daily devotionals that used to take hours now take minutes' },
      { title: 'Deeper Congregation Engagement', desc: "Members stay connected to God's Word throughout the week" },
    ],
    savings: '$1,950/year',
    toolPath: '/daily-devotional',
  },
};

export default function FeaturePage() {
  const params = useParams();
  const slug = params.slug as string;
  const feature = featuresMap[slug];
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co');
        const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I');
        if (supabaseUrl && supabaseKey && supabaseUrl !== 'your-supabase-url') {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data: { session } } = await supabase.auth.getSession();
          setIsLoggedIn(!!session);
        }
      } catch (e) {}
    })();
  }, []);

  if (!mounted) return null;

  if (!feature) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>404</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>Feature not found</p>
          <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>Back to Home</Link>
        </div>
      </div>
    );
  }

  const ctaHref = isLoggedIn ? feature.toolPath : '/register';

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top Navigation */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/about" className="nav-link">Our Story</Link>
            <Link href={isLoggedIn ? '/dashboard' : '/login'} className="btn-ghost">
              {isLoggedIn ? 'Dashboard' : 'Log In'}
            </Link>
            <Link href={isLoggedIn ? '/dashboard' : '/register'} className="btn-primary" style={{ textDecoration: 'none' }}>
              {isLoggedIn ? 'Dashboard' : 'Get Started Free'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: '72px',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)',
        color: 'white',
        padding: '140px 0 80px',
        textAlign: 'center',
      }}>
        <div className="page-container">
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>{feature.emoji}</div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '12px' }}>{feature.title}</h1>
          <p style={{ fontSize: '24px', opacity: 0.9, marginBottom: '16px', fontWeight: '600' }}>{feature.subtitle}</p>
          <p style={{ fontSize: '18px', opacity: 0.85, maxWidth: '700px', margin: '0 auto', lineHeight: '1.7' }}>{feature.hero}</p>
        </div>
      </section>

      {/* The Challenge */}
      <section style={{ padding: '80px 0', background: '#f8fafc' }}>
        <div className="page-container" style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px', color: '#1e3a5f' }}>
            😰 The Challenge
          </h2>
          <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#475569', textAlign: 'center' }}>
            {feature.challenge}
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', color: '#1e3a5f' }}>
            ⚡ How It Works
          </h2>
          <p style={{ color: '#666', fontSize: '18px', marginBottom: '60px' }}>
            Three simple steps to save hours every week
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', maxWidth: '900px', margin: '0 auto' }}>
            {feature.steps.map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', fontSize: '36px', boxShadow: '0 4px 20px rgba(30,58,95,0.2)',
                  position: 'relative',
                }}>
                  {step.icon}
                  <span style={{
                    position: 'absolute', top: '-8px', right: '-8px',
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#f5a623', color: 'white',
                    fontSize: '14px', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i + 1}
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#1e3a5f' }}>{step.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Pastors Love It */}
      <section style={{ padding: '80px 0', background: '#f8fafc' }}>
        <div className="page-container">
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#1e3a5f' }}>
            ❤️ Why Pastors Love It
          </h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '18px', marginBottom: '60px' }}>
            Real benefits that make a real difference
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
            {feature.benefits.map((b, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: '16px', padding: '28px',
                border: '1px solid var(--border)', transition: 'all 0.3s ease',
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#1e3a5f';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(30,58,95,0.12)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a5f', marginBottom: '8px' }}>{b.title}</h3>
                <p style={{ color: '#555', lineHeight: '1.7', fontSize: '15px', margin: 0 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Savings Section */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)',
        color: 'white',
        textAlign: 'center',
      }}>
        <div className="page-container">
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '24px' }}>
            💰 Time Is Money — Save Both
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>
            Based on $25/hour pastoral time value
          </p>
          <div style={{ fontSize: '64px', fontWeight: 'bold', color: '#22c55e', marginBottom: '8px' }}>
            {feature.savings}
          </div>
          <p style={{ fontSize: '16px', opacity: 0.7, marginBottom: '40px' }}>
            saved annually with this single tool
          </p>
          <Link
            href={ctaHref}
            className="btn-primary"
            style={{
              background: 'white', color: '#1e3a5f', padding: '16px 40px',
              borderRadius: '8px', fontWeight: '600', textDecoration: 'none',
              fontSize: '18px',
            }}
          >
            {isLoggedIn ? 'Try It Now →' : 'Start Saving Time — Free →'}
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 0', background: 'white', textAlign: 'center' }}>
        <div className="page-container">
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', color: '#1e3a5f' }}>
            Ready to Transform Your {feature.title}?
          </h2>
          <p style={{ color: '#666', fontSize: '18px', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            {isLoggedIn
              ? 'Jump right in and start generating content with AI.'
              : 'Join thousands of pastors who are reclaiming their time with ShepherdAI.'}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={ctaHref}
              className="btn-primary"
              style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '8px', textDecoration: 'none' }}
            >
              {isLoggedIn ? 'Go to Tool →' : 'Get Started Free →'}
            </Link>
            <Link
              href="/"
              className="btn-secondary"
              style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '8px', textDecoration: 'none' }}
            >
              Explore All Features
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: '#999', fontSize: '14px' }}>
        <div className="page-container">© 2026 ShepherdAI. All rights reserved.</div>
      </footer>
    </div>
  );
}
