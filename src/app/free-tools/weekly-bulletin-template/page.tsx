'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function WeeklyBulletinTemplatePage() {
  const [churchName, setChurchName] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [sermonTitle, setSermonTitle] = useState('');
  const [scripture, setScripture] = useState('');
  const [announcements, setAnnouncements] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [usageCount, setUsageCount] = useState(0);

  useState(() => {
    const count = parseInt((typeof window !== "undefined" ? localStorage : null)?.getItem('free_bulletin_count') || '0');
    const lastDate = (typeof window !== "undefined" ? localStorage : null)?.getItem('free_bulletin_date');
    const today = new Date().toDateString();
    if (lastDate === today) {
      setUsageCount(count);
    } else {
      (typeof window !== "undefined" ? localStorage : null)?.setItem('free_bulletin_count', '0');
      (typeof window !== "undefined" ? localStorage : null)?.setItem('free_bulletin_date', today);
      setUsageCount(0);
    }
  });

  async function handleGenerate() {
    if (!churchName.trim() || !serviceDate.trim()) {
      setError('Please fill in church name and service date.');
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
      const res = await fetch('/api/free-bulletin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchName, serviceDate, sermonTitle, scripture, announcements }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        (typeof window !== "undefined" ? localStorage : null)?.setItem('free_bulletin_count', String(newCount));
        (typeof window !== "undefined" ? localStorage : null)?.setItem('free_bulletin_date', new Date().toDateString());
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
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

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📰</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a5f', marginBottom: '8px', lineHeight: '1.2' }}>
            Free Weekly Bulletin Template
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.5' }}>
            Generate a beautiful, print-ready church bulletin in seconds. Add your service details and let AI format it perfectly.
          </p>
          <div style={{ marginTop: '12px', fontSize: '13px', color: remaining > 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
            {remaining > 0 ? `${remaining} free generations left today` : 'Daily limit reached'}
          </div>
        </div>

        {/* Form */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>
              Church Name *
            </label>
            <input
              type="text"
              value={churchName}
              onChange={(e) => setChurchName(e.target.value)}
              placeholder="e.g. Grace Community Church"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>
              Service Date *
            </label>
            <input
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>
              Sermon Title <span style={{ fontWeight: '400', color: '#94a3b8' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={sermonTitle}
              onChange={(e) => setSermonTitle(e.target.value)}
              placeholder="e.g. Finding Hope in the Storm"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>
              Scripture Reading <span style={{ fontWeight: '400', color: '#94a3b8' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={scripture}
              onChange={(e) => setScripture(e.target.value)}
              placeholder="e.g. Romans 8:28-39"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>
              Announcements & Events <span style={{ fontWeight: '400', color: '#94a3b8' }}>(optional)</span>
            </label>
            <textarea
              value={announcements}
              onChange={(e) => setAnnouncements(e.target.value)}
              placeholder={"e.g.\n- Women's Bible Study: Wednesday 7pm\n- Youth Lock-in: March 15-16\n- Food Drive: Bring canned goods this Sunday"}
              rows={4}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
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
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Generating Bulletin...' : 'Generate Bulletin'}
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
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a5f' }}>Your Weekly Bulletin</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: '1.5px solid #e2e8f0', background: 'white', color: '#1e3a5f', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Copy
                </button>
                <button
                  onClick={handlePrint}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: '1.5px solid #e2e8f0', background: 'white', color: '#1e3a5f', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Print
                </button>
              </div>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '15px', color: '#334155' }}>
              {result}
            </div>
          </div>
        )}

        {/* Signup nudge after result */}
        {result && (
          <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '16px', padding: '28px', textAlign: 'center', color: 'white', marginBottom: '20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✨</div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>
              Like this? Get weekly bulletins auto-generated.
            </h2>
            <p style={{ fontSize: '14px', opacity: 0.95, marginBottom: '16px', lineHeight: '1.5' }}>
              Free accounts unlock: auto bulletins, newsletters, devotionals, sermon-to-social, and 8+ more AI tools.
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
              Daily limit reached — unlimited awaits!
            </h2>
            <p style={{ fontSize: '14px', color: '#92400e', marginBottom: '16px', lineHeight: '1.5' }}>
              Create a free account for unlimited bulletins plus 10+ other AI ministry tools.
            </p>
            <Link
              href="/register"
              style={{ display: 'inline-block', padding: '12px 32px', borderRadius: '10px', background: '#1e3a5f', color: 'white', fontWeight: '700', fontSize: '16px', textDecoration: 'none' }}
            >
              Sign Up Free →
            </Link>
          </div>
        )}

        {/* Bottom CTA - only after result */}
        {result && (
          <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', borderRadius: '16px', padding: '32px 28px', textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🤖</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>
              Want AI to write your bulletin every week?
            </h2>
            <p style={{ fontSize: '15px', opacity: 0.9, marginBottom: '20px', lineHeight: '1.5' }}>
              ShepherdAI auto-generates weekly bulletins, newsletters, devotionals, and more — all personalized for your church. Never stare at a blank page again.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/register"
                style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '10px', background: '#10b981', color: 'white', fontWeight: '700', fontSize: '16px', textDecoration: 'none' }}
              >
                Try ShepherdAI Free →
              </Link>
              <Link
                href="/pricing"
                style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: '600', fontSize: '16px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                See Pricing
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
