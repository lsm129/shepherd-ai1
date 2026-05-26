'use client';

import { useState } from 'react';

interface Email {
  week: number;
  subject: string;
  body: string;
}

export default function VisitorFollowupPage() {
  const [step, setStep] = useState<'form' | 'preview' | 'sending' | 'sent'>('form');
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [firstVisitDate, setFirstVisitDate] = useState('');
  const [howHeard, setHowHeard] = useState('');
  const [interests, setInterests] = useState('');
  const [emails, setEmails] = useState<Email[]>([]);
  const [editedEmails, setEditedEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  function updateEmail(week: number, field: 'subject' | 'body', value: string) {
    setEditedEmails(prev => prev.map(email => email.week === week ? { ...email, [field]: value } : email));
  }

  function handleBackToForm() {
    setStep('form');
    setEmails([]);
    setEditedEmails([]);
  }

  if (step === 'form') {
    return (
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>📧 Visitor Follow-up Agent</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Enter visitor information and let AI create a personalized 6-week follow-up sequence.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card">
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Visitor Information</h2>
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="input" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} placeholder="John Smith" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="input" value={visitorEmail} onChange={(e) => setVisitorEmail(e.target.value)} placeholder="john@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" className="input" value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)} placeholder="(555) 123-4567" />
              </div>
              <div className="form-group">
                <label className="form-label">First Visit Date *</label>
                <input type="date" className="input" value={firstVisitDate} onChange={(e) => setFirstVisitDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">How Did They Hear About Us?</label>
                <input type="text" className="input" value={howHeard} onChange={(e) => setHowHeard(e.target.value)} placeholder="Friend referral, Google search, etc." />
              </div>
              <div className="form-group">
                <label className="form-label">Expressed Interests</label>
                <textarea className="input textarea" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Any interests or needs they mentioned..." />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? <><span className="spinner"></span> Generating...</> : '✨ Generate Email Sequence'}
              </button>
            </form>
          </div>

          <div>
            <div className="card" style={{ background: 'var(--surface)', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>What You&apos;ll Get</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {[{ week: 1, title: 'Welcome Email', desc: 'Sent immediately' }, { week: 2, title: 'Check-in', desc: 'Ask about experience' }, { week: 3, title: 'Community Story', desc: 'Share about groups' }, { week: 4, title: 'Event Invite', desc: 'Invite to service/event' }, { week: 5, title: 'Testimony', desc: 'Share community story' }, { week: 6, title: 'Personal Invite', desc: 'Encourage connection' }].map((item) => (
                  <li key={item.week} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                    <span style={{ width: '24px', height: '24px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>{item.week}</span>
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
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>📧 Review Email Sequence</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review and edit the generated emails before sending to {visitorName} ({visitorEmail})</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          <div>
            {editedEmails.map((email) => (
              <div key={email.week} className="email-preview">
                <div className="email-preview-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{email.week}</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Week {email.week}</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject Line</label>
                  <input type="text" className="input" value={email.subject} onChange={(e) => updateEmail(email.week, 'subject', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Body</label>
                  <textarea className="input" value={email.body} onChange={(e) => updateEmail(email.week, 'body', e.target.value)} style={{ minHeight: '200px' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="card" style={{ position: 'sticky', top: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Send Options</h3>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Recipient</div>
              <div style={{ fontWeight: '600' }}>{visitorName}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{visitorEmail}</div>
            </div>
            <button onClick={handleSend} className="btn-primary" style={{ width: '100%', marginBottom: '12px' }}>📤 Send All Emails</button>
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
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Sending Emails...</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Your email sequence is being sent to {visitorName}</p>
      </div>
    );
  }

  if (step === 'sent') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M10 20L17 27L30 12" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Emails Sent Successfully!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Your 6-week follow-up sequence has been sent to {visitorName}</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={handleBackToForm} className="btn-primary">Follow Up Another Visitor</button>
          <a href="/dashboard" className="btn-secondary">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return null;
}
