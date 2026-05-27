'use client';

import { useState, useEffect } from 'react';

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
              // Mark profile as completed
              await supabase.from('profiles').update({ profile_completed: true }).eq('id', session.user.id);
              // Earn complete_profile points via API
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

  if (!mounted) return null;

  const toneOptions = [
    { value: 'formal', label: 'Formal', desc: 'Professional and reverent tone, ideal for traditional congregations' },
    { value: 'warm', label: 'Warm & Friendly', desc: 'Approachable and caring, perfect for most churches' },
    { value: 'youth', label: 'Youth-Friendly', desc: 'Casual and energetic, great for youth groups and modern services' },
  ];

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
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
            </pre>
          </div>
        </div>

        {/* Subscription */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Subscription Plan</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <span className="badge badge-primary" style={{ fontSize: '16px', padding: '8px 16px' }}>Free Plan</span>
            <span style={{ color: 'var(--text-secondary)' }}>10 AI generations per month</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn-primary" disabled>Coming Soon: Upgrade to Pro ($49/mo)</button>
            <button className="btn-secondary" disabled>Coming Soon: Upgrade to Church ($99/mo)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
