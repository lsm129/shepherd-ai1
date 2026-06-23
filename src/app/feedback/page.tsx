'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

export default function FeedbackPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [experience, setExperience] = useState('');
  const [favoriteFeature, setFavoriteFeature] = useState('');
  const [consideringUpgrade, setConsideringUpgrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [newBalance, setNewBalance] = useState(0);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const featureOptions = [
    'Sermon Generation',
    'Visitor Follow-up Emails',
    'Prayer Request Responses',
    'Church Announcements',
    'Daily Devotionals',
    'Weekly Newsletter',
    'Sermon → Social Media',
    'Ministry Health Report',
    'Other',
  ];

  useEffect(() => {
    setMounted(true);
    async function checkAuth() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
        }
      } catch (e) {
        console.error('Auth check error:', e);
      }
    }
    checkAuth();
  }, []);

  if (!mounted) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!userId) {
        setError('Please log in to submit feedback.');
        setLoading(false);
        return;
      }

      const r = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          experience,
          favoriteFeature,
          consideringUpgrade,
        }),
      });

      const d = await r.json();
      if (d.error) {
        setError(d.error);
      } else {
        setSubmitted(true);
        setPointsAwarded(d.pointsAwarded || 0);
        setNewBalance(d.newBalance || 0);
        setAlreadySubmitted(d.alreadySubmitted || false);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '16px' }}>
          Share Your Feedback
        </h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>Please log in to submit feedback and earn 100 bonus points.</p>
        <Link href="/login" style={{ background: '#1e3a5f', color: 'white', padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
          Log In →
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ background: '#f0fdf4', border: '2px solid #22c55e', borderRadius: '12px', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d', marginBottom: '8px' }}>
            Thank You for Your Feedback!
          </h2>
          {pointsAwarded > 0 && (
            <p style={{ fontSize: '18px', color: '#15803d', fontWeight: '600' }}>
              +{pointsAwarded} bonus points added to your account!
            </p>
          )}
          {alreadySubmitted && (
            <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              (You've already received bonus points for a previous feedback submission)
            </p>
          )}
        </div>

        {/* Points usage info */}
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '16px' }}>
            🎯 What You Can Do With Your Points
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ fontSize: '24px' }}>🎯</span>
              <div>
                <div style={{ fontWeight: '600' }}>Extra AI Generations</div>
                <div style={{ color: '#666', fontSize: '13px' }}>500 points = 10 extra generations</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ fontSize: '24px' }}>💰</span>
              <div>
                <div style={{ fontWeight: '600' }}>Subscription Discount</div>
                <div style={{ color: '#666', fontSize: '13px' }}>1000 points = $10 off your next renewal</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ fontSize: '24px' }}>📦</span>
              <div>
                <div style={{ fontWeight: '600' }}>Premium Content Packs</div>
                <div style={{ color: '#666', fontSize: '13px' }}>800 points = Holiday sermon series, denomination-specific resources</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ fontSize: '24px' }}>🧪</span>
              <div>
                <div style={{ fontWeight: '600' }}>Beta Access</div>
                <div style={{ color: '#666', fontSize: '13px' }}>600 points = Early access to new features</div>
              </div>
            </div>
          </div>
          <Link href="/dashboard" style={{ display: 'inline-block', marginTop: '16px', color: '#1e3a5f', fontWeight: '600' }}>
            Go to Dashboard →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
          Share Your Experience 🎉
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          We'd love to hear how ShepherdAI is working for you. Complete this short survey and earn <strong style={{ color: '#22c55e' }}>100 bonus points</strong>!
        </p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: '#ef4444' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#1e3a5f' }}>
            How has your experience with ShepherdAI been? *
          </label>
          <textarea
            className="input textarea"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Tell us what you think... What's working well? What could be better?"
            style={{ minHeight: '100px', width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px' }}
            required
          />
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#1e3a5f' }}>
            What's your favorite feature? *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
            {featureOptions.map((feature) => (
              <button
                key={feature}
                type="button"
                onClick={() => setFavoriteFeature(feature)}
                style={{
                  padding: '10px 12px',
                  border: favoriteFeature === feature ? '2px solid #1e3a5f' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  background: favoriteFeature === feature ? 'rgba(30, 58, 95, 0.05)' : 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: favoriteFeature === feature ? '600' : '400',
                  textAlign: 'left',
                }}
              >
                {feature}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#1e3a5f' }}>
            Would you consider upgrading to a paid plan? *
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { value: 'yes', label: '✅ Yes, definitely', color: '#22c55e' },
              { value: 'maybe', label: '🤔 Still exploring', color: '#f59e0b' },
              { value: 'no', label: '❌ Not right now', color: '#ef4444' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setConsideringUpgrade(opt.value)}
                style={{
                  flex: 1,
                  padding: '14px 12px',
                  border: consideringUpgrade === opt.value ? `2px solid ${opt.color}` : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  background: consideringUpgrade === opt.value ? `${opt.color}10` : 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: consideringUpgrade === opt.value ? '600' : '400',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Points info box */}
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #22c55e', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ fontWeight: '600', color: '#15803d', marginBottom: '8px' }}>🎁 Complete this survey to earn 100 bonus points!</div>
          <div style={{ fontSize: '13px', color: '#166534' }}>
            Use points for: 🎯 Extra Generations (500pts) • 💰 Subscription Discount (1000pts) • 📦 Premium Content (800pts) • 🧪 Beta Access (600pts)
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}
          disabled={loading || !experience || !favoriteFeature || !consideringUpgrade}
        >
          {loading ? 'Submitting...' : 'Submit Feedback & Earn 100 Points →'}
        </button>
      </form>
    </div>
  );
}
