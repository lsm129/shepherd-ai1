'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/auth';

export default function DashboardPage() {
  const [churchName, setChurchName] = useState('');
  const [generationsUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        // Load church settings
        const { data } = await supabase.from('church_settings').select('church_name').eq('user_id', session.user.id).single();
        if (data && data.church_name) {
          setChurchName(data.church_name);
        }
      } catch (e) {
        console.error('Auth check error:', e);
      }
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    router.push('/');
  };

  const features = [
    {
      title: 'Visitor Follow-up Agent',
      description: 'Create personalized 6-week email sequences for new visitors with just a few clicks.',
      emoji: '📧',
      href: '/visitor-followup',
      color: '#1e3a5f',
    },
    {
      title: 'Weekly Newsletter Agent',
      description: 'Transform your weekly highlights into beautiful, professional newsletters instantly.',
      emoji: '📰',
      href: '/weekly-newsletter',
      color: '#4a90a4',
    },
  ];

  const tips = [
    { title: 'Welcome New Visitors Warmly', tip: 'Send your first follow-up email within 24 hours of their visit. First impressions matter!' },
    { title: 'Keep Newsletters Consistent', tip: 'Try to send your newsletter on the same day each week to build reader expectations.' },
    { title: 'Personalize When Possible', tip: 'Edit the AI-generated content to add personal touches — your congregation will appreciate it.' },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with sign out */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button onClick={handleSignOut} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Sign Out
        </button>
      </div>

      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', borderRadius: '16px', padding: '40px', color: 'white', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Welcome{churchName ? `, ${churchName}` : ''}! 👋</h1>
        <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '24px' }}>Your AI-powered church assistant is ready to help you serve better.</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/visitor-followup" style={{ background: 'white', color: 'var(--primary)', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            📧 New Visitor Follow-up
          </Link>
          <Link href="/weekly-newsletter" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            📰 Create Newsletter
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary)' }}>{generationsUsed}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>AI Generations Used</div>
          <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '8px' }}>10 free per month</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary)' }}>{10 - generationsUsed}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Remaining This Month</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary)' }}>Free</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Current Plan</div>
        </div>
      </div>

      {/* AI Agent Cards */}
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text)' }}>Your AI Assistants</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} style={{ textDecoration: 'none' }}>
            <div className="dashboard-card" style={{ height: '100%', cursor: 'pointer' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>{feature.emoji}</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text)' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>{feature.description}</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: feature.color, fontWeight: '600' }}>
                Get Started →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Tips */}
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text)' }}>💡 Quick Tips</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {tips.map((tip, index) => (
          <div key={index} className="card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)', border: '1px solid #f59e0b' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#92400e' }}>{tip.title}</h4>
            <p style={{ fontSize: '14px', color: '#a16207', lineHeight: '1.5' }}>{tip.tip}</p>
          </div>
        ))}
      </div>

      {/* Settings Link */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Link href="/settings" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none', fontSize: '16px' }}>
          ⚙️ Configure Your Church Settings →
        </Link>
      </div>
    </div>
  );
}
