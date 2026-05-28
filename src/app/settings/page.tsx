'use client';

import { useState, useEffect } from 'react';
import { PLANS, type PlanId } from '@/lib/pricing';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [churchName, setChurchName] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [emailSignature, setEmailSignature] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [subscribers, setSubscribers] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [resendKey, setResendKey] = useState('');
  const [aiTone, setAiTone] = useState('warm');
  const [defaultSignoff, setDefaultSignoff] = useState('');

  // Subscription state
  const [currentPlan, setCurrentPlan] = useState<PlanId>('free');
  const [creemCustomerId, setCreemCustomerId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    async function loadSettings() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-url') return;
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        setUserId(session.user.id);

        // Load profile/plan info
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan, creem_customer_id')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setCurrentPlan((profile.plan as PlanId) || 'free');
          if (profile.creem_customer_id) {
            setCreemCustomerId(profile.creem_customer_id);
          }
        }

        // Load church settings
        const { data } = await supabase.from('church_settings').select('*').eq('user_id', session.user.id).single();
        if (data) {
          if (data.church_name) setChurchName(data.church_name);
          if (data.pastor_name) setPastorName(data.pastor_name);
          if (data.email_signature) setEmailSignature(data.email_signature);
          if (data.website) setWebsite(data.website);
          if (data.address) setAddress(data.address);
          if (data.ai_tone) setAiTone(data.ai_tone);
          if (data.default_signoff) setDefaultSignoff(data.default_signoff);
        }
      } catch (e) {}
      const stored = localStorage.getItem('newsletter_subscribers');
      if (stored) setSubscribers(stored);
    }
    loadSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey && supabaseUrl !== 'your-supabase-url') {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { error: upsertError } = await supabase.from('church_settings').upsert({
            user_id: session.user.id,
            church_name: churchName,
            pastor_name: pastorName,
            email_signature: emailSignature,
            website: website,
            address: address,
            ai_tone: aiTone,
            default_signoff: defaultSignoff,
          }, { onConflict: 'user_id' });
          if (upsertError) throw upsertError;

          // Check if profile_completed is false, if so award points
          try {
            const { data: profile } = await supabase.from('profiles').select('profile_completed').eq('id', session.user.id).single();
            if (profile && !profile.profile_completed) {
              await supabase.from('profiles').update({ profile_completed: true }).eq('id', session.user.id);
              await fetch('/api/points/earn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id, action: 'complete_profile' }),
              });
            }
          } catch (ptsErr) {
            console.error('Profile completion points error:', ptsErr);
          }
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(planId: string) {
    if (!userId) {
      window.location.href = '/login';
      return;
    }
    setCheckoutLoading(planId);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      let userEmail = '';
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) userEmail = session.user.email;
      }

      const response = await fetch('/api/creem/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userId,
          userEmail: userEmail || undefined,
        }),
      });

      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handleManageSubscription() {
    if (!userId) return;
    setPortalLoading(true);
    try {
      const response = await fetch('/api/creem/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      } else {
        setError(data.error || 'Failed to open subscription management');
      }
    } catch (err) {
      console.error('Portal error:', err);
      setError('Failed to open subscription management');
    } finally {
      setPortalLoading(false);
    }
  }

  if (!mounted) return null;

  const toneOptions = [
    { value: 'formal', label: 'Formal', desc: 'Professional and reverent tone, ideal for traditional congregations' },
    { value: 'warm', label: 'Warm & Friendly', desc: 'Approachable and caring, perfect for most churches' },
    { value: 'youth', label: 'Youth-Friendly', desc: 'Casual and energetic, great for youth groups and modern services' },
  ];

  const currentPlanData = PLANS[currentPlan];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>⚙️ Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure your church information, AI voice, and API settings</p>
      </div>

      {saved && (
        <div style={{ background: '#dcfce7', border: '1px solid #22c55e', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Settings saved successfully!
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '24px' }}>
        {/* Subscription Plan */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Subscription Plan</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <span className="badge badge-primary" style={{ fontSize: '16px', padding: '8px 16px' }}>
              {currentPlanData.name} Plan
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {currentPlanData.generationsPerMonth === -1
                ? 'Unlimited AI generations per month'
                : `${currentPlanData.generationsPerMonth} AI generations per month`}
            </span>
          </div>

          {/* Current plan details */}
          {currentPlan !== 'free' && creemCustomerId && (
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="btn-secondary"
                style={{ cursor: portalLoading ? 'wait' : 'pointer' }}
              >
                {portalLoading ? 'Opening...' : '🔄 Manage Subscription'}
              </button>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>
                Cancel, upgrade/downgrade, or update your payment method
              </p>
            </div>
          )}

          {/* Plan upgrade options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {Object.values(PLANS).map((plan) => {
              const isCurrent = plan.id === currentPlan;
              const isFree = plan.id === 'free';
              return (
                <div
                  key={plan.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: isCurrent ? '2px solid var(--primary)' : '2px solid var(--border)',
                    background: isCurrent ? 'rgba(30,58,95,0.04)' : 'white',
                    opacity: isCurrent ? 0.7 : 1,
                  }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--text)' }}>
                    {plan.name} {plan.highlight && <span className="badge badge-primary" style={{ fontSize: '10px', padding: '2px 6px', marginLeft: '6px' }}>{plan.highlight}</span>}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
                    {isFree ? 'Free' : `$${plan.price}/mo`}
                  </div>
                  {isCurrent ? (
                    <button className="btn-secondary" disabled style={{ width: '100%', fontSize: '13px' }}>Current Plan</button>
                  ) : isFree ? (
                    <button className="btn-secondary" disabled style={{ width: '100%', fontSize: '13px' }}>Free</button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={checkoutLoading === plan.id}
                      className={plan.highlight ? 'btn-primary' : 'btn-secondary'}
                      style={{ width: '100%', fontSize: '13px', cursor: checkoutLoading === plan.id ? 'wait' : 'pointer' }}
                    >
                      {checkoutLoading === plan.id ? 'Redirecting...' : `Subscribe $${plan.price}/mo`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Voice & Tone Settings */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>🎙️ Voice & Tone</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
            Control how ShepherdAI writes — match your church&apos;s personality
          </p>
          <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
            {toneOptions.map((opt) => (
              <label
                key={opt.value}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '16px', borderRadius: '12px', cursor: 'pointer',
                  border: aiTone === opt.value ? '2px solid var(--primary)' : '2px solid var(--border)',
                  background: aiTone === opt.value ? 'rgba(30,58,95,0.04)' : 'white',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="radio" name="aiTone" value={opt.value}
                  checked={aiTone === opt.value}
                  onChange={(e) => setAiTone(e.target.value)}
                  style={{ marginTop: '3px', accentColor: 'var(--primary)' }}
                />
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{opt.label}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Default Sign-off</label>
            <input
              type="text" className="input" value={defaultSignoff}
              onChange={(e) => setDefaultSignoff(e.target.value)}
              placeholder="Blessings, Pastor John"
            />
            <p className="form-hint">Automatically appended to the end of AI-generated emails and newsletters</p>
          </div>
        </div>

        {/* Church Information */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Church Information</h2>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Church Name</label>
                <input type="text" className="input" value={churchName} onChange={(e) => setChurchName(e.target.value)} placeholder="Grace Community Church" />
              </div>
              <div className="form-group">
                <label className="form-label">Pastor Name</label>
                <input type="text" className="input" value={pastorName} onChange={(e) => setPastorName(e.target.value)} placeholder="Pastor John Smith" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input type="url" className="input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://www.yourchurch.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input type="text" className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Church Street, City, State 12345" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Signature</label>
              <textarea className="input textarea" value={emailSignature} onChange={(e) => setEmailSignature(e.target.value)} placeholder={"Blessings,\nPastor John Smith\nGrace Community Church"} style={{ minHeight: '100px' }} />
              <p className="form-hint">This will be added to the end of your emails</p>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"></span> Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Newsletter Subscribers */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Newsletter Subscribers</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Add email addresses (one per line) for your newsletter distribution list.</p>
          <div className="form-group">
            <label className="form-label">Subscriber Emails</label>
            <textarea className="input textarea" value={subscribers} onChange={(e) => setSubscribers(e.target.value)} placeholder={"member1@email.com\nmember2@email.com\nmember3@email.com"} style={{ minHeight: '150px', fontFamily: 'monospace', fontSize: '14px' }} />
          </div>
          <button className="btn-secondary" onClick={() => { localStorage.setItem('newsletter_subscribers', subscribers); setSaved(true); }}>Save Subscriber List</button>
        </div>

        {/* API Configuration */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>API Configuration</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Configure your API keys in the <code>.env.local</code> file.</p>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">OpenAI API Key</label>
              <input type="password" className="input" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} placeholder="sk-..." />
              <p className="form-hint">Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>platform.openai.com</a></p>
            </div>
            <div className="form-group">
              <label className="form-label">Resend API Key</label>
              <input type="password" className="input" value={resendKey} onChange={(e) => setResendKey(e.target.value)} placeholder="re-..." />
              <p className="form-hint">Get your key from <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>resend.com</a></p>
            </div>
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '20px', marginTop: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>📝 Environment Variables (.env.local)</h4>
            <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: '16px', borderRadius: '8px', fontSize: '13px', overflow: 'auto' }}>
{`NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
RESEND_API_KEY=re-your-resend-key
CREEM_API_KEY=your-creem-api-key
CREEM_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
