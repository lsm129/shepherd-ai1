'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

export default function MemberProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: '', gender: '', birthYear: '',
    maritalStatus: '', spouseOccupation: '',
    hasChildren: '', childrenCount: '', childrenInfo: '',
    education: '', occupation: '', location: '', ethnicity: '',
    yearsBeliever: '', baptized: '', churchInvolvement: '',
    currentChallenges: '', hopeForHelp: '',
  });

  useEffect(() => {
    setMounted(true);
    async function init() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }
        setUserId(session.user.id);
        const meta = session.user.user_metadata || {};
        setForm(prev => ({
          ...prev,
          fullName: meta.full_name || '',
          gender: meta.gender || '',
          birthYear: meta.birth_year || '',
          location: meta.location || '',
          education: meta.education || '',
          occupation: meta.occupation || '',
          maritalStatus: meta.marital_status || '',
          hasChildren: meta.has_children || '',
          childrenCount: meta.children_count || '',
          childrenInfo: meta.children_info || '',
          spouseOccupation: meta.spouse_occupation || '',
          ethnicity: meta.ethnicity || '',
          yearsBeliever: meta.years_believer || '',
          baptized: meta.baptized || '',
          churchInvolvement: meta.church_involvement || '',
          currentChallenges: meta.current_challenges || '',
          hopeForHelp: meta.hope_for_help || '',
        }));
        if (meta.profile_completed) setSaved(true);
      } catch (e) { console.error(e); }
    }
    init();
  }, [router]);

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: form.fullName,
          gender: form.gender,
          birth_year: form.birthYear,
          marital_status: form.maritalStatus,
          spouse_occupation: form.spouseOccupation,
          has_children: form.hasChildren,
          children_count: form.childrenCount,
          children_info: form.childrenInfo,
          education: form.education,
          occupation: form.occupation,
          location: form.location,
          ethnicity: form.ethnicity,
          years_believer: form.yearsBeliever,
          baptized: form.baptized,
          church_involvement: form.churchInvolvement,
          current_challenges: form.currentChallenges,
          hope_for_help: form.hopeForHelp,
          profile_completed: true,
        }
      });
      if (!error) {
        setSaved(true);
        // Also update profiles table
        const adminKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        await fetch('/api/member/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, ...form }),
        });
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15, outline: 'none' };
  const labelStyle = { fontSize: 13, color: '#555', marginBottom: 4, display: 'block', fontWeight: 600 };
  const selectStyle = { ...inputStyle, background: 'white' };

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 8 }}>📋 My Profile</h1>
        <p style={{ color: '#666', fontSize: 14 }}>Help us understand you better so your pastor can provide personalized spiritual guidance.</p>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < step ? '#1e3a5f' : '#e5e7eb', transition: 'all 0.3s' }} />
        ))}
      </div>

      {saved && (
        <div style={{ background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: 8, padding: 16, marginBottom: 20, color: '#15803d', fontWeight: 600, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✅ Profile saved! Your pastor will receive personalized insights.</span>
          <button onClick={() => setSaved(false)} style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', fontSize: 16 }}>✎ Edit</button>
        </div>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 20 }}>👤 Basic Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Your full name" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Gender</label>
                <select style={selectStyle} value={form.gender} onChange={e => update('gender', e.target.value)}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Year of Birth</label>
                <input style={inputStyle} type="number" value={form.birthYear} onChange={e => update('birthYear', e.target.value)} placeholder="e.g. 1990" min="1920" max="2020" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Location / Hometown</label>
              <input style={inputStyle} value={form.location} onChange={e => update('location', e.target.value)} placeholder="City, State or Country" />
            </div>
            <div>
              <label style={labelStyle}>Ethnicity / Cultural Background</label>
              <input style={inputStyle} value={form.ethnicity} onChange={e => update('ethnicity', e.target.value)} placeholder="e.g. African American, Hispanic, Asian, Caucasian, etc." />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Family & Background */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 20 }}>👨‍👩‍👧‍👦 Family & Background</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Marital Status</label>
              <select style={selectStyle} value={form.maritalStatus} onChange={e => update('maritalStatus', e.target.value)}>
                <option value="">Select</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="separated">Separated</option>
              </select>
            </div>
            {form.maritalStatus === 'married' && (
              <div>
                <label style={labelStyle}>Spouse&apos;s Occupation</label>
                <input style={inputStyle} value={form.spouseOccupation} onChange={e => update('spouseOccupation', e.target.value)} placeholder="e.g. Teacher, Nurse, Engineer" />
              </div>
            )}
            <div>
              <label style={labelStyle}>Do you have children?</label>
              <select style={selectStyle} value={form.hasChildren} onChange={e => update('hasChildren', e.target.value)}>
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            {form.hasChildren === 'yes' && (
              <>
                <div>
                  <label style={labelStyle}>Number of Children</label>
                  <select style={selectStyle} value={form.childrenCount} onChange={e => update('childrenCount', e.target.value)}>
                    <option value="">Select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5+">5+</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Children Details (gender, age, etc.)</label>
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.childrenInfo} onChange={e => update('childrenInfo', e.target.value)} placeholder="e.g. Boy age 8, Girl age 5" />
                </div>
              </>
            )}
            <div>
              <label style={labelStyle}>Education Level</label>
              <select style={selectStyle} value={form.education} onChange={e => update('education', e.target.value)}>
                <option value="">Select</option>
                <option value="high_school">High School</option>
                <option value="some_college">Some College</option>
                <option value="bachelors">Bachelor&apos;s Degree</option>
                <option value="masters">Master&apos;s Degree</option>
                <option value="doctorate">Doctorate / PhD</option>
                <option value="trade_school">Trade School</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Occupation / Profession</label>
              <input style={inputStyle} value={form.occupation} onChange={e => update('occupation', e.target.value)} placeholder="e.g. Software Engineer, Teacher, Retired" />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Faith & Needs */}
      {step === 3 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 20 }}>⛪ Faith & Spiritual Needs</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Years as a Believer</label>
                <input style={inputStyle} type="number" value={form.yearsBeliever} onChange={e => update('yearsBeliever', e.target.value)} placeholder="e.g. 5" min="0" />
              </div>
              <div>
                <label style={labelStyle}>Baptized?</label>
                <select style={selectStyle} value={form.baptized} onChange={e => update('baptized', e.target.value)}>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="planning">Planning to</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Church Involvement Level</label>
              <select style={selectStyle} value={form.churchInvolvement} onChange={e => update('churchInvolvement', e.target.value)}>
                <option value="">Select</option>
                <option value="new">New to church</option>
                <option value="attending">Regular attendee</option>
                <option value="serving">Serving in ministry</option>
                <option value="leadership">In leadership</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Current Life Challenges</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.currentChallenges} onChange={e => update('currentChallenges', e.target.value)} placeholder="What challenges are you facing? (e.g. health, family, career, relationships, faith doubts)" />
            </div>
            <div>
              <label style={labelStyle}>What kind of help do you hope to receive?</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.hopeForHelp} onChange={e => update('hopeForHelp', e.target.value)} placeholder="e.g. Marriage counseling, career guidance, spiritual growth, parenting advice, prayer support..." />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} style={{ padding: '12px 24px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: '#666' }}>
            ← Back
          </button>
        ) : (
          <button onClick={() => router.push('/member/dashboard')} style={{ padding: '12px 24px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: '#666' }}>
            Cancel
          </button>
        )}
        {step < totalSteps ? (
          <button onClick={() => setStep(step + 1)} style={{ padding: '12px 32px', borderRadius: 8, border: 'none', background: '#1e3a5f', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Next →
          </button>
        ) : (
          <button onClick={handleSave} disabled={saving} style={{ padding: '12px 32px', borderRadius: 8, border: 'none', background: saving ? '#94a3b8' : '#22c55e', color: 'white', fontWeight: 600, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : '✓ Save Profile'}
          </button>
        )}
      </div>
    </div>
  );
}
