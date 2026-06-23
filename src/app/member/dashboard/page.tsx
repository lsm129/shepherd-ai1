'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

interface Announcement { title: string; content: string; summary: string; created_at: string; }

export default function MemberDashboardPage() {
  const [userEmail, setUserEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [churchName, setChurchName] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [userId, setUserId] = useState('');
  const [points, setPoints] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [joinedChurches, setJoinedChurches] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [dailyDevotionalEmail, setDailyDevotionalEmail] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaving, setLeaving] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const router = useRouter();
  const hasChurch = joinedChurches.length > 0;



  const badgeIcons: Record<string, { icon: string; color: string }> = {
    'Prayer Warrior': { icon: '⚔️', color: '#7c3aed' },
    'Faithful Servant': { icon: '🛡️', color: '#2563eb' },
    'Devoted Member': { icon: '💎', color: '#059669' },
    'Church Pillar': { icon: '🏛️', color: '#d97706' },
  };

  useEffect(() => {
    const checkMobile = () => setMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    async function checkAuth() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }
        const meta = session.user.user_metadata || {};
        if (meta.role === 'pastor') { router.push('/dashboard'); return; }

        setUserEmail(session.user.email || '');
        setUserId(session.user.id);
        setDisplayName(meta.full_name || session.user.email?.split('@')[0] || 'Member');
        setBadges(meta.badges || []);
        const jc: string[] = meta.joined_churches || [];
        setJoinedChurches(jc);

        // Load points
        try {
          const r = await fetch('/api/points/balance?userId=' + session.user.id);
          if (r.ok) { const d = await r.json(); setPoints(d.balance || 0); }
        } catch {}

        // Check today's check-in
        try {
          const r = await fetch('/api/points/daily-checkin', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: session.user.id }),
          });
          const d = await r.json();
          if (d.alreadyCheckedIn) { setCheckedIn(true); setStreakDays(d.streakDays || 0); }
          if (d.newBalance) setPoints(d.newBalance);
        } catch {}

        // Load devotional email preference
        try {
          const { data: profileData } = await supabase.from('profiles').select('daily_devotional_email').eq('id', session.user.id).single();
          if (profileData?.daily_devotional_email !== undefined && profileData?.daily_devotional_email !== null) {
            setDailyDevotionalEmail(profileData.daily_devotional_email);
          } else if (meta.daily_devotional_email !== undefined) {
            setDailyDevotionalEmail(meta.daily_devotional_email);
          }
        } catch { if (meta.daily_devotional_email !== undefined) setDailyDevotionalEmail(meta.daily_devotional_email); }

        // Load church info
        if (jc.length > 0) {
          const pastorId = jc[0];
          const { data: churchData } = await supabase.from('church_settings').select('church_name, pastor_name').eq('user_id', pastorId).single();
          if (churchData) { setChurchName(churchData.church_name || ''); setPastorName(churchData.pastor_name || ''); }

          // Load announcements
          const { data: genData } = await supabase.from('generations').select('input_summary, output_content, created_at').eq('user_id', pastorId).eq('tool_type', 'church_announcement').order('created_at', { ascending: false }).limit(5);
          if (genData && genData.length > 0) {
            setAnnouncements(genData.map((g: any) => {
              let p: any = {}; try { p = JSON.parse(g.output_content); } catch { p = { content: g.output_content }; }
              return { title: p.title || g.input_summary || 'Church Announcement', content: p.content || g.output_content || '', summary: p.summary || '', created_at: g.created_at };
            }));
          }
        }
      } catch (e) { console.error('Auth error:', e); }
      setLoaded(true);
    }
    checkAuth();
    return () => window.removeEventListener('resize', checkMobile);
  }, [router]);

  const handleCheckIn = async () => {
    if (!userId || checkedIn || checkInLoading) return;
    setCheckInLoading(true);
    try {
      const r = await fetch('/api/points/daily-checkin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const d = await r.json();
      if (d.success) {
        setCheckedIn(true);
        setPoints(d.newBalance || points + 3);
        setStreakDays(d.streakDays || 1);
      } else if (d.alreadyCheckedIn) {
        setCheckedIn(true);
        if (d.newBalance) setPoints(d.newBalance);
      }
    } catch {}
    setCheckInLoading(false);
  };

  const handleJoinByCode = async () => {
    if (!inviteCode.trim() || !userId) return;
    setJoinLoading(true); setJoinMessage(null);
    try {
      const r = await fetch('/api/join-church', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, referralCode: inviteCode.trim() }) });
      const d = await r.json();
      if (d.success) {
        setJoinedChurches([...joinedChurches, d.pastorId || '']);
        setChurchName(d.churchName || '');
        setPastorName(d.pastorName || '');
        setJoinMessage({ success: true, text: `Joined ${d.churchName}! +${d.userPoints} pts 🎉` });
        setInviteCode('');
        if (d.newBalance) setPoints(d.newBalance);
        setTimeout(() => window.location.reload(), 1500);
      } else setJoinMessage({ success: false, text: d.error || 'Failed to join' });
    } catch { setJoinMessage({ success: false, text: 'Something went wrong' }); }
    setJoinLoading(false);
  };

  const toggleDevotionalEmail = async () => {
    const newVal = !dailyDevotionalEmail;
    setDailyDevotionalEmail(newVal);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
      try { await supabase.from('profiles').update({ daily_devotional_email: newVal }).eq('id', userId); } catch {}
      await supabase.auth.updateUser({ data: { daily_devotional_email: newVal } });
    } catch { setDailyDevotionalEmail(!newVal); }
  };

  const handleLeaveChurch = async () => {
    if (!leaveReason) return;
    setLeaving(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const meta = session.user.user_metadata || {};
      const currentChurches: string[] = meta.joined_churches || [];
      await supabase.auth.updateUser({ data: { joined_churches: [] } });
      setJoinedChurches([]); setChurchName(''); setPastorName('');
      setShowLeaveModal(false);
    } catch {}
    setLeaving(false);
  };

  if (!loaded) return null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Welcome Bar */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: mobile ? '22px' : '28px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '4px' }}>
          Welcome back, {displayName}! 👋
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          {hasChurch ? `${churchName} • ${pastorName || 'Your Church'}` : 'Find a church to get the full experience'}
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {/* Points */}
        <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fff7ed)', border: '1px solid #fcd34d', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>{points}</div>
          <div style={{ fontSize: '12px', color: '#a16207', marginTop: '2px' }}>⭐ Points</div>
        </div>
        {/* Check-in */}
        <div
          onClick={checkedIn ? undefined : handleCheckIn}
          style={{
            background: checkedIn ? 'linear-gradient(135deg, #d1fae5, #ecfdf5)' : 'linear-gradient(135deg, #dbeafe, #eff6ff)',
            border: checkedIn ? '1px solid #6ee7b7' : '1px solid #93c5fd',
            borderRadius: '12px', padding: '16px', textAlign: 'center',
            cursor: checkedIn ? 'default' : 'pointer',
          }}
        >
          <div style={{ fontSize: '24px' }}>{checkedIn ? '✅' : '👆'}</div>
          <div style={{ fontSize: '12px', color: checkedIn ? '#059669' : '#2563eb', marginTop: '2px' }}>
            {checkedIn ? 'Checked In!' : checkInLoading ? '...' : 'Check In +3'}
          </div>
        </div>
        {/* Streak */}
        <div style={{ background: 'linear-gradient(135deg, #ede9fe, #f5f3ff)', border: '1px solid #c4b5fd', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6d28d9' }}>{streakDays}</div>
          <div style={{ fontSize: '12px', color: '#7c3aed', marginTop: '2px' }}>🔥 Day Streak</div>
        </div>
      </div>

      {/* Quick Actions - Congregant only features */}
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <Link href="/prayer/submit" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>🙏</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e3a5f' }}>Prayer</div>
          </div>
        </Link>
        <Link href="/community" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>🌍</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e3a5f' }}>Community</div>
          </div>
        </Link>
        <Link href="/daily-devotional" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>📖</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e3a5f' }}>Devotional</div>
          </div>
        </Link>
        <Link href="/points-center" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>⭐</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e3a5f' }}>Points</div>
          </div>
        </Link>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px' }}>🏅 Badges</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {badges.map((b, i) => {
              const badge = badgeIcons[b] || { icon: '🏅', color: '#666' };
              return <span key={i} style={{ background: badge.color + '15', color: badge.color, padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{badge.icon} {b}</span>;
            })}
          </div>
        </div>
      )}

      {/* Join Church Section */}
      {!hasChurch && (
        <div style={{ background: 'white', border: '1px solid #93c5fd', borderLeft: '4px solid #3b82f6', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>⛪ Join a Church</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>Enter an invite code from your pastor or find a church to join.</p>
          {joinMessage && (
            <div style={{ background: joinMessage.success ? '#f0fdf4' : '#fef2f2', border: `1px solid ${joinMessage.success ? '#86efac' : '#fca5a5'}`, borderRadius: 8, padding: 10, marginBottom: 10, color: joinMessage.success ? '#166534' : '#991b1b', fontSize: 13 }}>
              {joinMessage.text}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <input type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Invite code" style={{ flex: 1, minWidth: 160, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
            <button onClick={handleJoinByCode} disabled={joinLoading || !inviteCode.trim()} style={{ background: joinLoading ? '#e2e8f0' : '#1e3a5f', color: joinLoading ? '#999' : 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: joinLoading ? 'not-allowed' : 'pointer' }}>
              {joinLoading ? 'Joining...' : 'Join'}
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <Link href="/find-church" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>🔍 Find a Church →</Link>
          </div>
        </div>
      )}

      {/* Daily Devotional Email Toggle */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: 2 }}>📖 Daily Devotional Email</div>
            <div style={{ color: '#666', fontSize: '13px' }}>{dailyDevotionalEmail ? 'ShepherdAI sends you a daily devotional with Bible verse, reflection, and prayer every morning.' : 'Turn on to receive daily devotionals in your inbox.'}</div>
          </div>
          <div onClick={toggleDevotionalEmail} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 44, height: 26, borderRadius: 13, background: dailyDevotionalEmail ? '#22c55e' : '#d1d5db', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: 'white', position: 'absolute', top: 2, left: dailyDevotionalEmail ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Church Announcements */}
      {hasChurch && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '12px' }}>📢 Church Announcements</h2>
          {announcements.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {announcements.map((ann, i) => (
                <div key={i} style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: 14, borderLeft: '3px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f' }}>{ann.title}</span>
                    <span style={{ fontSize: 11, color: '#999' }}>{new Date(ann.created_at).toLocaleDateString()}</span>
                  </div>
                  {ann.summary && <div style={{ color: '#888', fontSize: 13, marginBottom: 4, fontStyle: 'italic' }}>{ann.summary}</div>}
                  <div style={{ color: '#444', fontSize: 13, lineHeight: 1.5 }}>{ann.content.substring(0, 200)}{ann.content.length > 200 ? '...' : ''}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📢</div>
              No announcements yet from your church.
            </div>
          )}
        </div>
      )}

      {/* My Church */}
      {hasChurch && churchName && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '12px' }}>⛪ My Church</h2>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Church Name</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1e3a5f' }}>{churchName}</div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Pastor</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1e3a5f' }}>{pastorName || '—'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/church-community" style={{ color: '#4a90a4', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>⛪ Church Community →</Link>
            <button onClick={() => { setLeaveReason(''); setShowLeaveModal(true); }} style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Leave</button>
          </div>
        </div>
      )}

      {/* Leave Church Modal */}
      {showLeaveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowLeaveModal(false)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, maxWidth: 420, width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🚪</div>
              <h2 style={{ fontSize: 18, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 4 }}>Are you sure you want to leave?</h2>
            </div>
            <div style={{ marginBottom: 16 }}>
              {['I moved to a different area', 'I found a church that fits me better', 'Personal or family reasons', 'Other'].map(r => (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', marginBottom: 4, borderRadius: 6, cursor: 'pointer', background: leaveReason === r ? '#fef2f2' : 'transparent', border: leaveReason === r ? '1px solid #fca5a5' : '1px solid transparent' }}>
                  <input type="radio" name="leaveReason" value={r} checked={leaveReason === r} onChange={() => setLeaveReason(r)} style={{ accentColor: '#ef4444' }} />
                  <span style={{ fontSize: 13, color: '#333' }}>{r}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowLeaveModal(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#666' }}>Stay</button>
              <button onClick={handleLeaveChurch} disabled={!leaveReason || leaving} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: !leaveReason || leaving ? '#fca5a5' : '#ef4444', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{leaving ? 'Leaving...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
