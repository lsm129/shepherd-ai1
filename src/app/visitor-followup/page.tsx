'use client';

import { useState, useEffect } from 'react';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, key);
}

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
  const [userId, setUserId] = useState<string>('');
  const [emailVerified, setEmailVerified] = useState(true);

  useEffect(() => {
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

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!emailVerified) { setError('Please verify your email first. Check your inbox for the verification link.'); return; }
    setLoading(true);

    try {
      const response = await fetch('/api/generate/visitor-sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': userId } : {}) },
        body: JSON.stringify({
          name: visitorName,
          first_visit_date: firstVisitDate,
          how_heard: howHeard,
          interests: interests,
          userId,
        }),
      });

      const data = await response.json();

      if (response.status === 429) { throw new Error('Monthly AI generation limit reached! Upgrade your plan for more generations.'); }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate email sequence');
      }

      if (data.emails && data.emails.length > 0) {
        setEmails(data.emails);
        setEditedEmails(data.emails);
        setStep('preview');
      } else {
        setError('AI generated no emails. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    setStep('sending');
    setError('');
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: editedEmails,
          recipientEmail: visitorEmail,
          recipientName: visitorName,
          fromName: undefined, // will use default
          userId: userId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails');
      }

      setStep('sent');
    } catch (err: any) {
      setError(err.message || 'Failed to send emails');
      setStep('preview'); // Go back to preview so user can retry
    }
  }

  function updateEmail(week: number, field: 'subject' | 'body', value: string) {
    setEditedEmails(prev => prev.map(email => email.week === week ? { ...email, [field]: value } : email));
  }

  function handleBackToForm() {
    setStep('form');
    setEmails([]);
    setEditedEmails([]);
    setError('');
  }

  if (step === 'form') {
    return (
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>Visitor Follow-up Agent</h1>
          <p style={{ color: '#666' }}>Enter visitor information and let AI create a personalized 6-week follow-up sequence.</p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: '#dc2626' }}>
            {error}
          </div>
        )}

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
                {loading ? 'Generating...' : 'Generate Email Sequence'}
              </button>
            </form>
          </div>

          <div>
            <div className="card" style={{ background: '#f5f5f5', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>What You'll Get</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {[
                  { week: 1, title: 'Welcome Email', desc: 'Sent immediately' },
                  { week: 2, title: 'Check-in', desc: 'Ask about experience' },
                  { week: 3, title: 'Community Story', desc: 'Share about groups' },
                  { week: 4, title: 'Event Invite', desc: 'Invite to service/event' },
                  { week: 5, title: 'Testimony', desc: 'Share community story' },
                  { week: 6, title: 'Personal Invite', desc: 'Encourage connection' }
                ].map((item) => (
                  <li key={item.week} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                    <span style={{ width: '24px', height: '24px', background: '#1e3a5f', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>{item.week}</span>
                    <div>
                      <div style={{ fontWeight: '600' }}>{item.title}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>{item.desc}</div>
                    </div>
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
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>Review Email Sequence</h1>
          <p style={{ color: '#666' }}>Review and edit the generated emails for {visitorName} ({visitorEmail})</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          <div>
            {editedEmails.map((email) => (
              <div key={email.week} className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ width: '32px', height: '32px', background: '#1e3a5f', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{email.week}</span>
                  <span style={{ fontSize: '14px', color: '#666' }}>Week {email.week}</span>
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
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Recipient</div>
              <div style={{ fontWeight: '600' }}>{visitorName}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>{visitorEmail}</div>
            </div>
            <button onClick={handleSend} className="btn-primary" style={{ width: '100%', marginBottom: '12px' }}>Send All Emails</button>
            <button onClick={handleBackToForm} className="btn-secondary" style={{ width: '100%' }}>Start Over</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'sending') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Sending Emails...</h2>
        <p style={{ color: '#666' }}>Your email sequence is being sent to {visitorName}</p>
      </div>
    );
  }

  if (step === 'sent') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#10003;</div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#16a34a' }}>Email Sequence Started!</h2>
        <p style={{ color: '#666', marginBottom: '8px' }}>Week 1 email sent immediately to {visitorName}</p>
        <p style={{ color: '#666', marginBottom: '32px' }}>Weeks 2-6 are scheduled to send automatically every 7 days</p>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', maxWidth: '400px', margin: '0 auto 32px', textAlign: 'left' }}>
          <div style={{ fontWeight: '600', marginBottom: '12px', color: '#16a34a' }}>Schedule:</div>
          {editedEmails.map((email, i) => (
            <div key={email.week} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px', color: '#333' }}>
              <span>Week {email.week}: {email.subject.substring(0, 30)}{email.subject.length > 30 ? '...' : ''}</span>
              <span style={{ color: i === 0 ? '#16a34a' : '#64748b', fontWeight: i === 0 ? '600' : '400' }}>{i === 0 ? 'Sent!' : `+${i * 7} days`}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={handleBackToForm} className="btn-primary">Follow Up Another Visitor</button>
          <a href="/dashboard" className="btn-secondary">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return null;
}
