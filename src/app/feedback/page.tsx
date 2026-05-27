'use client';

import { useState, useEffect } from 'react';

interface FeedbackItem {
  id: string;
  category: string;
  message: string;
  status: string;
  created_at: string;
}

export default function FeedbackPage() {
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState<'feature' | 'bug' | 'other'>('feature');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadFeedbackList();
  }, []);

  async function loadFeedbackList() {
    setLoadingList(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-url') {
        setLoadingList(false);
        return;
      }
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoadingList(false);
        return;
      }
      const { data } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (data) setFeedbackList(data);
    } catch (e) {
      console.error('Error loading feedback:', e);
    } finally {
      setLoadingList(false);
    }
  }

  if (!mounted) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-url') {
        setError('Supabase is not configured. Please set up your environment variables.');
        setLoading(false);
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Please log in to submit feedback.');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('feedback')
        .insert({
          user_id: session.user.id,
          category,
          message,
          status: 'new',
        });

      if (insertError) {
        throw insertError;
      }

      setSubmitted(true);
      setMessage('');
      setCategory('feature');
      loadFeedbackList();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const categoryOptions = [
    { value: 'feature', label: '💡 Feature Suggestion', desc: 'Suggest a new feature or improvement' },
    { value: 'bug', label: '🐛 Bug Report', desc: 'Report a problem or issue' },
    { value: 'other', label: '💬 Other', desc: 'General feedback or questions' },
  ];

  const categoryLabels: Record<string, string> = {
    feature: '💡 Feature Suggestion',
    bug: '🐛 Bug Report',
    other: '💬 Other',
  };

  const statusColors: Record<string, string> = {
    new: 'badge-primary',
    reviewed: 'badge-warning',
    resolved: 'badge-success',
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>Suggestion Box</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Share your feedback to help us improve ShepherdAI.</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid var(--error)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      {submitted && (
        <div style={{ background: '#f0fdf4', border: '1px solid var(--success)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: '#15803d' }}>
          ✅ Thank you for your feedback! We will carefully read every suggestion and continuously improve our product.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Submit Feedback</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {categoryOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategory(opt.value as any)}
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: '12px',
                      border: category === opt.value ? '2px solid var(--primary)' : '2px solid var(--border)',
                      borderRadius: '8px',
                      background: category === opt.value ? 'rgba(30, 58, 95, 0.05)' : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{opt.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Your Feedback *</label>
              <textarea
                className="input textarea"
                value={message}
                onChange={(e) => { setMessage(e.target.value); setSubmitted(false); }}
                placeholder="Tell us what you think... What could be better? What features would you like to see?"
                style={{ minHeight: '120px' }}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Your Past Feedback</h2>
          {loadingList ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>Loading...</div>
          ) : feedbackList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
              <p>No feedback submitted yet.</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Your first submission will appear here.</p>
            </div>
          ) : (
            <div>
              {feedbackList.map((fb) => (
                <div key={fb.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className={`badge ${statusColors[fb.status] || 'badge-primary'}`} style={{ fontSize: '12px' }}>
                      {categoryLabels[fb.category] || fb.category}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {new Date(fb.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{fb.message}</p>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`badge ${statusColors[fb.status] || 'badge-primary'}`} style={{ fontSize: '11px' }}>
                      {fb.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
