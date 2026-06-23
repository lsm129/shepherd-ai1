'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

const PLAN_ORDER = ['free', 'starter', 'pro', 'growth'];

interface AuthCTAProps {
  featureHref: string;
  minPlan?: string;
  style: React.CSSProperties;
  children: React.ReactNode;
}

export default function AuthCTA({ featureHref, minPlan = 'free', style, children }: AuthCTAProps) {
  const [finalHref, setFinalHref] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey) {
          if (!cancelled) setFinalHref('/register');
          return;
        }
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (!cancelled) setFinalHref('/register');
          return;
        }

        // Get user plan from subscription API
        let plan = 'free';
        try {
          const r = await fetch('/api/subscription?userId=' + session.user.id);
          const d = await r.json();
          if (d.plan) plan = d.plan;
        } catch (e) {}

        const planLevel = PLAN_ORDER.indexOf(plan);
        const minPlanLevel = PLAN_ORDER.indexOf(minPlan);

        if (planLevel < minPlanLevel) {
          if (!cancelled) setFinalHref('/pricing');
        } else {
          if (!cancelled) setFinalHref(featureHref);
        }
      } catch (e) {
        if (!cancelled) setFinalHref('/register');
      }
    }
    check();
    return () => { cancelled = true; };
  }, [featureHref, minPlan]);

  // Loading placeholder (prevents flash)
  if (!finalHref) {
    return (
      <span style={{ ...style, display: 'inline-block' }}>
        {children}
      </span>
    );
  }

  return (
    <Link href={finalHref} style={{ ...style, display: 'inline-block' }}>
      {children}
    </Link>
  );
}
