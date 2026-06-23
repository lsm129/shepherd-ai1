'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DENOMINATIONS, CONGREGATION_SIZES, WORSHIP_STYLES } from '@/lib/church-profile';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';
import { supabase } from '@/lib/supabase';
import { trackRegistered } from '@/lib/analytics';

type UserRole = 'pastor' | 'congregant';

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }, { value: 'DC', label: 'Washington D.C.' },
];

export { US_STATES };

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1.5px solid #e2e8f0', fontSize: '15px',
  outline: 'none', background: 'white', color: '#333',
};

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<UserRole>('pastor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [churchName, setChurchName] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [denomination, setDenomination] = useState('');
  const [congregationSize, setCongregationSize] = useState('');
  const [worshipStyle, setWorshipStyle] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressZip, setAddressZip] = useState('');
  const [congregantName, setCongregantName] = useState('');
  const [congregantCity, setCongregantCity] = useState('');
  const [congregantState, setCongregantState] = useState('');
  const [congregantZip, setCongregantZip] = useState('');
  const [churchCode, setChurchCode] = useState('');
  const [churchCodeValid, setChurchCodeValid] = useState<boolean | null>(null);
  const [churchCodeChurch, setChurchCodeChurch] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [mobile, setMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setRefCode(ref);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const verifyChurchCode = async (code: string) => {
    if (!code.trim()) { setChurchCodeValid(null); setChurchCodeChurch(''); return; }
    setVerifyingCode(true);
    try {
      const res = await fetch(`/api/referrals/validate?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (data.valid) {
        setChurchCodeValid(true);
        setChurchCodeChurch(data.churchName || 'Unknown Church');
      } else {
        setChurchCodeValid(false);
        setChurchCodeChurch('');
      }
    } catch { setChurchCodeValid(false); setChurchCodeChurch(''); }
    finally { setVerifyingCode(false); }
  };

  const doRegister = async (metadata: Record<string, any>) => {
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, metadata: { ...metadata, referred_by: refCode || null } }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Registration failed');
      trackRegistered(role, !!refCode);
      setSuccess(true);
    } catch (err: any) { setError(err.message || 'Failed to create account'); }
    finally { setLoading(false); }
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setStep(role === 'congregant' ? 3 : 2);
  };

  const handleSkipToDashboard = () => {
    doRegister({ diagnosis_pending: true, profile_incomplete: true });
  };

  const handleSubmitPastor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (churchCode.trim() && churchCodeValid === false) { setError('Invalid church invitation code'); return; }
    const metadata: any = {
      church_name: churchName.trim() || undefined,
      pastor_name: pastorName.trim() || undefined,
      denomination: denomination || undefined,
      congregation_size: congregationSize || undefined,
      worship_style: worshipStyle || undefined,
      address_city: addressCity.trim() || undefined,
      address_state: addressState || undefined,
      address_zip: addressZip.trim() || undefined,
      diagnosis_pending: true,
      ...(churchCode.trim() && churchCodeValid ? { church_code: churchCode.trim(), referred_by: churchCode.trim() } : {}),
    };
    doRegister(metadata);
  };

  const handleSubmitCongregant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (churchCode.trim() && churchCodeValid === false) { setError('Invalid church invitation code'); return; }
    const metadata: any = {
      full_name: congregantName.trim() || undefined,
      address_city: congregantCity.trim() || undefined,
      address_state: congregantState || undefined,
      address_zip: congregantZip.trim() || undefined,
      diagnosis_pending: true,
      ...(churchCode.trim() && churchCodeValid ? { church_code: churchCode.trim(), referred_by: churchCode.trim() } : {}),
    };
    doRegister(metadata);
  };

  const handleGoogleSignUp = async () => {
    try {
      setError('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });
      if (error) {
        setError(error.message || 'Google sign-up failed');
      }
    } catch {
      setError('Google sign-up not available yet. Please use email.');
    }
  };

  if (!mounted) return null;

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534', marginBottom: '8px' }}>Account Created!</h1>
          <p style={{ color: '#166534', marginBottom: '24px', lineHeight: '1.6' }}>
            Check your email to verify your account, then sign in to get started.
          </p>
          <Link href="/login" style={{ display: 'inline-block', padding: '12px 32px', borderRadius: '10px', background: '#1e3a5f', color: 'white', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}>
            Go to Sign In →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '460px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link href="/" style={{ fontSize: '24px', fontWeight: '800', color: '#1e3a5f', textDecoration: 'none' }}>ShepherdAI</Link>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
            <div style={{ height: '4px', flex: 1, borderRadius: '2px', background: step >= 1 ? '#1e3a5f' : '#ddd' }}></div>
            <div style={{ height: '4px', flex: 1, borderRadius: '2px', background: step >= 2 ? '#1e3a5f' : '#ddd' }}></div>
            <div style={{ height: '4px', flex: 1, borderRadius: '2px', background: step >= 3 ? '#1e3a5f' : '#ddd' }}></div>
          </div>

          <h1 style={{ fontSize: mobile ? '20px' : '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' }}>
            {step === 1 ? 'Create Your Account' : step === 2 ? 'About Your Church' : 'About You'}
          </h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '14px' }}>
            {step === 1 ? 'Free forever. No credit card.' : step === 2 ? 'Optional — you can fill this in later' : 'Optional — you can fill this in later'}
          </p>

          {refCode && step === 1 && (
            <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '10px', marginBottom: '16px', textAlign: 'center', fontSize: '14px', color: '#92400e' }}>
              🎁 You were referred! Both you and your friend get <strong>50 bonus points</strong>.
            </div>
          )}

          {error && <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '14px', color: '#dc2626' }}>{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleStep1}>
              {/* Google Sign Up */}
              <button type="button" onClick={handleGoogleSignUp} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '12px', transition: 'all 0.15s' }}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>or use email</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
              </div>

              {/* Role selection */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setRole('pastor')} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: role === 'pastor' ? '2px solid #1e3a5f' : '2px solid #ddd', background: role === 'pastor' ? 'rgba(30,58,95,0.05)' : 'white', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '4px' }}>⛪</div>
                    <div style={{ fontWeight: '700', color: '#1e3a5f', fontSize: '14px' }}>Pastor</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>I manage a church</div>
                  </button>
                  <button type="button" onClick={() => setRole('congregant')} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: role === 'congregant' ? '2px solid #1e3a5f' : '2px solid #ddd', background: role === 'congregant' ? 'rgba(30,58,95,0.05)' : 'white', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '4px' }}>🙋</div>
                    <div style={{ fontWeight: '700', color: '#1e3a5f', fontSize: '14px' }}>Church Member</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>I join a church</div>
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>Password *</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
                {role === 'pastor' ? 'Next: Church Info →' : 'Next: Your Info →'}
              </button>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleSubmitPastor}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>Church Name</label>
                <input type="text" value={churchName} onChange={(e) => setChurchName(e.target.value)} placeholder="Grace Community Church" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>Your Name</label>
                <input type="text" value={pastorName} onChange={(e) => setPastorName(e.target.value)} placeholder="Pastor John Smith" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>Denomination</label>
                <select style={selectStyle} value={denomination} onChange={(e) => setDenomination(e.target.value)}>
                  <option value="">Select denomination</option>
                  {DENOMINATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <div style={{ flex: '1 1 140px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>Congregation Size</label>
                  <select style={selectStyle} value={congregationSize} onChange={(e) => setCongregationSize(e.target.value)}>
                    <option value="">Select size</option>
                    {CONGREGATION_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div style={{ flex: '1 1 140px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>Worship Style</label>
                  <select style={selectStyle} value={worshipStyle} onChange={(e) => setWorshipStyle(e.target.value)}>
                    <option value="">Select style</option>
                    {WORSHIP_STYLES.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #eee', paddingTop: '14px', marginBottom: '14px' }}>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>📍 Church address (optional)</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 120px' }}>
                    <input type="text" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} placeholder="City" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: '0 0 70px' }}>
                    <select style={{ ...selectStyle, padding: '10px 8px', fontSize: '14px' }} value={addressState} onChange={(e) => setAddressState(e.target.value)}>
                      <option value="">State</option>
                      {US_STATES.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: '0 0 80px' }}>
                    <input type="text" value={addressZip} onChange={(e) => setAddressZip(e.target.value)} placeholder="ZIP" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>Invitation Code <span style={{ fontWeight: 'normal', fontSize: '12px', color: '#94a3b8' }}>(optional)</span></label>
                <input type="text" value={churchCode} onChange={(e) => { setChurchCode(e.target.value); setChurchCodeValid(null); setChurchCodeChurch(''); }} onBlur={() => verifyChurchCode(churchCode)} placeholder="e.g. B8F83A26" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
                {verifyingCode && <div style={{ fontSize: '13px', color: '#6366f1', marginTop: '4px' }}>Verifying...</div>}
                {churchCodeValid === true && <div style={{ fontSize: '13px', color: '#16a34a', marginTop: '4px', background: '#f0fdf4', padding: '6px 10px', borderRadius: '6px' }}>✅ {churchCodeChurch}</div>}
                {churchCodeValid === false && <div style={{ fontSize: '13px', color: '#dc2626', marginTop: '4px', background: '#fef2f2', padding: '6px 10px', borderRadius: '6px' }}>❌ Invalid code</div>}
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>← Back</button>
                <button type="button" onClick={handleSkipToDashboard} disabled={loading} style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>
                  Skip, fill in later →
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitCongregant}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>Your Name</label>
                <input type="text" value={congregantName} onChange={(e) => setCongregantName(e.target.value)} placeholder="Jane Smith" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ borderTop: '1px solid #eee', paddingTop: '14px', marginBottom: '14px' }}>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>📍 Your location (optional)</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 120px' }}>
                    <input type="text" value={congregantCity} onChange={(e) => setCongregantCity(e.target.value)} placeholder="City" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: '0 0 70px' }}>
                    <select style={{ ...selectStyle, padding: '10px 8px', fontSize: '14px' }} value={congregantState} onChange={(e) => setCongregantState(e.target.value)}>
                      <option value="">State</option>
                      {US_STATES.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: '0 0 80px' }}>
                    <input type="text" value={congregantZip} onChange={(e) => setCongregantZip(e.target.value)} placeholder="ZIP" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>Church Invitation Code <span style={{ fontWeight: 'normal', fontSize: '12px', color: '#94a3b8' }}>(optional)</span></label>
                <input type="text" value={churchCode} onChange={(e) => { setChurchCode(e.target.value); setChurchCodeValid(null); setChurchCodeChurch(''); }} onBlur={() => verifyChurchCode(churchCode)} placeholder="e.g. SHEP-ABC123" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
                {verifyingCode && <div style={{ fontSize: '13px', color: '#6366f1', marginTop: '4px' }}>Verifying...</div>}
                {churchCodeValid === true && <div style={{ fontSize: '13px', color: '#16a34a', marginTop: '4px', background: '#f0fdf4', padding: '6px 10px', borderRadius: '6px' }}>✅ {churchCodeChurch}</div>}
                {churchCodeValid === false && <div style={{ fontSize: '13px', color: '#dc2626', marginTop: '4px', background: '#fef2f2', padding: '6px 10px', borderRadius: '6px' }}>❌ Invalid code</div>}
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>← Back</button>
                <button type="button" onClick={handleSkipToDashboard} disabled={loading} style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>
                  Skip, fill in later →
                </button>
              </div>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#1e3a5f', fontWeight: '600' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
