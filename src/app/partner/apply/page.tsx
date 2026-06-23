'use client';
import { useState } from 'react';

export default function PartnerApplyPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [churchesServed, setChurchesServed] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please fill in your name and email.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/partner/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || 'Not specified',
          phone: 'pending',
          payment_email: email.trim(), // Use same email as default, collect payment details later
          churches_served: churchesServed.trim(),
          services_description: '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Application failed');
      setReferralCode(data.referral_code);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '48px', maxWidth: '520px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>&#127881;</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '12px' }}>You're In!</h1>
          <p style={{ color: '#666', marginBottom: '16px', lineHeight: '1.6' }}>
            Your partner application is being reviewed. You'll get your dashboard access within 24 hours.
          </p>
          <div style={{ background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#16a34a', marginBottom: '4px' }}>Your Referral Code</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f', letterSpacing: '2px' }}>{referralCode}</div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px', fontSize: '13px', color: '#64748b', textAlign: 'left' }}>
            <div style={{ fontWeight: '600', color: '#1e3a5f', marginBottom: '8px' }}>What Happens Next</div>
            <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.8' }}>
              <li>We review your application within 24 hours</li>
              <li>You get access to your partner dashboard</li>
              <li>Share your referral code with churches</li>
              <li>Earn 80% commission on every referral</li>
            </ul>
          </div>
          <p style={{ color: '#999', fontSize: '13px', marginTop: '16px' }}>We'll email you at <strong>{email}</strong> with next steps.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '560px', width: '100%' }}>
        {/* Value proposition header */}
        <div style={{ textAlign: 'center', marginBottom: '28px', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>&#128176;</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
            Earn $2,800–$5,600/Year<br />Referring Churches
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.9, lineHeight: '1.5' }}>
            Join the ShepherdAI Partner Program. Get 80% commission on every church you refer.
          </p>
        </div>

        {/* Earnings breakdown */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '20px', color: 'white' }}>
          <div style={{ fontWeight: '700', marginBottom: '12px', fontSize: '15px' }}>How Much Can You Earn?</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>$284</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>per Growth church</div>
              <div style={{ fontSize: '11px', opacity: 0.6 }}>($79/mo × 8 months)</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>$5,600</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>with 20 churches</div>
              <div style={{ fontSize: '11px', opacity: 0.6 }}>per year potential</div>
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', opacity: 0.7, lineHeight: '1.5' }}>
            First month: 80% commission → gradually decreases over 8 months. The more churches you refer, the more you earn every month.
          </div>
        </div>

        {/* Application form - minimal */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a5f', marginBottom: '4px' }}>Apply in 30 Seconds</h2>
            <p style={{ fontSize: '14px', color: '#666' }}>No payment info needed now</p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '14px', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>Company / Organization <span style={{ fontWeight: 'normal', fontSize: '12px', color: '#94a3b8' }}>(optional)</span></label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your company or ministry" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>Churches You Currently Serve <span style={{ fontWeight: 'normal', fontSize: '12px', color: '#94a3b8' }}>(optional)</span></label>
              <input type="number" value={churchesServed} onChange={(e) => setChurchesServed(e.target.value)} placeholder="e.g. 10" min="0" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
              {loading ? 'Submitting...' : 'Apply Now — Start Earning'}
            </button>
          </form>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
            We'll set up payment details after approval. No commitment required.
          </div>
        </div>

        {/* Trust signals */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
          <span>🔒 Secure</span>
          <span>✅ Free to join</span>
          <span>💳 No payment needed</span>
        </div>
      </div>
    </div>
  );
}
