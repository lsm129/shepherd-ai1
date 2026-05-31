'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


interface Announcement {
  title: string;
  content: string;
  summary: string;
  created_at: string;
}

interface Devotional {
  verse: { reference: string; text: string };
  meditation: string;
  application: string;
  prayer: string;
  date: string;
}

export default function MemberDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [churchName, setChurchName] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loadingDevotional, setLoadingDevotional] = useState(false);
  const [userId, setUserId] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    async function checkAuth() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }

        const meta = session.user.user_metadata || {};
        if (meta.role === 'pastor') { router.push('/dashboard'); return; }

        setUserEmail(session.user.email || '');
        setUserId(session.user.id);

        const joinedChurches: string[] = meta.joined_churches || [];

        if (joinedChurches.length > 0) {
          const pastorId = joinedChurches[0];

          const { data: churchData } = await supabase
            .from('church_settings')
            .select('church_name, pastor_name')
            .eq('user_id', pastorId)
            .single();
          if (churchData) {
            setChurchName(churchData.church_name || '');
            setPastorName(churchData.pastor_name || '');
          }

          const { data: genData } = await supabase
            .from('generations')
            .select('input_summary, output_content, created_at')
            .eq('user_id', pastorId)
            .eq('tool_type', 'church_announcement')
            .order('created_at', { ascending: false })
            .limit(5);
          if (genData && genData.length > 0) {
            const annList: Announcement[] = genData.map((g: any) => {
              let parsed: any = {};
              try { parsed = JSON.parse(g.output_content); } catch { parsed = { content: g.output_content }; }
              return {
                title: parsed.title || g.input_summary || 'Church Announcement',
                content: parsed.content || g.output_content || '',
                summary: parsed.summary || '',
                created_at: g.created_at,
              };
            });
            setAnnouncements(annList);
          }

          loadDevotional(pastorId, churchData?.church_name || 'Our Church');
        }
      } catch (e) { console.error('Auth error:', e); }
    }
    checkAuth();
    return () => window.removeEventListener('resize', checkMobile);
  }, [router]);

  async function loadDevotional(pastorId: string, church: string) {
    setLoadingDevotional(true);
    try {
      const res = await fetch('/api/generate/devotional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: pastorId, churchName: church, forCongregant: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setDevotional({
          verse: data.verse || { reference: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.' },
          meditation: data.meditation || data.content || '',
          application: data.application || '',
          prayer: data.prayer || '',
          date: new Date().toLocaleDateString(),
        });
      } else {
        setDefaultDevotional();
      }
    } catch {
      setDefaultDevotional();
    } finally {
      setLoadingDevotional(false);
    }
  }

  function setDefaultDevotional() {
    setDevotional({
      verse: { reference: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.' },
      meditation: 'Take a moment today to rest in God\'s presence. He is your shepherd who guides and provides.',
      application: 'Spend 5 minutes in quiet prayer, thanking God for His guidance.',
      prayer: 'Dear Lord, thank You for being my shepherd. Help me to trust in Your provision and follow Your path today. Amen.',
      date: new Date().toLocaleDateString(),
    });
  }

  const handleSignOut = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        await supabase.auth.signOut();
      }
    } catch (e) {}
    window.location.href = '/';
  };

  if (!mounted) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ color: '#666', fontSize: '14px' }}>{userEmail}</span>
        <button onClick={handleSignOut} style={{ background: 'none', border: '1px solid #ccc', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', color: '#666', fontSize: '14px' }}>
          Sign Out / 退出
        </button>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%)', borderRadius: '16px', padding: mobile ? '20px' : '32px', color: 'white', marginBottom: mobile ? '16px' : '24px' }}>
        <h1 style={{ fontSize: mobile ? '22px' : '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          {churchName ? `Welcome to ${churchName} / 欢迎来到${churchName}` : 'Welcome / 欢迎'}! 🙏
        </h1>
        {pastorName && (
          <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '12px' }}>
            Pastor: {pastorName} / 牧师：{pastorName}
          </p>
        )}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/prayer/submit" style={{ background: 'white', color: '#1e3a5f', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
            🙏 Submit Prayer / 提交代祷
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: mobile ? '16px' : '24px' }}>
        <Link href="#devotional" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ textAlign: 'center', padding: '20px', cursor: 'pointer' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📖</div>
            <div style={{ fontWeight: '700', color: '#1e3a5f', fontSize: '16px' }}>Devotional / 灵修</div>
            <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>Today&apos;s spiritual nourishment / 今日灵粮</div>
          </div>
        </Link>
        <Link href="/prayer/submit" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ textAlign: 'center', padding: '20px', cursor: 'pointer' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🙏</div>
            <div style={{ fontWeight: '700', color: '#1e3a5f', fontSize: '16px' }}>Prayer / 代祷</div>
            <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>Submit prayer requests / 提交代祷事项</div>
          </div>
        </Link>
        <Link href="#announcements" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ textAlign: 'center', padding: '20px', cursor: 'pointer' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📢</div>
            <div style={{ fontWeight: '700', color: '#1e3a5f', fontSize: '16px' }}>Announcements / 公告</div>
            <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>Church updates / 教会动态</div>
          </div>
        </Link>
      </div>

      <div id="devotional" className="card" style={{ marginBottom: mobile ? '16px' : '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: mobile ? '18px' : '22px', fontWeight: 'bold', color: '#1e3a5f' }}>
            📖 Today&apos;s Devotional / 今日灵修
          </h2>
          <span style={{ fontSize: '13px', color: '#999' }}>{new Date().toLocaleDateString()}</span>
        </div>

        {loadingDevotional ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📖</div>
            <p>Loading today&apos;s devotional... / 加载今日灵修...</p>
          </div>
        ) : devotional ? (
          <div>
            <div style={{ background: '#f0f4ff', borderRadius: '12px', padding: mobile ? '16px' : '24px', marginBottom: '20px', borderLeft: '4px solid #6366f1' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#6366f1', marginBottom: '8px' }}>
                📜 {devotional.verse.reference}
              </div>
              <div style={{ fontSize: mobile ? '15px' : '17px', fontStyle: 'italic', lineHeight: '1.8', color: '#1e3a5f' }}>
                &ldquo;{devotional.verse.text}&rdquo;
              </div>
            </div>
            {devotional.meditation && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px' }}>💭 Meditation / 默想</h3>
                <p style={{ color: '#444', lineHeight: '1.8', fontSize: '15px' }}>{devotional.meditation}</p>
              </div>
            )}
            {devotional.application && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px' }}>✅ Application / 应用</h3>
                <p style={{ color: '#444', lineHeight: '1.8', fontSize: '15px' }}>{devotional.application}</p>
              </div>
            )}
            {devotional.prayer && (
              <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #22c55e' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#16a34a', marginBottom: '8px' }}>🙏 Prayer / 祷告</h3>
                <p style={{ color: '#444', lineHeight: '1.8', fontSize: '15px', fontStyle: 'italic' }}>{devotional.prayer}</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
            <p>No devotional available today. / 今日暂无灵修内容。</p>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: mobile ? '16px' : '24px', background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>🙏 Prayer Requests / 代祷事项</h2>
            <p style={{ opacity: 0.9, fontSize: '14px' }}>We&apos;re here to pray with you / 我们与您一起祷告</p>
          </div>
          <Link href="/prayer/submit" style={{ background: 'white', color: '#8b5cf6', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>
            Submit Prayer / 提交代祷 →
          </Link>
        </div>
      </div>

      <div id="announcements" className="card" style={{ marginBottom: mobile ? '16px' : '24px' }}>
        <h2 style={{ fontSize: mobile ? '18px' : '22px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '16px' }}>
          📢 Church Announcements / 教会公告
        </h2>
        {announcements.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.map((ann, i) => (
              <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a5f' }}>{ann.title}</h3>
                  <span style={{ fontSize: '12px', color: '#999' }}>{new Date(ann.created_at).toLocaleDateString()}</span>
                </div>
                {ann.summary && (
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px', fontStyle: 'italic' }}>{ann.summary}</p>
                )}
                <p style={{ color: '#444', fontSize: '14px', lineHeight: '1.6' }}>{ann.content.substring(0, 300)}{ann.content.length > 300 ? '...' : ''}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📢</div>
            <p>No announcements yet. / 暂无公告。</p>
          </div>
        )}
      </div>

      {churchName && (
        <div className="card" style={{ marginBottom: mobile ? '16px' : '24px' }}>
          <h2 style={{ fontSize: mobile ? '18px' : '22px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '16px' }}>
            ⛪ My Church / 我的教会
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Church Name / 教会名称</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a5f' }}>{churchName}</div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Pastor / 牧师</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a5f' }}>{pastorName || '—'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
