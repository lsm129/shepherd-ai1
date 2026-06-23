'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';
import { trackUpgradePromptShown, trackUpgradePromptClicked } from '@/lib/analytics';

const PLAN_ORDER = ['free', 'starter', 'pro', 'growth'];

export function usePlan() {
  const [plan, setPlan] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const r = await fetch('/api/subscription?userId=' + session.user.id);
          const d = await r.json();
          if (d.plan) setPlan(d.plan);
        }
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  return { plan, loading };
}

export function canAccess(userPlan: string, minPlan: string) {
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(minPlan);
}

export function LockedFeature({ minPlan, title }: { minPlan: string; title: string }) {
  // Track upgrade prompt shown when component renders
  useEffect(() => {
    trackUpgradePromptShown(title || minPlan);
  }, [minPlan, title]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>{title}</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            This feature requires the <strong style={{ color: '#1e3a5f' }}>{minPlan.charAt(0).toUpperCase() + minPlan.slice(1)}</strong> plan or higher.
          </p>
          <Link href="/settings" onClick={() => trackUpgradePromptClicked(title || minPlan)} style={{ display: 'inline-block', background: '#1e3a5f', color: 'white', padding: '12px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>
            Upgrade Now
          </Link>
          <div style={{ marginTop: '16px' }}>
            <Link href="/dashboard" style={{ color: '#666', fontSize: '14px' }}>← Back to Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
