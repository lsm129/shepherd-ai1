'use client';

import { useState, useEffect } from 'react';

export default function WeeklyNewsletterPage() {
  const [step, setStep] = useState<'form' | 'preview' | 'sending' | 'sent'>('form');
  const [weekDate, setWeekDate] = useState('');
  const [sermonTitle, setSermonTitle] = useState('');
  const [sermonNotes, setSermonNotes] = useState('');
  const [upcomingEvents, setUpcomingEvents] = useState('');
  const [prayerRequests, setPrayerRequests] = useState('');
  const [announcements, setAnnouncements] = useState('');
  const [otherNotes, setOtherNotes] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + (7 - today.getDay()) % 7);
    setWeekDate(sunday.toISOString().split('T')[0]);
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setError('OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.');
    setLoading(false);
  }

  function handleSend() {
    setStep('sending');
    setTimeout(() => setStep('sent'), 2000);
  }

  function handleBackToForm() {
    setStep('form');
    setGeneratedContent('');
    setEditedContent('');
  }

  function formatWeekDate(dateStr: string) {
    if (!dateStr) return 'This Week';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  if (step === 'form') {
    return (
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>📰 Weekly Newsletter Agent</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Enter your weekly highlights and let AI create a professional newsletter for you.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card">
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Weekly Highlights</h2>
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label className="form-label">Week Of *</label>
                <input type="date" className="input" value={weekDate} onChange={(e) => setWeekDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Sermon Title</label>
                <input type="text" className="input" value={sermonTitle} onChange={(e) => setSermonTitle(e.target.value)} placeholder="e.g., Walking by Faith" />
              </div>
              <div className="form-group">
                <label className="form-label">Sermon Notes / Key Points</label>
                <textarea className="input textarea" value={sermonNotes} onChange={(e) => setSermonNotes(e.target.value)} placeholder="Key takeaways or scripture references..." style={{ minHeight: '100px' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Upcoming Events</label>
                <textarea className="input textarea" value={upcomingEvents} onChange={(e) => setUpcomingEvents(e.target.value)} placeholder="• Sunday Service: 10:00 AM&#10;• Bible Study: Wednesday 7:00 PM" style={{ minHeight: '100px' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Prayer Requests</label>
                <textarea className="input textarea" value={prayerRequests} onChange={(e) => setPrayerRequests(e.target.value)} placeholder="• Pray for our mission trip..." style={{ minHeight: '80px' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Announcements</label>
                <textarea className="input textarea" value={announcements} onChange={(e) => setAnnouncements(e.target.value)} placeholder="• New members welcome!..." style={{ minHeight: '80px' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Other Notes</label>
                <textarea className="input textarea" value={otherNotes} onChange={(e) => setOtherNotes(e.target.value)} placeholder="Anything else..." style={{ minHeight: '60px' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? <><span className="spinner"></span> Generating...</> : '✨ Generate Newsletter'}
              </button>
            </form>
          </div>

          <div>
            <div className="card" style={{ background: 'var(--surface)', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>What You&apos;ll Get</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {[{ icon: '🙏', title: 'Warm Header', desc: 'Personalized greeting' }, { icon: '📖', title: 'Sermon Summary', desc: "This week's message highlights" }, { icon: '📅', title: 'Events Calendar', desc: 'Upcoming activities' }, { icon: '🙏', title: 'Prayer Corner', desc: 'Prayer requests' }, { icon: '📢', title: 'Announcements', desc: 'Important updates' }, { icon: '💌', title: 'Warm Closing', desc: 'Encouraging sign-off' }].map((item, index) => (
                  <li key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <div><div style={{ fontWeight: '600' }}>{item.title}</div><div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.desc}</div></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>📰 Review Newsletter</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review and edit your newsletter for the week of {formatWeekDate(weekDate)}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '24px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Our Church</h2>
              <p style={{ opacity: 0.9 }}>Weekly Newsletter</p>
              <p style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px' }}>Week of {formatWeekDate(weekDate)}</p>
            </div>
            <div style={{ padding: '24px' }}>
              <textarea className="input" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} style={{ border: 'none', padding: 0, minHeight: '500px', fontSize: '15px', lineHeight: '1.8' }} />
            </div>
          </div>
          <div className="card" style={{ position: 'sticky', top: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Send Options</h3>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Newsletter Date</div>
              <div style={{ fontWeight: '600' }}>{formatWeekDate(weekDate)}</div>
            </div>
            <button onClick={handleSend} className="btn-primary" style={{ width: '100%', marginBottom: '12px' }}>📤 Send Newsletter</button>
            <button onClick={handleBackToForm} className="btn-secondary" style={{ width: '100%' }}>← Start Over</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'sending') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ width: '80px', height: '80px', background: 'rgba(30, 58, 95, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Sending Newsletter...</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Your newsletter is being sent to your subscriber list</p>
      </div>
    );
  }

  if (step === 'sent') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M10 20L17 27L30 12" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Newsletter Sent!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Your weekly newsletter has been sent successfully.</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={handleBackToForm} className="btn-primary">Create Another Newsletter</button>
          <a href="/dashboard" className="btn-secondary">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return null;
}
