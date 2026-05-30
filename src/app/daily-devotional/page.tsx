'use client';

import { useState, useEffect } from 'react';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, key);
}

interface Devotional {
  title: string;
  verse: { reference: string; text: string };
  meditation: string;
  prayer: string;
  application: string;
}

const PRESET_TOPICS = [
  'Faith', 'Hope', 'Love', 'Grace', 'Forgiveness',
  'Strength', 'Wisdom', 'Peace', 'Joy', 'Trust',
  'Patience', 'Courage', 'Gratitude', 'Prayer', 'Obedience',
];

export default function DailyDevotionalPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [emailVerified, setEmailVerified] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Read Supabase session for auth
    (async () => {
      try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          setEmailVerified(!!session.user.email_confirmed_at);
        }
      } catch {}
    })();
  }, []);

  if (!mounted) return null;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!emailVerified) { setError('Please verify your email first. Check your inbox for the verification link.'); return; }
    setLoading(true);
    setDevotional(null);

    try {
      const response = await fetch('/api/generate/devotional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': userId } : {}) },
        body: JSON.stringify({ topic: selectedTopic, custom_topic: customTopic, userId }),
      });

      const data = await response.json();

      if (response.status === 429) { throw new Error('Monthly AI generation limit reached! Upgrade your plan for more generations.'); }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate devotional');
      }

      setDevotional(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!devotional) return;
    const text = `${devotional.title}\n\n📖 ${devotional.verse.reference}\n"${devotional.verse.text}"\n\n💭 Meditation\n${devotional.meditation}\n\n🎯 Application\n${devotional.application}\n\n🙏 Prayer\n${devotional.prayer}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setDevotional(null);
    setSelectedTopic('');
    setCustomTopic('');
    setError('');
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>Daily Devotional</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Generate a daily devotional with Bible verse, meditation, application, and prayer.</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid var(--error)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      {!devotional ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card">
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Choose a Topic</h2>
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label className="form-label">Select a Topic</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {PRESET_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => { setSelectedTopic(topic); setCustomTopic(''); }}
                      style={{
                        padding: '8px 16px',
                        border: selectedTopic === topic ? '2px solid var(--primary)' : '2px solid var(--border)',
                        borderRadius: '20px',
                        background: selectedTopic === topic ? 'rgba(30, 58, 95, 0.1)' : 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: selectedTopic === topic ? '600' : '400',
                        color: selectedTopic === topic ? 'var(--primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Or Enter a Custom Topic</label>
                <input
                  type="text"
                  className="input"
                  value={customTopic}
                  onChange={(e) => { setCustomTopic(e.target.value); setSelectedTopic(''); }}
                  placeholder="e.g., Overcoming anxiety, God's faithfulness..."
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading || (!selectedTopic && !customTopic)}>
                {loading ? 'Generating Devotional...' : 'Generate Daily Devotional'}
              </button>
            </form>
          </div>

          <div className="card" style={{ background: 'var(--surface)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>📖 What You&apos;ll Receive</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                { icon: '📖', title: 'Bible Verse', desc: 'A relevant Scripture passage' },
                { icon: '💭', title: 'Meditation', desc: 'Thoughtful reflection on the verse' },
                { icon: '🎯', title: 'Application', desc: 'Practical steps for today' },
                { icon: '🙏', title: 'Prayer', desc: 'A guided closing prayer' },
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600' }}>{item.title}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          <div className="card">
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--primary)' }}>{devotional.title}</h2>

            <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>📖 {devotional.verse.reference}</div>
              <p style={{ fontStyle: 'italic', fontSize: '18px', lineHeight: '1.8', color: 'var(--text)' }}>&ldquo;{devotional.verse.text}&rdquo;</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>💭 Meditation</h3>
              <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{devotional.meditation}</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>🎯 Application</h3>
              <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{devotional.application}</p>
            </div>

            <div style={{ background: 'rgba(30, 58, 95, 0.05)', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>🙏 Prayer</h3>
              <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{devotional.prayer}</p>
            </div>
          </div>

          <div className="card" style={{ position: 'sticky', top: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Actions</h3>
            <button onClick={handleCopy} className="btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
              {copied ? '✓ Copied!' : '📋 Copy Devotional'}
            </button>
            <button onClick={handleReset} className="btn-secondary" style={{ width: '100%' }}>
              Generate Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
