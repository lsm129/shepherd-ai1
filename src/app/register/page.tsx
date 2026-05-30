'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DENOMINATIONS, CONGREGATION_SIZES, WORSHIP_STYLES } from '@/lib/church-profile';

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [churchName, setChurchName] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [denomination, setDenomination] = useState('');
  const [congregationSize, setCongregationSize] = useState('');
  const [worshipStyle, setWorshipStyle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refCode, setRefCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setRefCode(ref);
  }, []);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchName.trim()) { setError('Church name is required'); return; }
    setError('');
    setLoading(true);

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) { setError('System not configured.'); setLoading(false); return; }
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            referred_by: refCode || null,
            church_name: churchName,
            pastor_name: pastorName,
            denomination: denomination,
            congregation_size: congregationSize,
            worship_style: worshipStyle,
          }
        }
      });
      if (error) throw error;

      // Save church settings
      if (data.user) {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );
        await supabaseAdmin.from('church_settings').upsert({
          user_id: data.user.id,
          church_name: churchName,
          pastor_name: pastorName,
          denomination: denomination,
          congregation_size: congregationSize,
          worship_style: worshipStyle,
        });

        // Referral handling
        if (refCode) {
          try {
            const { data: referrer } = await supabase.from('referrals').select('referrer_id, referral_code').eq('referral_code', refCode).single();
            if (referrer) {
              await supabase.from('referrals').update({
                referred_email: email,
                referred_id: data.user.id,
                status: 'completed',
              }).eq('referral_code', refCode).is('referred_id', null);

              const REFERRAL_BONUS_POINTS = 2000;
              const supabaseAdm = (await import('@supabase/supabase-js')).createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY || ''
              );
              try {
                const { data: rp } = await supabaseAdm.from('profiles').select('points_balance').eq('id', referrer.referrer_id).single();
                if (rp) {
                  const nb = (rp.points_balance || 0) + REFERRAL_BONUS_POINTS;
                  await supabaseAdm.from('profiles').update({ points_balance: nb }).eq('id', referrer.referrer_id);
                  await supabaseAdm.from('points_transactions').insert({ user_id: referrer.referrer_id, action: 'referral_bonus', points: REFERRAL_BONUS_POINTS, balance_after: nb, description: 'Referral bonus: friend signed up' });
                }
              } catch (e) { console.error(e); }
              try {
                const { data: rep } = await supabaseAdm.from('profiles').select('points_balance').eq('id', data.user.id).single();
                if (rep) {
                  const nb = (rep.points_balance || 0) + REFERRAL_BONUS_POINTS;
                  await supabaseAdm.from('profiles').update({ points_balance: nb }).eq('id', data.user.id);
                  await supabaseAdm.from('points_transactions').insert({ user_id: data.user.id, action: 'referral_bonus', points: REFERRAL_BONUS_POINTS, balance_after: nb, description: 'Referral bonus: signed up via referral' });
                }
              } catch (e) { console.error(e); }
            }
          } catch (e) { console.error(e); }
        }
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Check Your Email</h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
            <Link href="/login" className="btn-primary">Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  const selectStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', background: '#fff', appearance: 'auto' as const };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ width: '100%', maxWidth: '460px', padding: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="#1e3a5f"/>
              <path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/>
              <path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
          </Link>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
            <div style={{ width: step >= 1 ? '32px' : '24px', height: '4px', borderRadius: '2px', background: step >= 1 ? '#1e3a5f' : '#ddd', transition: 'all 0.3s' }}></div>
            <div style={{ width: step >= 2 ? '32px' : '24px', height: '4px', borderRadius: '2px', background: step >= 2 ? '#1e3a5f' : '#ddd', transition: 'all 0.3s' }}></div>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' }}>
            {step === 1 ? 'Create Your Account' : 'Tell Us About Your Church'}
          </h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px', fontSize: '14px' }}>
            {step === 1 ? 'Start free, upgrade anytime' : 'This helps AI tailor content for your congregation'}
          </p>

          {refCode && step === 1 && (
            <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px', marginBottom: '20px', textAlign: 'center', fontSize: '14px', color: '#92400e' }}>
              🎁 You were referred! You and your friend will each get <strong>2,000 bonus points</strong>.
            </div>
          )}

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginBottom: '24px', fontSize: '14px', color: '#dc2626' }}>
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pastor@church.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                Next: Church Info →
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Church Name *</label>
                <input type="text" className="input" value={churchName} onChange={(e) => setChurchName(e.target.value)} placeholder="Grace Community Church" required />
              </div>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input type="text" className="input" value={pastorName} onChange={(e) => setPastorName(e.target.value)} placeholder="Pastor John Smith" />
              </div>
              <div className="form-group">
                <label className="form-label">Denomination</label>
                <select style={selectStyle} value={denomination} onChange={(e) => setDenomination(e.target.value)}>
                  <option value="">Select your denomination</option>
                  {DENOMINATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Congregation Size</label>
                <select style={selectStyle} value={congregationSize} onChange={(e) => setCongregationSize(e.target.value)}>
                  <option value="">Select size</option>
                  {CONGREGATION_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Worship Style</label>
                <select style={selectStyle} value={worshipStyle} onChange={(e) => setWorshipStyle(e.target.value)}>
                  <option value="">Select style</option>
                  {WORSHIP_STYLES.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn-primary" style={{ flex: 1, background: '#6b7280' }} onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '24px', color: '#666', fontSize: '14px' }}>
            Already have an account? <Link href="/login" style={{ color: '#1e3a5f', fontWeight: '600' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
