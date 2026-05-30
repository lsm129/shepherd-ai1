'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DENOMINATIONS, CONGREGATION_SIZES, WORSHIP_STYLES } from '@/lib/church-profile';

type UserRole = 'pastor' | 'congregant';

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
    if (password !== confirmPassword) { setError('Passwords do not match / 密码不匹配'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters / 密码至少6位'); return; }
    setError('');
    if (role === 'congregant') {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const verifyChurchCode = async (code: string) => {
    if (!code.trim()) {
      setChurchCodeValid(null);
      setChurchCodeChurch('');
      return;
    }
    setVerifyingCode(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) { setVerifyingCode(false); return; }
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: referral } = await supabase
        .from('referrals')
        .select('referrer_id, referral_code')
        .eq('referral_code', code.trim())
        .single();
      if (referral) {
        const { data: churchData } = await supabase
          .from('church_settings')
          .select('church_name')
          .eq('user_id', referral.referrer_id)
          .single();
        setChurchCodeValid(true);
        setChurchCodeChurch(churchData?.church_name || 'Unknown Church');
      } else {
        setChurchCodeValid(false);
        setChurchCodeChurch('');
      }
    } catch {
      setChurchCodeValid(false);
      setChurchCodeChurch('');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmitPastor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchName.trim()) { setError('Church name is required / 教会名称必填'); return; }
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
            role: 'pastor',
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
      setError(err.message || 'Failed to create account / 创建账号失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCongregant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchCode.trim()) { setError('Church invitation code is required / 教会邀请码必填'); return; }
    if (!churchCodeValid) { setError('Invalid church invitation code / 无效的教会邀请码'); return; }
    setError('');
    setLoading(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) { setError('System not configured.'); setLoading(false); return; }
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: referral } = await supabase
        .from('referrals')
        .select('referrer_id')
        .eq('referral_code', churchCode.trim())
        .single();
      if (!referral) throw new Error('Invalid church code / 无效的教会邀请码');
      const pastorUserId = referral.referrer_id;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'congregant',
            church_code: churchCode.trim(),
            joined_churches: [pastorUserId],
          }
        }
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create account / 创建账号失败');
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
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Check Your Email / 查收邮件</h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
              <br />我们已向 <strong>{email}</strong> 发送确认链接，请点击激活账号。
            </p>
            <Link href="/login" className="btn-primary">Back to Login / 返回登录</Link>
          </div>
        </div>
      </div>
    );
  }

  const selectStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', background: '#fff', appearance: 'auto' as const };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ width: '100%', maxWidth: mobile ? '100%' : '460px', padding: mobile ? '16px' : '24px' }}>
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

        <div className="card" style={{ padding: mobile ? '20px' : '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
            <div style={{ width: step >= 1 ? '32px' : '24px', height: '4px', borderRadius: '2px', background: step >= 1 ? '#1e3a5f' : '#ddd', transition: 'all 0.3s' }}></div>
            <div style={{ width: step >= 2 ? '32px' : '24px', height: '4px', borderRadius: '2px', background: step >= 2 ? '#1e3a5f' : '#ddd', transition: 'all 0.3s' }}></div>
            <div style={{ width: step >= 3 ? '32px' : '24px', height: '4px', borderRadius: '2px', background: step >= 3 ? '#1e3a5f' : '#ddd', transition: 'all 0.3s' }}></div>
          </div>

          <h1 style={{ fontSize: mobile ? '20px' : '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' }}>
            {step === 1 ? 'Create Your Account / 创建账号' : step === 2 ? 'Tell Us About Your Church / 教会信息' : 'Join Your Church / 加入教会'}
          </h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px', fontSize: '14px' }}>
            {step === 1 ? 'Start free, upgrade anytime / 免费开始' : step === 2 ? 'This helps AI tailor content for your congregation / 帮助AI为您定制内容' : 'Enter your church invitation code / 输入教会邀请码'}
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
                <label className="form-label">I am a... / 我是... *</label>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setRole('pastor')}
                    style={{
                      flex: 1, padding: '16px', borderRadius: '12px', border: role === 'pastor' ? '2px solid #1e3a5f' : '2px solid #ddd',
                      background: role === 'pastor' ? 'rgba(30,58,95,0.05)' : 'white', cursor: 'pointer', textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '4px' }}>⛪</div>
                    <div style={{ fontWeight: '700', color: '#1e3a5f', fontSize: '14px' }}>Pastor / 牧师</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>I manage a church / 我管理教会</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('congregant')}
                    style={{
                      flex: 1, padding: '16px', borderRadius: '12px', border: role === 'congregant' ? '2px solid #1e3a5f' : '2px solid #ddd',
                      background: role === 'congregant' ? 'rgba(30,58,95,0.05)' : 'white', cursor: 'pointer', textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '4px' }}>🙋</div>
                    <div style={{ fontWeight: '700', color: '#1e3a5f', fontSize: '14px' }}>Church Member / 会众</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>I join a church / 我加入教会</div>
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email / 邮箱</label>
                <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Password / 密码</label>
                <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters / 至少6位" required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password / 确认密码</label>
                <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password / 确认密码" required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                {role === 'pastor' ? 'Next: Church Info → / 下一步：教会信息' : 'Next: Join Church → / 下一步：加入教会'}
              </button>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleSubmitPastor}>
              <div className="form-group">
                <label className="form-label">Church Name / 教会名称 *</label>
                <input type="text" className="input" value={churchName} onChange={(e) => setChurchName(e.target.value)} placeholder="Grace Community Church" required />
              </div>
              <div className="form-group">
                <label className="form-label">Your Name / 您的名字</label>
                <input type="text" className="input" value={pastorName} onChange={(e) => setPastorName(e.target.value)} placeholder="Pastor John Smith" />
              </div>
              <div className="form-group">
                <label className="form-label">Denomination / 教派</label>
                <select style={selectStyle} value={denomination} onChange={(e) => setDenomination(e.target.value)}>
                  <option value="">Select your denomination / 选择教派</option>
                  {DENOMINATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Congregation Size / 会众规模</label>
                <select style={selectStyle} value={congregationSize} onChange={(e) => setCongregationSize(e.target.value)}>
                  <option value="">Select size / 选择规模</option>
                  {CONGREGATION_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Worship Style / 敬拜风格</label>
                <select style={selectStyle} value={worshipStyle} onChange={(e) => setWorshipStyle(e.target.value)}>
                  <option value="">Select style / 选择风格</option>
                  {WORSHIP_STYLES.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn-primary" style={{ flex: 1, background: '#6b7280' }} onClick={() => setStep(1)}>
                  ← Back / 返回
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>
                  {loading ? 'Creating... / 创建中...' : 'Create Account / 创建账号'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitCongregant}>
              <div className="form-group">
                <label className="form-label">Church Invitation Code / 教会邀请码 *</label>
                <input
                  type="text"
                  className="input"
                  value={churchCode}
                  onChange={(e) => {
                    setChurchCode(e.target.value);
                    setChurchCodeValid(null);
                    setChurchCodeChurch('');
                  }}
                  onBlur={() => verifyChurchCode(churchCode)}
                  placeholder="e.g. SHEP-ABC123 / 例如 SHEP-ABC123"
                  required
                />
                {verifyingCode && (
                  <div style={{ fontSize: '13px', color: '#6366f1', marginTop: '4px' }}>Verifying... / 验证中...</div>
                )}
                {churchCodeValid === true && (
                  <div style={{ fontSize: '13px', color: '#16a34a', marginTop: '4px', background: '#f0fdf4', padding: '8px 12px', borderRadius: '6px', border: '1px solid #22c55e' }}>
                    ✅ Found: <strong>{churchCodeChurch}</strong> / 找到教会：<strong>{churchCodeChurch}</strong>
                  </div>
                )}
                {churchCodeValid === false && (
                  <div style={{ fontSize: '13px', color: '#dc2626', marginTop: '4px', background: '#fef2f2', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ef4444' }}>
                    ❌ Invalid code. Ask your pastor for the invitation code. / 无效邀请码，请向牧师索取。
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
                  Ask your pastor for the invitation code / 请向您的牧师索取邀请码
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn-primary" style={{ flex: 1, background: '#6b7280' }} onClick={() => setStep(1)}>
                  ← Back / 返回
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading || !churchCodeValid}>
                  {loading ? 'Creating... / 创建中...' : 'Create Account / 创建账号'}
                </button>
              </div>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '24px', color: '#666', fontSize: '14px' }}>
            Already have an account? / 已有账号？{' '}
            <Link href="/login" style={{ color: '#1e3a5f', fontWeight: '600' }}>Sign in / 登录</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
