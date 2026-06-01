'use client';

import { useState, useEffect } from 'react';
import { PLANS, type PlanId } from '@/lib/pricing';
import { DENOMINATIONS, CONGREGATION_SIZES, WORSHIP_STYLES } from '@/lib/church-profile';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


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

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [churchName, setChurchName] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [denomination, setDenomination] = useState('');
  const [congregationSize, setCongregationSize] = useState('');
  const [worshipStyle, setWorshipStyle] = useState('');
  const [emailSignature, setEmailSignature] = useState('');
  const [website, setWebsite] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressZip, setAddressZip] = useState('');
  const [missionStatement, setMissionStatement] = useState('');
  const [serviceTimes, setServiceTimes] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');
  const [churchLogo, setChurchLogo] = useState('');
  const [uploading, setUploading] = useState(false);
  const [subscribers, setSubscribers] = useState('');
  const [aiTone, setAiTone] = useState('warm');
  const [defaultSignoff, setDefaultSignoff] = useState('');

  const [currentPlan, setCurrentPlan] = useState<PlanId>('free');
  const [creemCustomerId, setCreemCustomerId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    setMounted(true);
    async function loadSettings() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-supabase-url') return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        setUserId(session.user.id);

        const { data: profile } = await supabase.from('profiles').select('plan, creem_customer_id').eq('id', session.user.id).single();
        if (profile) {
          setCurrentPlan((profile.plan as PlanId) || 'free');
          if (profile.creem_customer_id) setCreemCustomerId(profile.creem_customer_id);
        }

        const { data } = await supabase.from('church_settings').select('*').eq('user_id', session.user.id).single();
        if (data) {
          if (data.church_name) setChurchName(data.church_name);
          if (data.pastor_name) setPastorName(data.pastor_name);
          if (data.denomination) setDenomination(data.denomination);
          if (data.congregation_size) setCongregationSize(data.congregation_size);
          if (data.worship_style) setWorshipStyle(data.worship_style);
          if (data.email_signature) setEmailSignature(data.email_signature);
          if (data.website) setWebsite(data.website);
          if (data.mission_statement) setMissionStatement(data.mission_statement);
          if (data.service_times) setServiceTimes(data.service_times);
          if (data.social_facebook) setSocialFacebook(data.social_facebook);
          if (data.social_instagram) setSocialInstagram(data.social_instagram);
          if (data.social_youtube) setSocialYoutube(data.social_youtube);
          if (data.church_logo) setChurchLogo(data.church_logo);
          if (data.address) {
            const addr = data.address as string;
            const commaIdx = addr.indexOf(',');
            if (commaIdx > -1) {
              setAddressCity(addr.substring(0, commaIdx).trim());
              const rest = addr.substring(commaIdx + 1).trim();
              const spaceIdx = rest.indexOf(' ');
              if (spaceIdx > -1) { setAddressState(rest.substring(0, spaceIdx).trim()); setAddressZip(rest.substring(spaceIdx + 1).trim()); }
              else { setAddressState(rest); }
            } else { setAddressCity(addr); }
          }
          if (data.ai_tone) setAiTone(data.ai_tone);
          if (data.default_signoff) setDefaultSignoff(data.default_signoff);
        }
      } catch (e) {}
      const stored = localStorage.getItem('newsletter_subscribers');
      if (stored) setSubscribers(stored);
    }
    loadSettings();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !serviceKey) { setUploading(false); return; }
      const supabaseAdmin = createClient(supabaseUrl, serviceKey);
      const ext = file.name.split('.').pop() || 'png';
      const path = `logos/${userId}.${ext}`;
      const { error: uploadErr } = await supabaseAdmin.storage.from('church-assets').upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabaseAdmin.storage.from('church-assets').getPublicUrl(path);
      if (urlData?.publicUrl) {
        setChurchLogo(urlData.publicUrl);
        await supabaseAdmin.from('church_settings').update({ church_logo: urlData.publicUrl }).eq('user_id', userId);
      }
    } catch (err) { console.error('Logo upload error:', err); setError('Failed to upload logo'); }
    finally { setUploading(false); }
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { createClient } = await import('@supabase/supabase-js');
      if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url') {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const fullAddress = [addressCity, addressState, addressZip].filter(Boolean).join(', ');
          const { error: upsertError } = await supabase.from('church_settings').upsert({
            user_id: session.user.id, church_name: churchName, pastor_name: pastorName,
            denomination, congregation_size: congregationSize, worship_style: worshipStyle,
            email_signature: emailSignature, website, address: fullAddress,
            mission_statement: missionStatement, service_times: serviceTimes,
            social_facebook: socialFacebook, social_instagram: socialInstagram, social_youtube: socialYoutube,
            ai_tone: aiTone, default_signoff: defaultSignoff,
          }, { onConflict: 'user_id' });
          if (upsertError) throw upsertError;
          try {
            const { data: profile } = await supabase.from('profiles').select('profile_completed').eq('id', session.user.id).single();
            if (profile && !profile.profile_completed) {
              await supabase.from('profiles').update({ profile_completed: true }).eq('id', session.user.id);
              await fetch('/api/points/earn', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: session.user.id, action: 'complete_profile' }) });
            }
          } catch (ptsErr) { console.error(ptsErr); }
        }
      }
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to save settings'); }
    finally { setLoading(false); }
  }

  async function handleSubscribe(planId: string) {
    if (!userId) { window.location.href = '/login'; return; }
    setCheckoutLoading(planId);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      let userEmail = '';
      if (supabaseUrl && supabaseAnonKey) { const supabase = createClient(supabaseUrl, supabaseAnonKey); const { data: { session } } = await supabase.auth.getSession(); if (session?.user?.email) userEmail = session.user.email; }
      const response = await fetch('/api/creem/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId, userId, userEmail: userEmail || undefined, billingCycle }) });
      const data = await response.json();
      if (data.checkoutUrl) { window.location.href = data.checkoutUrl; } else { setError(data.error || 'Failed to create checkout session'); }
    } catch (err) { setError('Something went wrong.'); } finally { setCheckoutLoading(null); }
  }

  async function handleManageSubscription() {
    if (!userId) return; setPortalLoading(true);
    try {
      const response = await fetch('/api/creem/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
      const data = await response.json();
      if (data.portalUrl) { window.location.href = data.portalUrl; } else { setError(data.error || 'Failed to open subscription management'); }
    } catch (err) { setError('Failed to open subscription management'); } finally { setPortalLoading(false); }
  }

  if (!mounted) return null;

  const toneOptions = [
    { value: 'formal', label: 'Formal', desc: 'Professional and reverent tone, ideal for traditional congregations' },
    { value: 'warm', label: 'Warm & Friendly', desc: 'Approachable and caring, perfect for most churches' },
    { value: 'youth', label: 'Youth-Friendly', desc: 'Casual and energetic, great for youth groups and modern services' },
  ];
  const currentPlanData = PLANS[currentPlan];
  const selectStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', background: '#fff', appearance: 'auto' as const };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>⚙️ Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Update your church profile and subscription</p>
      </div>
      {saved && <div style={{ background: '#dcfce7', border: '1px solid #22c55e', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: '#16a34a' }}>✅ Settings saved successfully!</div>}
      {error && <div style={{ background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: '#dc2626' }}>{error}</div>}

      <div style={{ display: 'grid', gap: '24px' }}>
        {/* Subscription Plan */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Subscription Plan</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <span className="badge badge-primary" style={{ fontSize: '16px', padding: '8px 16px' }}>{currentPlanData.name} Plan</span>
            <span style={{ color: 'var(--text-secondary)' }}>{currentPlanData.generationsPerMonth === -1 ? 'Unlimited' : `${currentPlanData.generationsPerMonth}`} AI generations/mo</span>
          </div>
          {currentPlan !== 'free' && creemCustomerId && (
            <div style={{ marginBottom: '20px' }}>
              <button onClick={handleManageSubscription} disabled={portalLoading} className="btn-secondary" style={{ cursor: portalLoading ? 'wait' : 'pointer' }}>{portalLoading ? 'Opening...' : '🔄 Manage Subscription'}</button>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>Cancel, upgrade/downgrade, or update payment</p>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '10px', padding: '3px', gap: '3px' }}>
              <button onClick={() => setBillingCycle('monthly')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: billingCycle === 'monthly' ? 'white' : 'transparent', color: billingCycle === 'monthly' ? '#1e3a5f' : '#64748b', boxShadow: billingCycle === 'monthly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>Monthly</button>
              <button onClick={() => setBillingCycle('annual')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: billingCycle === 'annual' ? 'white' : 'transparent', color: billingCycle === 'annual' ? '#1e3a5f' : '#64748b', boxShadow: billingCycle === 'annual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>Annual <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>SAVE 20%</span></button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {Object.values(PLANS).map((plan) => {
              const isCurrent = plan.id === currentPlan; const isFree = plan.id === 'free'; const isAnnual = billingCycle === 'annual';
              const displayPrice = isFree ? 0 : (isAnnual && plan.annualPrice ? plan.annualPrice : plan.price); const priceSuffix = isFree ? '' : isAnnual ? '/yr' : '/mo';
              const annualSavings = plan.annualPrice ? plan.price * 12 - plan.annualPrice : 0; const annualAvailable = isAnnual && !isFree && plan.annualCreemProductId === '';
              return (
                <div key={plan.id} style={{ padding: '16px', borderRadius: '12px', border: isCurrent ? '2px solid var(--primary)' : '2px solid var(--border)', background: isCurrent ? 'rgba(30,58,95,0.04)' : 'white', opacity: isCurrent ? 0.7 : annualAvailable ? 0.5 : 1, position: 'relative' }}>
                  {isAnnual && !isFree && annualSavings > 0 && <div style={{ position: 'absolute', top: '-8px', right: '12px', background: '#16a34a', color: 'white', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px' }}>Save ${annualSavings}/yr</div>}
                  <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--text)' }}>{plan.name} {plan.highlighted && <span className="badge badge-primary" style={{ fontSize: '10px', padding: '2px 6px', marginLeft: '6px' }}>{plan.highlighted}</span>}</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '4px' }}>{isFree ? 'Free' : `$${displayPrice}${priceSuffix}`}</div>
                  {isAnnual && !isFree && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>≈ ${plan.price}/mo billed annually</div>}
                  {isCurrent ? <button className="btn-secondary" disabled style={{ width: '100%', fontSize: '13px' }}>Current Plan</button>
                    : isFree ? <button className="btn-secondary" disabled style={{ width: '100%', fontSize: '13px' }}>Free</button>
                    : annualAvailable ? <button className="btn-secondary" disabled style={{ width: '100%', fontSize: '13px' }}>Coming Soon</button>
                    : <button onClick={() => handleSubscribe(plan.id)} disabled={checkoutLoading === plan.id} className={plan.highlighted ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', fontSize: '13px', cursor: checkoutLoading === plan.id ? 'wait' : 'pointer' }}>{checkoutLoading === plan.id ? 'Redirecting...' : `Subscribe $${displayPrice}${priceSuffix}`}</button>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Voice & Tone */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>🎙️ Voice & Tone</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Control how ShepherdAI writes — match your church&apos;s personality</p>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
              {toneOptions.map((opt) => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '12px', cursor: 'pointer', border: aiTone === opt.value ? '2px solid var(--primary)' : '2px solid var(--border)', background: aiTone === opt.value ? 'rgba(30,58,95,0.04)' : 'white' }}>
                  <input type="radio" name="aiTone" value={opt.value} checked={aiTone === opt.value} onChange={(e) => setAiTone(e.target.value)} style={{ marginTop: '3px', accentColor: 'var(--primary)' }} />
                  <div><div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{opt.label}</div><div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{opt.desc}</div></div>
                </label>
              ))}
            </div>
            <div className="form-group"><label className="form-label">Default Sign-off</label><input type="text" className="input" value={defaultSignoff} onChange={(e) => setDefaultSignoff(e.target.value)} placeholder="Blessings, Pastor John" /><p className="form-hint">Automatically appended to AI-generated emails and newsletters</p></div>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>

        {/* Church Information */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Church Information</h2>
          <form onSubmit={handleSave}>
            {/* Logo Upload */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '12px', border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f9fafb', flexShrink: 0 }}>
                {churchLogo ? <img src={churchLogo} alt="Church Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '32px' }}>⛪</span>}
              </div>
              <div>
                <label style={{ cursor: 'pointer', display: 'inline-block', padding: '8px 16px', borderRadius: '8px', background: '#1e3a5f', color: 'white', fontSize: '13px', fontWeight: 600 }}>
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} disabled={uploading} />
                </label>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>PNG, JPG up to 2MB. Shown on your community page.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group"><label className="form-label">Church Name</label><input type="text" className="input" value={churchName} onChange={(e) => setChurchName(e.target.value)} placeholder="Grace Community Church" /></div>
              <div className="form-group"><label className="form-label">Pastor Name</label><input type="text" className="input" value={pastorName} onChange={(e) => setPastorName(e.target.value)} placeholder="Pastor John Smith" /></div>
              <div className="form-group"><label className="form-label">Denomination</label><select style={selectStyle} value={denomination} onChange={(e) => setDenomination(e.target.value)}><option value="">Select denomination</option>{DENOMINATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Congregation Size</label><select style={selectStyle} value={congregationSize} onChange={(e) => setCongregationSize(e.target.value)}><option value="">Select size</option>{CONGREGATION_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Worship Style</label><select style={selectStyle} value={worshipStyle} onChange={(e) => setWorshipStyle(e.target.value)}><option value="">Select style</option>{WORSHIP_STYLES.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}</select></div>
            </div>
            <div className="form-group"><label className="form-label">Mission Statement</label><textarea className="input textarea" value={missionStatement} onChange={(e) => setMissionStatement(e.target.value)} placeholder={"To love God, love people, and make disciples of Jesus Christ."} style={{ minHeight: '80px' }} /><p className="form-hint">Shown on your community page</p></div>
            <div className="form-group"><label className="form-label">Service Times</label><textarea className="input textarea" value={serviceTimes} onChange={(e) => setServiceTimes(e.target.value)} placeholder={"Sunday Worship: 10:00 AM\nWednesday Bible Study: 7:00 PM\nFriday Prayer Meeting: 6:30 PM"} style={{ minHeight: '80px' }} /><p className="form-hint">List your regular service times</p></div>
            <div className="form-group"><label className="form-label">Website</label><input type="url" className="input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://www.yourchurch.com" /></div>

            {/* Social Links */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '8px', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>🔗 Social Media Links</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="form-label">Facebook</label><input type="url" className="input" value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} placeholder="https://facebook.com/..." /></div>
                <div className="form-group"><label className="form-label">Instagram</label><input type="url" className="input" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} placeholder="https://instagram.com/..." /></div>
                <div className="form-group"><label className="form-label">YouTube</label><input type="url" className="input" value={socialYoutube} onChange={(e) => setSocialYoutube(e.target.value)} placeholder="https://youtube.com/..." /></div>
              </div>
            </div>

            {/* Address */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '8px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>📍 Church address — shown on your community page so members can find you</p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 140px' }} className="form-group"><label className="form-label">City</label><input type="text" className="input" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} placeholder="Houston" /></div>
                <div style={{ flex: '1 1 80px' }} className="form-group"><label className="form-label">State</label><select style={selectStyle} value={addressState} onChange={(e) => setAddressState(e.target.value)}><option value="">State</option>{US_STATES.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}</select></div>
                <div style={{ flex: '1 1 80px' }} className="form-group"><label className="form-label">ZIP</label><input type="text" className="input" value={addressZip} onChange={(e) => setAddressZip(e.target.value)} placeholder="77001" /></div>
              </div>
            </div>

            <div className="form-group"><label className="form-label">Email Signature</label><textarea className="input textarea" value={emailSignature} onChange={(e) => setEmailSignature(e.target.value)} placeholder={"Blessings,\nPastor John Smith\nGrace Community Church"} style={{ minHeight: '100px' }} /><p className="form-hint">Added to the end of your emails</p></div>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>

        {/* Newsletter Subscribers */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Newsletter Subscribers</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Add email addresses (one per line) for your newsletter distribution list.</p>
          <div className="form-group">
            <label className="form-label">Subscriber Emails</label>
            <textarea className="input textarea" value={subscribers} onChange={(e) => setSubscribers(e.target.value)} placeholder={"member1@email.com\nmember2@email.com"} style={{ minHeight: '150px', fontFamily: 'monospace', fontSize: '14px' }} />
          </div>
          <button className="btn-secondary" onClick={() => { localStorage.setItem('newsletter_subscribers', subscribers); setSaved(true); setTimeout(() => setSaved(false), 3000); }}>Save Subscriber List</button>
        </div>
      </div>
    </div>
  );
}
