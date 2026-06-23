'use client';
import { useState, useEffect } from 'react';
import { noSelectStyle, noSelectEvents } from '@/lib/no-select';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';
import { usePlan, canAccess, LockedFeature } from '@/lib/plan-gate';

function getSupabase() {
  const url = supabaseUrl;
  const key = supabaseAnonKey;
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, key);
}

interface MonthlyNewsletter {
  month_title: string;
  greeting: string;
  pastor_message: string;
  highlights: Array<{ title: string; description: string }>;
  upcoming_events: Array<{ name: string; date: string; description: string }>;
  ministry_updates: Array<{ ministry: string; update: string }>;
  prayer_focus: string[];
  member_spotlight: string;
  giving_update: { summary: string; needs: string[] };
  closing: string;
}

export default function MonthlyNewsletterPage() {
  const { plan, loading: planLoading } = usePlan();
  const [mounted, setMounted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<MonthlyNewsletter | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'preview' | 'sent'>('form');
  const [userId, setUserId] = useState<string>('');
  const [churchName, setChurchName] = useState('');

  const [formData, setFormData] = useState({
    month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    highlights: '',
    upcomingEvents: '',
    ministryUpdates: '',
    prayerRequests: '',
    specialAnnouncements: '',
    tone: 'warm',
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (async () => {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseAnonKey);
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUserId(session.user.id);
            const adminKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
            const admin = createClient(supabaseUrl, adminKey);
            const { data: profile } = await admin.from('profiles').select('church_name').eq('id', session.user.id).single();
            if (profile?.church_name) setChurchName(profile.church_name);
          }
        } catch (e) {}
      })();
    }
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/generate/monthly-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId, churchName }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.newsletter);
        setStep('preview');
      }
    } catch (e: any) {
      setError(e.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!result || !userId) return;
    setSending(true);
    try {
      const res = await fetch('/api/generate/monthly-newsletter', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletter: result, userId, churchName, month: formData.month }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStep('sent');
    } catch (e: any) {
      setError(e.message || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  if (!planLoading && !canAccess(plan, 'starter')) return <LockedFeature minPlan="starter" title="Monthly Church Newsletter" />;

  if (!mounted) return null;

  return (
    <div style={{ ...noSelectStyle, ...noSelectEvents, minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>📰 Monthly Church Newsletter</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>AI-generated monthly newsletter for your congregation</p>

        {step === 'form' && (
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Newsletter Details</h2>

            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500 }}>
              Month
              <input type="text" value={formData.month} onChange={e => setFormData({ ...formData, month: e.target.value })}
                placeholder="e.g., June 2026" style={{ width: '100%', padding: '8px 12px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </label>

            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500 }}>
              Monthly Highlights
              <textarea value={formData.highlights} onChange={e => setFormData({ ...formData, highlights: e.target.value })}
                placeholder="e.g., 15 new members joined, VBS was a success, renovation complete" rows={3}
                style={{ width: '100%', padding: '8px 12px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical' }} />
            </label>

            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500 }}>
              Upcoming Events
              <textarea value={formData.upcomingEvents} onChange={e => setFormData({ ...formData, upcomingEvents: e.target.value })}
                placeholder="e.g., Summer picnic July 4, Youth camp July 15-20, Mission trip Aug 1" rows={3}
                style={{ width: '100%', padding: '8px 12px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical' }} />
            </label>

            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500 }}>
              Ministry Updates
              <textarea value={formData.ministryUpdates} onChange={e => setFormData({ ...formData, ministryUpdates: e.target.value })}
                placeholder="e.g., Youth group grew to 25, Women's Bible study started, Choir needs members" rows={3}
                style={{ width: '100%', padding: '8px 12px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical' }} />
            </label>

            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500 }}>
              Prayer Requests
              <textarea value={formData.prayerRequests} onChange={e => setFormData({ ...formData, prayerRequests: e.target.value })}
                placeholder="e.g., Sister Mary's surgery, Mission trip safety, New school year" rows={2}
                style={{ width: '100%', padding: '8px 12px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical' }} />
            </label>

            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500 }}>
              Special Announcements
              <textarea value={formData.specialAnnouncements} onChange={e => setFormData({ ...formData, specialAnnouncements: e.target.value })}
                placeholder="e.g., New pastor arriving, Building fund goal reached" rows={2}
                style={{ width: '100%', padding: '8px 12px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical' }} />
            </label>

            <label style={{ display: 'block', marginBottom: '16px', fontWeight: 500 }}>
              Tone
              <select value={formData.tone} onChange={e => setFormData({ ...formData, tone: e.target.value })}
                style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px' }}>
                <option value="warm">Warm & Personal</option>
                <option value="formal">Formal & Traditional</option>
                <option value="celebratory">Celebratory & Upbeat</option>
                <option value="reflective">Reflective & Thoughtful</option>
              </select>
            </label>

            <button onClick={handleGenerate} disabled={generating}
              style={{ width: '100%', padding: '12px', background: generating ? '#999' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer' }}>
              {generating ? '⏳ Generating...' : '✨ Generate Newsletter'}
            </button>

            {error && <p style={{ color: '#dc2626', marginTop: '12px', fontSize: '14px' }}>{error}</p>}
          </div>
        )}

        {step === 'preview' && result && (
          <div>
            <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2px solid #2563eb', paddingBottom: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{churchName || 'Our Church'}</h2>
                <h3 style={{ fontSize: '18px', color: '#2563eb' }}>{result.month_title}</h3>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{result.greeting}</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#2563eb', marginBottom: '8px' }}>📖 Pastor's Message</h3>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{result.pastor_message}</p>
              </div>

              {result.highlights?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#2563eb', marginBottom: '8px' }}>⭐ Monthly Highlights</h3>
                  {result.highlights.map((h, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: '#f0f9ff', borderRadius: '6px', marginBottom: '6px' }}>
                      <strong>{h.title}</strong> — {h.description}
                    </div>
                  ))}
                </div>
              )}

              {result.upcoming_events?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#2563eb', marginBottom: '8px' }}>📅 Upcoming Events</h3>
                  {result.upcoming_events.map((e, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: '#fef3c7', borderRadius: '6px', marginBottom: '6px' }}>
                      <strong>{e.name}</strong> · {e.date} — {e.description}
                    </div>
                  ))}
                </div>
              )}

              {result.ministry_updates?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#2563eb', marginBottom: '8px' }}>🏛️ Ministry Updates</h3>
                  {result.ministry_updates.map((m, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: '#f0fdf4', borderRadius: '6px', marginBottom: '6px' }}>
                      <strong>{m.ministry}</strong> — {m.update}
                    </div>
                  ))}
                </div>
              )}

              {result.prayer_focus?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#2563eb', marginBottom: '8px' }}>🙏 Prayer Focus</h3>
                  <ul style={{ paddingLeft: '20px' }}>
                    {result.prayer_focus.map((p, i) => <li key={i} style={{ marginBottom: '4px' }}>{p}</li>)}
                  </ul>
                </div>
              )}

              {result.giving_update && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#2563eb', marginBottom: '8px' }}>💝 Giving Update</h3>
                  <p>{result.giving_update.summary}</p>
                  {result.giving_update.needs?.length > 0 && (
                    <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                      {result.giving_update.needs.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  )}
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{result.closing}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setStep('form'); setResult(null); }}
                style={{ flex: 1, padding: '12px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>
                ← Edit
              </button>
              <button onClick={handleSend} disabled={sending}
                style={{ flex: 2, padding: '12px', background: sending ? '#999' : '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer' }}>
                {sending ? '⏳ Sending...' : '📧 Send to Congregation'}
              </button>
            </div>
            {error && <p style={{ color: '#dc2626', marginTop: '12px', fontSize: '14px' }}>{error}</p>}
          </div>
        )}

        {step === 'sent' && (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Newsletter Sent!</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>Your monthly newsletter has been sent to all congregation members.</p>
            <button onClick={() => { setStep('form'); setResult(null); }}
              style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>
              Create Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
