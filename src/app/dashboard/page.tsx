'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [churchName, setChurchName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    async function checkAuth() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-url') return;
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }
        setUserEmail(session.user.email || '');
        try {
          const { data } = await supabase.from('church_settings').select('church_name').eq('user_id', session.user.id).single();
          if (data && data.church_name) setChurchName(data.church_name);
        } catch (e) {}
      } catch (e) { console.error('Auth error:', e); }
    }
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.auth.signOut();
      }
    } catch (e) {}
    window.location.href = '/';
  };

  if (!mounted) return null;

  const features = [
    {
      href: '/visitor-followup',
      icon: '📧',
      title: 'Visitor Follow-up Agent',
      desc: 'Create personalized 6-week email sequences for new visitors.',
      color: '#1e3a5f',
    },
    {
      href: '/weekly-newsletter',
      icon: '📰',
      title: 'Weekly Newsletter Agent',
      desc: 'Transform weekly highlights into professional newsletters instantly.',
      color: '#4a90a4',
    },
    {
      href: '/prayer-requests',
      icon: '🙏',
      title: 'Prayer Requests',
      desc: 'Submit prayer requests and receive AI-generated warm responses with Bible verses.',
      color: '#8b5cf6',
    },
    {
      href: '/sermon-social',
      icon: '📱',
      title: 'Sermon to Social Media',
      desc: 'Transform sermon notes into engaging posts for Facebook, Instagram, and Twitter/X.',
      color: '#ec4899',
    },
    {
      href: '/church-announcement',
      icon: '📢',
      title: 'Church Announcement Generator',
      desc: 'Generate polished church announcements for services, events, or urgent notices.',
      color: '#f59e0b',
    },
    {
      href: '/daily-devotional',
      icon: '📖',
      title: 'Daily Devotional',
      desc: 'Generate daily devotionals with Bible verses, meditation, application, and prayer.',
      color: '#10b981',
    },
    {
      href: '/feedback',
      icon: '💬',
      title: 'Suggestion Box',
      desc: 'Share your feedback, feature suggestions, or bug reports to help us improve.',
      color: '#6366f1',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{userEmail}</span>
        <button onClick={handleSignOut} style={{ background: 'none', border: '1px solid #ccc', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', color: '#666', fontSize: '14px' }}>Sign Out</button>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%)', borderRadius: '16px', padding: '40px', color: 'white', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Welcome{churchName ? `, ${churchName}` : ''}!</h1>
        <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '24px' }}>Your AI-powered church assistant is ready.</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/visitor-followup" style={{ background: 'white', color: '#1e3a5f', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Visitor Follow-up</Link>
          <Link href="/prayer-requests" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Prayer Requests</Link>
          <Link href="/daily-devotional" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Daily Devotional</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e3a5f' }}>0</div>
          <div style={{ color: '#666', fontSize: '14px' }}>AI Generations Used</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e3a5f' }}>10</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Remaining This Month</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e3a5f' }}>Free</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Current Plan</div>
        </div>
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Your AI Assistants</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} style={{ textDecoration: 'none' }}>
            <div className="dashboard-card" style={{ height: '100%', cursor: 'pointer' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>{feature.title}</h3>
              <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>{feature.desc}</p>
              <div style={{ color: feature.color, fontWeight: '600' }}>Get Started →</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Link href="/settings" style={{ color: '#1e3a5f', fontWeight: '600', textDecoration: 'none', fontSize: '16px' }}>Configure Your Church Settings →</Link>
      </div>
    </div>
  );
}
