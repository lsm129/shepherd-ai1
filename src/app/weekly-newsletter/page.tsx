'use client';

import { useState, useEffect } from 'react';

export default function WeeklyNewsletterPage() {
  const [step, setStep] = useState<'form' | 'preview' | 'sent'>('form');
  const [highlights, setHighlights] = useState('');
  const [churchName, setChurchName] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [upcomingEvents, setUpcomingEvents] = useState('');
  const [prayerRequests, setPrayerRequests] = useState('');
  const [newsletterTitle, setNewsletterTitle] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string>('');

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/generate/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': userId } : {}) },
        body: JSON.stringify({
          highlights,
          church_name: churchName,
          pastor_name: pastorName,
          upcoming_events: upcomingEvents,
          prayer_requests: prayerRequests,
        }),
      });

      const data = await response.json();

      if (response.status === 429) { throw new Error('Monthly AI generation limit reached! Upgrade your plan for more generations.'); }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate newsletter');
      }

      if (data.newsletter) {
        setNewsletterTitle(data.newsletter.title || 'Weekly Newsletter');
        setNewsletterContent(data.newsletter.content || '');
        setEditedContent(data.newsletter.content || '');
        setStep('preview');
      } else {
        setError('AI generated no content. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleBackToForm() {
    setStep('form');
    setError('');
  }

  if (step === 'form') {
    return (
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>Weekly Newsletter Agent</h1>
          <p style={{ color: '#666' }}>Enter your week highlights and let AI create a beautiful newsletter.</p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: '#dc2626' }}>
            {error}
          </div>
        )}

        <div className="card" style={{ maxWidth: '700px' }}>
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label className="form-label">Church Name</label>
              <input type="text" className="input" value={churchName} onChange={(e) => setChurchName(e.target.value)} placeholder="Grace Community Church" />
            </div>
            <div className="form-group">
              <label className="form-label">Pastor Name</label>
              <input type="text" className="input" value={pastorName} onChange={(e) => setPastorName(e.target.value)} placeholder="Pastor John Smith" />
            </div>
            <div className="form-group">
              <label className="form-label">This Week's Highlights *</label>
              <textarea className="input textarea" value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder="Youth group had 20 attendees, New bible study starting next week, Building fund reached 50%..." style={{ minHeight: '120px' }} required />
            </div>
            <div className="form-group">
              <label className="form-label">Upcoming Events</label>
              <textarea className="input textarea" value={upcomingEvents} onChange={(e) => setUpcomingEvents(e.target.value)} placeholder="Sunday service 10am, Wednesday bible study 7pm..." style={{ minHeight: '80px' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Prayer Requests</label>
              <textarea className="input textarea" value={prayerRequests} onChange={(e) => setPrayerRequests(e.target.value)} placeholder="Pray for the Smith family, Community outreach..." style={{ minHeight: '80px' }} />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Newsletter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>Review Newsletter</h1>
          <p style={{ color: '#666' }}>Edit and send your newsletter</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          <div className="card">
            <div className="form-group">
              <label className="form-label">Newsletter Title</label>
              <input type="text" className="input" value={newsletterTitle} onChange={(e) => setNewsletterTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea className="input" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} style={{ minHeight: '400px' }} />
            </div>
          </div>

          <div className="card" style={{ position: 'sticky', top: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Send Options</h3>
            <button onClick={() => { setStep('sent'); }} className="btn-primary" style={{ width: '100%', marginBottom: '12px' }}>Send Newsletter</button>
            <button onClick={handleBackToForm} className="btn-secondary" style={{ width: '100%' }}>Start Over</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'sent') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Newsletter Sent!</h2>
        <p style={{ color: '#666', marginBottom: '32px' }}>Your newsletter has been sent successfully.</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={handleBackToForm} className="btn-primary">Create Another</button>
          <a href="/dashboard" className="btn-secondary">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return null;
}
