'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [churchName, setChurchName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [totalTimeSaved, setTotalTimeSaved] = useState(0);
  const [points, setPoints] = useState(0);
  const [plan, setPlan] = useState('free');
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const [generationsLimit, setGenerationsLimit] = useState(10);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [userId, setUserId] = useState('');
  const [diagnosisPending, setDiagnosisPending] = useState(false);
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
        setUserId(session.user.id);

        // Check diagnosis pending
        const meta = session.user.user_metadata || {};
        if (meta.diagnosis_pending) {
          setDiagnosisPending(true);
        }

        try {
          const { data } = await supabase.from('church_settings').select('church_name').eq('user_id', session.user.id).single();
          if (data && data.church_name) setChurchName(data.church_name);
        } catch (e) {}

        try {
          const { count } = await supabase.from('generations').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
          setTotalTimeSaved((count || 0) * 2.5);
          setGenerationsUsed(count || 0);
        } catch (e) {}

        try {
          const r = await fetch('/api/points/balance?userId=' + session.user.id);
          const d = await r.json();
          if (d.balance !== undefined) setPoints(d.balance);
        } catch (e) {}

        try {
          const r = await fetch('/api/subscription?userId=' + session.user.id);
          const d = await r.json();
          if (d.plan) setPlan(d.plan);
          const limits: Record<string, number> = { free: 10, starter: 100, pro: 300, growth: -1 };
          setGenerationsLimit(limits[d.plan] || 10);
        } catch (e) {}
      } catch (e) { console.error('Auth error:', e); }
    }
    checkAuth();
  }, [router]);

  const handleDailyCheckIn = async () => {
    if (!userId || checkedIn || checkInLoading) return;
    setCheckInLoading(true);
    try {
      const r = await fetch('/api/points/daily-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const d = await r.json();
      if (d.success) {
        setCheckedIn(true);
        setPoints(d.newBalance || points + 3);
        setStreakDays(d.streakDays || 1);
      } else if (d.alreadyCheckedIn) {
        setCheckedIn(true);
      }
    } catch (e) {}
    setCheckInLoading(false);
  };

  if (!mounted) return null;

  const features = [
    { href: '/visitor-followup', icon: '📧', title: 'Visitor Follow-up', desc: 'Personalized 6-week email sequences for new visitors.', color: '#1e3a5f', saves: '3 hrs/wk' },
    { href: '/weekly-newsletter', icon: '📰', title: 'Weekly Newsletter', desc: 'Transform highlights into professional newsletters.', color: '#4a90a4', saves: '2 hrs/wk' },
    { href: '/prayer-requests', icon: '🙏', title: 'Prayer Requests', desc: 'AI-generated responses with Bible verses for prayer requests.', color: '#8b5cf6', saves: '1.5 hrs/wk' },
    { href: '/sermon-social', icon: '📱', title: 'Sermon → Social Media', desc: 'Transform sermon notes into engaging social media posts.', color: '#ec4899', saves: '2 hrs/wk' },
    { href: '/church-announcement', icon: '📢', title: 'Announcements', desc: 'Generate polished church announcements for services and events.', color: '#f59e0b', saves: '1 hr/wk' },
    { href: '/daily-devotional', icon: '📖', title: 'Daily Devotional', desc: 'Bible verses, meditation, application, and prayer.', color: '#10b981', saves: '1.5 hrs/wk' },
    { href: '/batch-content', icon: '🎬', title: 'Content Studio', desc: 'Plan your content calendar — any topic, all platforms, one workflow.', color: '#6366f1', saves: '3 hrs/wk' },
    { href: '/templates', icon: '📋', title: 'Template Marketplace', desc: 'Share & browse sermon outlines from fellow pastors.', color: '#22c55e', saves: '2 hrs/wk' },
    { href: '/community', icon: '🌍', title: 'Community Knowledge Base', desc: 'Share wisdom and learn from pastors worldwide.', color: '#0ea5e9', saves: '' },
    { href: '/church-community', icon: '⛪', title: 'My Church Community', desc: 'Private hub for your congregation — announcements, devotionals, prayer wall.', color: '#7c3aed', saves: '' },
    { href: '/diagnosis', icon: '🏥', title: 'Ministry Health Report', desc: 'See how your church is doing and get personalized recommendations.', color: '#ef4444', saves: '' },
    { href: '/settings', icon: '⚙️', title: 'Church Settings', desc: 'Configure your church profile, plan, and preferences.', color: '#64748b', saves: '' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%)', borderRadius: '16px', padding: '32px', color: 'white', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          {churchName ? `Welcome to ${churchName}` : 'Welcome'}!
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '20px' }}>Your AI ministry platform is ready.</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/visitor-followup" style={{ background: 'white', color: '#1e3a5f', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Visitor Follow-up</Link>
          <Link href="/prayer-requests" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Prayer Requests</Link>
          <Link href="/community" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Community</Link>
        </div>
      </div>

      {/* Diagnosis Notification */}
      {diagnosisPending && (
        <Link href="/diagnosis" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)',
            border: '2px solid #f59e0b',
            borderRadius: '12px', padding: '16px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '24px', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>!</span>
              <span style={{ fontWeight: 'bold', color: '#92400e', fontSize: '16px' }}>Your Ministry Health Report is ready!</span>
            </div>
            <span style={{ color: '#92400e', fontWeight: '600', fontSize: '14px' }}>View Report →</span>
          </div>
        </Link>
      )}

      {/* Stats Row with Daily Check-in */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#22c55e' }}>{totalTimeSaved > 0 ? `${totalTimeSaved}h` : '—'}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>Time Saved</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#f59e0b' }}>{points} pts</div>
          <div style={{ color: '#666', fontSize: '12px' }}>Points</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e3a5f' }}>{generationsUsed}/{generationsLimit === -1 ? '∞' : generationsLimit}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>AI Generations</div>
        </div>
        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={handleDailyCheckIn}>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: checkedIn ? '#22c55e' : '#8b5cf6' }}>
            {checkInLoading ? '⏳' : checkedIn ? '✅' : '🎯'}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>{checkedIn ? 'Checked In!' : 'Daily Check-in +3pts'}</div>
          {streakDays > 0 && <div style={{ color: '#f59e0b', fontSize: '11px', marginTop: '2px' }}>🔥 {streakDays} day streak</div>}
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', textTransform: 'capitalize' }}>{plan}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>Current Plan</div>
          {plan === 'free' && <Link href="/settings" style={{ fontSize: '11px', color: '#8b5cf6' }}>Upgrade →</Link>}
        </div>
      </div>

      {/* All Features Grid */}
      <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px' }}>Your AI Assistants</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} style={{ textDecoration: 'none' }}>
            <div className="dashboard-card" style={{ height: '100%', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '36px' }}>{feature.icon}</span>
                {feature.saves && (
                  <span className="badge badge-success" style={{ fontSize: '11px', padding: '3px 8px', fontWeight: '700' }}>
                    Saves {feature.saves}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>{feature.title}</h3>
              <p style={{ color: '#666', lineHeight: '1.5', fontSize: '13px' }}>{feature.desc}</p>
              <div style={{ color: feature.color, fontWeight: '600', fontSize: '13px', marginTop: '8px' }}>Get Started →</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
