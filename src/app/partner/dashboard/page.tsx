'use client';
import { useState, useEffect } from 'react';

interface PartnerInfo {
  id: string;
  name: string;
  email: string;
  company: string;
  referral_code: string;
  payment_email: string;
  status: string;
  churches_served: number | null;
  services_description: string | null;
}

interface DashboardStats {
  totalReferrals: number;
  activeClients: number;
  thisMonthEarnings: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
}

interface Referral {
  id: string;
  referred_email: string;
  referred_church: string;
  plan: string;
  billing_type: string;
  status: string;
  first_payment_date: string;
  last_payment_date: string;
  created_at: string;
  total_commission: number;
  commission_months: number;
}

interface Commission {
  id: string;
  referral_id: string;
  month_number: number;
  commission_rate: number;
  plan_price: number;
  amount: number;
  status: string;
  settled_at: string;
  created_at: string;
  referral?: { referred_email: string; referred_church: string; plan: string };
}

const MIN_PAYOUT = 50;

export default function PartnerDashboardPage() {
  const [code, setCode] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [referralLink, setReferralLink] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'referrals' | 'commissions'>('referrals');
  const [paymentEmail, setPaymentEmail] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentSaved, setPaymentSaved] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setCode(codeParam);
      handleLogin(codeParam);
    }
  }, []);

  const handleLogin = async (refCode?: string) => {
    const c = refCode || code;
    if (!c.trim()) { setError('Please enter your referral code'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/partner/dashboard?code=${encodeURIComponent(c.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setPartner(data.partner);
      setStats(data.stats);
      setReferralLink(data.referral_link);
      setPaymentEmail(data.partner.payment_email || '');
      setLoggedIn(true);
      loadReferrals(c.trim());
      loadCommissions(c.trim());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReferrals = async (c: string) => {
    try {
      const res = await fetch(`/api/partner/referrals?code=${encodeURIComponent(c)}`);
      const data = await res.json();
      if (res.ok) setReferrals(data.referrals || []);
    } catch (e) { console.error(e); }
  };

  const loadCommissions = async (c: string) => {
    try {
      const res = await fetch(`/api/partner/commissions?code=${encodeURIComponent(c)}`);
      const data = await res.json();
      if (res.ok) setCommissions(data.commissions || []);
    } catch (e) { console.error(e); }
  };

  const savePayment = async () => {
    if (!partner) return;
    setSavingPayment(true);
    setPaymentSaved(false);
    try {
      const SUPABASE_URL = 'https://hsunvuixqesjcoohbrmp.supabase.co';
      const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
      const res = await fetch(`${SUPABASE_URL}/rest/v1/partners?id=eq.${partner.id}`, {
        method: 'PATCH',
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ paypal_email: paymentEmail }),
      });
      if (res.ok) {
        setPartner({ ...partner, payment_email: paymentEmail });
        setPaymentSaved(true);
      }
    } catch (e) { console.error(e); }
    finally { setSavingPayment(false); }
  };

  const copyLink = () => { navigator.clipboard.writeText(referralLink); };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'trial': return '#f59e0b';
      case 'churned': return '#ef4444';
      case 'pending': return '#6366f1';
      case 'paid': return '#22c55e';
      default: return '#64748b';
    }
  };

  const planLabel = (plan: string) => {
    switch (plan) {
      case 'starter': return 'Starter ($19/mo)';
      case 'pro': return 'Pro ($39/mo)';
      case 'growth': return 'Growth ($79/mo)';
      default: return plan;
    }
  };

  const payoutReady = (stats?.pendingEarnings || 0) >= MIN_PAYOUT;
  const pendingBelowThreshold = (stats?.pendingEarnings || 0) > 0 && (stats?.pendingEarnings || 0) < MIN_PAYOUT;

  // Login screen
  if (!loggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '48px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>Partner Dashboard</h1>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Enter your referral code to access your dashboard</p>
          {error && <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '14px', color: '#dc2626' }}>{error}</div>}
          <div className="form-group">
            <input type="text" className="input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter your referral code" style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '2px' }} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleLogin()} disabled={loading}>
            {loading ? 'Loading...' : 'Access Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>ShepherdAI Partner Dashboard</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Welcome, {partner?.name}</p>
          </div>
          <button onClick={() => { setLoggedIn(false); setCode(''); }} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px' }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Referrals', value: stats?.totalReferrals || 0, color: '#1e3a5f' },
            { label: 'Active Clients', value: stats?.activeClients || 0, color: '#22c55e' },
            { label: 'This Month', value: `$${(stats?.thisMonthEarnings || 0).toFixed(2)}`, color: '#f59e0b' },
            { label: 'Total Earned', value: `$${(stats?.totalEarnings || 0).toFixed(2)}`, color: '#6366f1' },
            { label: 'Pending Payout', value: `$${(stats?.pendingEarnings || 0).toFixed(2)}`, color: payoutReady ? '#22c55e' : '#f59e0b' },
            { label: 'Paid Out', value: `$${(stats?.paidEarnings || 0).toFixed(2)}`, color: '#64748b' },
          ].map((card, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px' }}>{card.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Payout Status Banner */}
        {payoutReady && (
          <div style={{ background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>&#9989;</span>
            <div>
              <div style={{ fontWeight: '600', color: '#16a34a' }}>Payout Ready!</div>
              <div style={{ fontSize: '13px', color: '#15803d' }}>Your pending commissions of ${(stats?.pendingEarnings || 0).toFixed(2)} meet the $50 minimum threshold and will be paid this cycle.</div>
            </div>
          </div>
        )}
        {pendingBelowThreshold && (
          <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>&#9203;</span>
            <div>
              <div style={{ fontWeight: '600', color: '#b45309' }}>Below Minimum Payout</div>
              <div style={{ fontSize: '13px', color: '#92400e' }}>Your pending commissions of ${(stats?.pendingEarnings || 0).toFixed(2)} are below the $50 minimum. They will accumulate until the threshold is met.</div>
            </div>
          </div>
        )}

        {/* Referral Link */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div style={{ fontWeight: '600', color: '#1e3a5f', marginBottom: '12px' }}>Your Referral Link</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="text" readOnly value={referralLink} style={{ flex: 1, padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', fontSize: '14px', color: '#1e3a5f' }} />
            <button onClick={copyLink} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Copy Link</button>
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>Share this link with churches. When they sign up through your link, they&apos;ll be automatically tracked as your referral.</div>
        </div>

        {/* Payment Email */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div style={{ fontWeight: '600', color: '#1e3a5f', marginBottom: '12px' }}>Payment Email (for commission payouts)</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="email" value={paymentEmail} onChange={(e) => { setPaymentEmail(e.target.value); setPaymentSaved(false); }} placeholder="your-payment@email.com" className="input" style={{ flex: 1 }} />
            <button onClick={savePayment} className="btn-secondary" style={{ whiteSpace: 'nowrap' }} disabled={savingPayment}>{savingPayment ? 'Saving...' : paymentSaved ? 'Saved!' : 'Save'}</button>
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>Commissions are paid via Wise. Please register a free account at wise.com and enter your Wise email. Minimum payout: $50/month. Transfer fees are deducted from your commission.</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '0' }}>
          <button onClick={() => setActiveTab('referrals')} style={{ padding: '12px 24px', background: activeTab === 'referrals' ? 'white' : '#f1f5f9', color: activeTab === 'referrals' ? '#1e3a5f' : '#64748b', border: '1px solid #e2e8f0', borderBottom: activeTab === 'referrals' ? 'none' : '1px solid #e2e8f0', borderRadius: '8px 8px 0 0', fontWeight: activeTab === 'referrals' ? '600' : '400', cursor: 'pointer' }}>
            Referrals ({referrals.length})
          </button>
          <button onClick={() => setActiveTab('commissions')} style={{ padding: '12px 24px', background: activeTab === 'commissions' ? 'white' : '#f1f5f9', color: activeTab === 'commissions' ? '#1e3a5f' : '#64748b', border: '1px solid #e2e8f0', borderBottom: activeTab === 'commissions' ? 'none' : '1px solid #e2e8f0', borderRadius: '8px 8px 0 0', fontWeight: activeTab === 'commissions' ? '600' : '400', cursor: 'pointer' }}>
            Commissions ({commissions.length})
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ background: 'white', borderRadius: '0 0 12px 12px', border: '1px solid #e2e8f0', borderTop: 'none', overflow: 'hidden' }}>
          {activeTab === 'referrals' ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Church</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Plan</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b', fontWeight: '600' }}>Commission</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Since</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#999' }}>No referrals yet. Share your link to start earning!</td></tr>
                  ) : referrals.map((ref) => (
                    <tr key={ref.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '500' }}>{ref.referred_church || '\u2014'}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{ref.referred_email}</td>
                      <td style={{ padding: '12px 16px' }}>{ref.plan ? planLabel(ref.plan) : '\u2014'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: `${statusColor(ref.status)}15`, color: statusColor(ref.status), padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>{ref.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#1e3a5f' }}>${ref.total_commission.toFixed(2)}</td>
                      <td style={{ padding: '12px 16px', color: '#999', fontSize: '13px' }}>{new Date(ref.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Client</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Month</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Rate</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Plan Price</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b', fontWeight: '600' }}>Commission</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#999' }}>No commissions yet. Commissions are calculated on the 1st of each month.</td></tr>
                  ) : commissions.map((comm) => (
                    <tr key={comm.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px' }}>{comm.referral?.referred_church || comm.referral?.referred_email || '\u2014'}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '500' }}>Month {comm.month_number}</td>
                      <td style={{ padding: '12px 16px' }}>{(comm.commission_rate * 100).toFixed(0)}%</td>
                      <td style={{ padding: '12px 16px' }}>${comm.plan_price.toFixed(2)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#1e3a5f' }}>${comm.amount.toFixed(2)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: `${statusColor(comm.status)}15`, color: statusColor(comm.status), padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>{comm.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#999', fontSize: '13px' }}>{new Date(comm.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Commission Schedule + Payout Rules */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '24px' }}>
          {/* Commission Schedule */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: '600', color: '#1e3a5f', marginBottom: '12px' }}>Commission Schedule</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[1,2,3,4,5,6,7,8].map(m => (
                <div key={m} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Mo {m}</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f' }}>{[80,70,60,50,40,30,20,10][m-1]}%</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>After month 8, commissions stop. Find new clients to keep earning!</div>
          </div>

          {/* Payout Rules */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: '600', color: '#1e3a5f', marginBottom: '12px' }}>Payout Rules</div>
            <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#f59e0b', fontSize: '16px', flexShrink: 0 }}>&#128176;</span>
                <span><strong>Monthly settlement</strong> on the 1st of each month</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#22c55e', fontSize: '16px', flexShrink: 0 }}>&#9989;</span>
                <span><strong>Minimum payout: $50</strong> &mdash; below $50 accumulates to next month</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#6366f1', fontSize: '16px', flexShrink: 0 }}>&#128179;</span>
                <span><strong>Transfer fees</strong> deducted from commission</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#1e3a5f', fontSize: '16px', flexShrink: 0 }}>&#128231;</span>
                <span>Paid to your registered payment email</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
              Plans: Starter $19/mo &middot; Pro $39/mo &middot; Growth $79/mo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
