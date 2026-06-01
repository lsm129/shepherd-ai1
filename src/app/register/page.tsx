'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DENOMINATIONS, CONGREGATION_SIZES, WORSHIP_STYLES } from '@/lib/church-profile';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


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


export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<UserRole>('pastor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setStep(role === 'congregant' ? 3 : 2);
  };

  const verifyChurchCode = async (code: string) => {
    if (!code.trim()) { setChurchCodeValid(null); setChurchCodeChurch(''); return; }
    setVerifyingCode(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      if (!supabaseUrl || !supabaseAnonKey) { setVerifyingCode(false); return; }
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: referral } = await supabase.from('referrals').select('referrer_id, referral_code').eq('referral_code', code.trim()).single();
      if (referral) {
        const { data: churchData } = await supabase.from('church_settings').select('church_name').eq('user_id', referral.referrer_id).single();
        setChurchCodeValid(true);
        setChurchCodeChurch(churchData?.church_name || 'Unknown Church');
      } else { setChurchCodeValid(false); setChurchCodeChurch(''); }
    } catch { setChurchCodeValid(false); setChurchCodeChurch(''); }
    finally { setVerifyingCode(false); }
  };

  const handleSubmitPastor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchName.trim()) { setError('Church name is required'); return; }
    if (!pastorName.trim()) { setError('Your name is required'); return; }
    if (!denomination) { setError('Denomination is required'); return; }
    if (!congregationSize) { setError('Congregation size is required'); return; }
    if (!worshipStyle) { setError('Worship style is required'); return; }
    if (!addressCity.trim()) { setError('City is required'); return; }
    if (!addressState) { setError('State is required'); return; }
    if (!addressZip.trim()) { setError('ZIP code is required'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, password, role: 'pastor',
          metadata: {
            church_name: churchName, pastor_name: pastorName,
            denomination, congregation_size: congregationSize, worship_style: worshipStyle,
            address_city: addressCity.trim(), address_state: addressState, address_zip: addressZip.trim(),
            diagnosis_pending: true, referred_by: refCode || null,
          },
        }),
      });
      const result = await res.json();
      if (!res.ok) { throw new Error(result.error || 'Registration failed'); }
      setSuccess(true);
    } catch (err: any) { setError(err.message || 'Failed to create account'); }
    finally { setLoading(false); }
  };

  const handleSubmitCongregant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!congregantName.trim()) { setError('Your name is required'); return; }
    if (!congregantCity.trim()) { setError('City is required'); return; }
    if (!congregantState) { setError('State is required'); return; }
    if (!congregantZip.trim()) { setError('ZIP code is required'); return; }
    if (churchCode.trim() && churchCodeValid === false) { setError('Invalid church invitation code'); return; }
    setError(''); setLoading(true);
    try {
      const metadata: any = {
        full_name: congregantName.trim(),
        address_city: congregantCity.trim(), address_state: congregantState, address_zip: congregantZip.trim(),
        diagnosis_pending: true,
      };
      if (churchCode.trim() && churchCodeValid) {
        metadata.church_code = churchCode.trim();
        metadata.referred_by = churchCode.trim();
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'congregant', metadata }),
      });
      const result = await res.json();
      if (!res.ok) { throw new Error(result.error || 'Registration failed'); }
      setSuccess(true);
    } catch (err: any) { setError(err.message || 'Failed to create account'); }
    finally { setLoading(false); }
  };

  if (!mounted) return null;

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Check Your Email!</h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>Please check your email to confirm your account, then sign in. If you don't see it, check your spam folder.</p>
          </div>
        </div>
      </div>
    );
  }

  const selectStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', background: '#fff', appearance: 'auto' as const };
  const req = <span style={{ color: '#dc2626', marginLeft: '2px' }}>*</span>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ width: '100%', maxWidth: mobile ? '100%' : '460px', padding: mobile ? '16px' : '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#1e3a5f"/><path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/><path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
          </Link>
        </div>
        <div className="card" style={{ padding: mobile ? '20px' : '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
            <div style={{ width: step >= 1 ? '32px' : '24px', height: '4px', borderRadius: '2px', background: step >= 1 ? '#1e3a5f' : '#ddd' }}></div>
            <div style={{ width: step >= 2 ? '32px' : '24px', height: '4px', borderRadius: '2px', background: step >= 2 ? '#1e3a5f' : '#ddd' }}></div>
            <div style={{ width: step >= 3 ? '32px' : '24px', height: '4px', borderRadius: '2px', background: step >= 3 ? '#1e3a5f' : '#ddd' }}></div>
          </div>
          <h1 style={{ fontSize: mobile ? '20px' : '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' }}>
            {step === 1 ? 'Create Your Account' : step === 2 ? 'Tell Us About Your Church' : 'Join Your Church'}
          </h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px', fontSize: '14px' }}>
            {step === 1 ? 'Start free, upgrade anytime' : step === 2 ? 'This helps AI tailor content for your congregation' : 'Find your church and join the community'}
          </p>
          {refCode && step === 1 && (
            <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px', marginBottom: '20px', textAlign: 'center', fontSize: '14px', color: '#92400e' }}>
              🎁 You were referred! You and your friend will each get <strong>50 bonus points</strong>.
            </div>
          )}
          {error && <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginBottom: '24px', fontSize: '14px', color: '#dc2626' }}>{error}</div>}
          {step === 1 ? (
            <form onSubmit={handleStep1}>
              <div className="form-group">
                <label className="form-label">I am a...{req}</label>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                  <button type="button" onClick={() => setRole('pastor')} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: role === 'pastor' ? '2px solid #1e3a5f' : '2px solid #ddd', background: role === 'pastor' ? 'rgba(30,58,95,0.05)' : 'white', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '4px' }}>⛪</div>
                    <div style={{ fontWeight: '700', color: '#1e3a5f', fontSize: '14px' }}>Pastor</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>I manage a church</div>
                  </button>
                  <button type="button" onClick={() => setRole('congregant')} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: role === 'congregant' ? '2px solid #1e3a5f' : '2px solid #ddd', background: role === 'congregant' ? 'rgba(30,58,95,0.05)' : 'white', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '4px' }}>🙋</div>
                    <div style={{ fontWeight: '700', color: '#1e3a5f', fontSize: '14px' }}>Church Member</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>I join a church</div>
                  </button>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Email{req}</label><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
              <div className="form-group"><label className="form-label">Password{req}</label><input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required /></div>
              <div className="form-group"><label className="form-label">Confirm Password{req}</label><input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required /></div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>{role === 'pastor' ? 'Next: Church Info →' : 'Next: Your Info →'}</button>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleSubmitPastor}>
              <div className="form-group"><label className="form-label">Church Name{req}</label><input type="text" className="input" value={churchName} onChange={(e) => setChurchName(e.target.value)} placeholder="Grace Community Church" required /></div>
              <div className="form-group"><label className="form-label">Your Name{req}</label><input type="text" className="input" value={pastorName} onChange={(e) => setPastorName(e.target.value)} placeholder="Pastor John Smith" required /></div>
              <div className="form-group"><label className="form-label">Denomination{req}</label><select style={selectStyle} value={denomination} onChange={(e) => setDenomination(e.target.value)} required><option value="">Select your denomination</option>{DENOMINATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Congregation Size{req}</label><select style={selectStyle} value={congregationSize} onChange={(e) => setCongregationSize(e.target.value)} required><option value="">Select size</option>{CONGREGATION_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Worship Style{req}</label><select style={selectStyle} value={worshipStyle} onChange={(e) => setWorshipStyle(e.target.value)} required><option value="">Select style</option>{WORSHIP_STYLES.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}</select></div>
              <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '8px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>📍 Church address — shown on your community page so members can find you</p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 140px' }} className="form-group"><label className="form-label">City{req}</label><input type="text" className="input" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} placeholder="Houston" required /></div>
                  <div style={{ flex: '1 1 80px' }} className="form-group"><label className="form-label">State{req}</label><select style={selectStyle} value={addressState} onChange={(e) => setAddressState(e.target.value)} required><option value="">State</option>{US_STATES.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}</select></div>
                  <div style={{ flex: '1 1 80px' }} className="form-group"><label className="form-label">ZIP{req}</label><input type="text" className="input" value={addressZip} onChange={(e) => setAddressZip(e.target.value)} placeholder="77001" required /></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn-primary" style={{ flex: 1, background: '#6b7280' }} onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitCongregant}>
              <div className="form-group"><label className="form-label">Your Full Name{req}</label><input type="text" className="input" value={congregantName} onChange={(e) => setCongregantName(e.target.value)} placeholder="Jane Smith" required /></div>
              <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '8px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>📍 Your location — helps find churches near you</p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 140px' }} className="form-group"><label className="form-label">City{req}</label><input type="text" className="input" value={congregantCity} onChange={(e) => setCongregantCity(e.target.value)} placeholder="Houston" required /></div>
                  <div style={{ flex: '1 1 80px' }} className="form-group"><label className="form-label">State{req}</label><select style={selectStyle} value={congregantState} onChange={(e) => setCongregantState(e.target.value)} required><option value="">State</option>{US_STATES.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}</select></div>
                  <div style={{ flex: '1 1 80px' }} className="form-group"><label className="form-label">ZIP{req}</label><input type="text" className="input" value={congregantZip} onChange={(e) => setCongregantZip(e.target.value)} placeholder="77001" required /></div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Church Invitation Code <span style={{ color: '#16a34a', fontWeight: 'normal', fontSize: '12px' }}> (optional)</span></label>
                <input type="text" className="input" value={churchCode} onChange={(e) => { setChurchCode(e.target.value); setChurchCodeValid(null); setChurchCodeChurch(''); }} onBlur={() => verifyChurchCode(churchCode)} placeholder="e.g. SHEP-ABC123" />
                {verifyingCode && <div style={{ fontSize: '13px', color: '#6366f1', marginTop: '4px' }}>Verifying...</div>}
                {churchCodeValid === true && <div style={{ fontSize: '13px', color: '#16a34a', marginTop: '4px', background: '#f0fdf4', padding: '8px 12px', borderRadius: '6px', border: '1px solid #22c55e' }}>✅ Found: <strong>{churchCodeChurch}</strong></div>}
                {churchCodeValid === false && <div style={{ fontSize: '13px', color: '#dc2626', marginTop: '4px', background: '#fef2f2', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ef4444' }}>❌ Invalid code. Enter your church code to join your community and earn 50 bonus points.</div>}
                <div style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>Enter your church code to join your community and earn 50 bonus points</div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn-primary" style={{ flex: 1, background: '#6b7280' }} onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
              </div>
            </form>
          )}
          <div style={{ textAlign: 'center', marginTop: '24px', color: '#666', fontSize: '14px' }}>Already have an account?{' '}<Link href="/login" style={{ color: '#1e3a5f', fontWeight: '600' }}>Sign in</Link></div>
        </div>
      </div>
    </div>
  );
}
