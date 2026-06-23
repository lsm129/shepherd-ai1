'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function FreeAnnouncementPage() {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [tone, setTone] = useState('warm');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [usageCount, setUsageCount] = useState(0);

  useState(() => {
    const count = parseInt((typeof window !== "undefined" ? localStorage : null)?.getItem('free_announcement_count') || '0');
    const lastDate = (typeof window !== "undefined" ? localStorage : null)?.getItem('free_announcement_date');
    const today = new Date().toDateString();
    if (lastDate === today) {
      setUsageCount(count);
    } else {
      (typeof window !== "undefined" ? localStorage : null)?.setItem('free_announcement_count', '0');
      (typeof window !== "undefined" ? localStorage : null)?.setItem('free_announcement_date', today);
      setUsageCount(0);
    }
  });

  async function handleGenerate() {
    if (!eventName.trim() || !eventDate.trim()) {
      setError('Please fill in event name and date.');
      return;
    }
    if (usageCount >= 3) {
      setError('Daily limit reached (3/day). Sign up for unlimited access!');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const res = await fetch('/api/free-announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, eventDate, eventDescription, tone })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        (typeof window !== "undefined" ? localStorage : null)?.setItem('free_announcement_count', String(newCount));
        (typeof window !== "undefined" ? localStorage : null)?.setItem('free_announcement_date', new Date().toDateString());
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const remaining = 3 - usageCount;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      {/* Header */}
      <div style={{ background: '#1e3a5f', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '18px', fontWeight: '700' }}>
          ShepherdAI
        </Link>
        <Link href="/register" style={{ background: '#10b981', color: 'white', padding: '8px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
          Sign Up Free
        </Link>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📢</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a5f', marginBottom: '8px', lineHeight: '1.2' }}>
            Free Church Announcement Generator
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.5' }}>
            Generate professional church announcements in 3 seconds. No sign-up needed.
          </p>
          <div style={{ marginTop: '12px', fontSize: '13px', color: remaining > 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
            {remaining > 0 ? `${remaining} free generations left today` : 'Daily limit reached'}
          </div>
        </div>

        {/* Form */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>
              Event Name *
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Thanksgiving Community Dinner"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>
              Event Date *
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>
              Description <span style={{ fontWeight: '400', color: '#94a3b8' }}>(optional)</span>
            </label>
            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="e.g. Potluck dinner after Sunday service, bring a dish to share..."
              rows={3}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px' }}>
              Tone
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { value: 'warm', label: 'Warm & Welcoming' },
                { value: 'formal', label: 'Formal & Reverent' },
                { value: 'enthusiastic', label: 'Enthusiastic' },
                { value: 'inspirational', label: 'Inspirational' },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: tone === t.value ? '2px solid #1e3a5f' : '1.5px solid #e2e8f0',
                    background: tone === t.value ? '#eef2f7' : 'white',
                    color: tone === t.value ? '#1e3a5f' : '#64748b',
                    fontWeight: tone === t.value ? '600' : '400',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || usageCount >= 3}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              background: loading || usageCount >= 3 ? '#94a3b8' : 'linear-gradient(135deg, #1e3a5f, #2d5a8e)',
              color: 'white',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading || usageCount >= 3 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Generating...' : 'Generate Announcement'}
          </button>

          {error && (
            <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', fontSize: '14px' }}>
              {error}
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a5f' }}>Your Announcements</h2>
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                style={{ padding: '6px 14px', borderRadius: '6px', border: '1.5px solid #e2e8f0', background: 'white', color: '#1e3a5f', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Copy
              </button>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '15px', color: '#334155' }}>
              {result}
            </div>
          </div>
        )}

        {/* Signup nudge after result */}
        {result && (
          <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '16px', padding: '28px', textAlign: 'center', color: 'white', marginBottom: '20px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✨</div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>
              Like what you see? Get unlimited access.
            </h2>
            <p style={{ fontSize: '14px', opacity: 0.95, marginBottom: '16px', lineHeight: '1.5' }}>
              Free accounts unlock: sermons, newsletters, visitor follow-up, devotionals, prayer responses, and 8+ more AI tools.
            </p>
            <Link
              href="/register"
              style={{ display: 'inline-block', padding: '12px 32px', borderRadius: '10px', background: 'white', color: '#059669', fontWeight: '700', fontSize: '16px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            >
              Create Free Account →
            </Link>
            <div style={{ marginTop: '12px', fontSize: '12px', opacity: 0.8 }}>
              No credit card · Save all your work · Unlock 10+ AI tools
            </div>
          </div>
        )}

        {/* Limit reached nudge */}
        {usageCount >= 3 && !result && (
          <div style={{ background: '#fef3c7', borderRadius: '16px', padding: '28px', textAlign: 'center', marginBottom: '20px', border: '2px solid #f59e0b' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚀</div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#92400e', marginBottom: '6px' }}>
              Daily limit reached — but unlimited awaits!
            </h2>
            <p style={{ fontSize: '14px', color: '#92400e', marginBottom: '16px', lineHeight: '1.5' }}>
              Create a free account to generate unlimited announcements plus 10+ other AI ministry tools.
            </p>
            <Link
              href="/register"
              style={{ display: 'inline-block', padding: '12px 32px', borderRadius: '10px', background: '#1e3a5f', color: 'white', fontWeight: '700', fontSize: '16px', textDecoration: 'none' }}
            >
              Sign Up Free →
            </Link>
          </div>
        )}

        {/* Bottom CTA - only show after result */}
        {result && (
          <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', borderRadius: '16px', padding: '32px 28px', textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏱️</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>
              That took 3 seconds.
            </h2>
            <p style={{ fontSize: '15px', opacity: 0.9, marginBottom: '20px', lineHeight: '1.5' }}>
              Imagine what ShepherdAI can do for your entire ministry — sermons, newsletters, visitor follow-up, devotionals, prayer responses, and more.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/register"
                style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '10px', background: '#10b981', color: 'white', fontWeight: '700', fontSize: '16px', textDecoration: 'none' }}
              >
                Start Free — No Credit Card
              </Link>
              <Link
                href="/pricing"
                style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: '600', fontSize: '16px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                See Pricing
              </Link>
            </div>
            <div style={{ marginTop: '16px', fontSize: '12px', opacity: 0.7 }}>
              🔒 256-bit Encryption · GDPR Compliant · Data Never Sold
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
