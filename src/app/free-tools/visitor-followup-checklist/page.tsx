'use client';
import React from 'react';
import Link from 'next/link';

const weeks = [
  {
    week: 1,
    title: 'Welcome & Immediate Follow-Up',
    theme: 'First Impressions Matter',
    actions: [
      { action: 'Send a personalized welcome email within 24 hours', detail: 'Thank them for visiting, share service times, and include a brief intro to the church.' },
      { action: 'Make a phone call within 48 hours', detail: 'A warm, non-pressuring call from a pastor or welcome team member. Ask how their visit was.' },
      { action: 'Add to church CRM / visitor database', detail: 'Record name, contact info, visit date, and any notes for future reference.' },
      { action: 'Pray for the visitor by name', detail: 'Add to the pastoral prayer list for the week.' },
    ],
  },
  {
    week: 2,
    title: 'Personal Connection',
    theme: 'Building a Relationship',
    actions: [
      { action: 'Send a handwritten note', detail: 'A personal card in the mail stands out. Include a brief message and your contact info.' },
      { action: 'Connect on social media (if appropriate)', detail: 'Follow or friend request to stay in touch informally.' },
      { action: 'Invite to a newcomers gathering or coffee', detail: 'Offer a low-pressure opportunity to meet the pastor and other newcomers in a casual setting.' },
      { action: 'Share a relevant resource', detail: 'Send a link to a sermon, devotional, or event that connects to something they mentioned.' },
    ],
  },
  {
    week: 3,
    title: 'Community Integration',
    theme: 'Finding Their Place',
    actions: [
      { action: 'Invite to a small group or Bible study', detail: 'Match them to a group based on life stage, interests, or location. Small groups are the #1 factor in retention.' },
      { action: 'Introduce to a ministry leader', detail: 'If they expressed interest in serving or a specific ministry, make a warm introduction.' },
      { action: 'Send info about upcoming events', detail: 'Share events that align with their interests — family events, volunteer opportunities, or worship nights.' },
      { action: 'Assign a "church buddy"', detail: 'Pair them with a friendly member who can sit with them, answer questions, and introduce them to others.' },
    ],
  },
  {
    week: 4,
    title: 'Engagement & Serving',
    theme: 'From Visitor to Participant',
    actions: [
      { action: 'Invite to serve in a low-commitment role', detail: 'Greeter, coffee team, or event setup — serving creates belonging faster than anything else.' },
      { action: 'Check in personally', detail: 'A quick text or call: "How are you settling in? Is there anything we can help with?"' },
      { action: 'Share a testimony or story', detail: 'Send a short video or written story from a member whose life was changed by the church.' },
      { action: 'Invite to a membership or next-steps class', detail: 'Offer a clear pathway to deeper involvement without pressure.' },
    ],
  },
  {
    week: 5,
    title: 'Deepening Roots',
    theme: 'Making It Home',
    actions: [
      { action: 'Follow up on small group attendance', detail: 'If they attended, ask how it went. If not, gently offer another option.' },
      { action: 'Invite to a social or fellowship event', detail: 'BBQ, game night, or church picnic — informal settings build real friendships.' },
      { action: 'Ask for feedback on their experience', detail: 'A brief survey or conversation: "What\'s been helpful? What could we do better?"' },
      { action: 'Connect their family members', detail: 'If they have kids, ensure children/youth ministry leaders have reached out. Spouse connections matter too.' },
    ],
  },
  {
    week: 6,
    title: 'Commitment & Ownership',
    theme: 'Becoming Family',
    actions: [
      { action: 'Invite to membership', detail: 'Present membership as an invitation to belong, not an obligation. Share the vision and values.' },
      { action: 'Encourage a regular serving role', detail: 'Help them find a ministry where their gifts and passions align.' },
      { action: 'Ask them to invite a friend', detail: 'When someone invites others, it signals they\'ve found a home.' },
      { action: 'Celebrate their journey', detail: 'Acknowledge their growth — a personal note from the pastor, a small gift, or a public welcome (with permission).' },
    ],
  },
];

export default function VisitorFollowUpChecklistPage() {
  const [checkedItems, setCheckedItems] = React.useState<Record<string, boolean>>({});
  const [churchName, setChurchName] = React.useState('');
  const [visitorName, setVisitorName] = React.useState('');
  const [generating, setGenerating] = React.useState(false);
  const [result, setResult] = React.useState('');

  const toggleItem = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCount = Object.values(checkedItems).filter(Boolean).length;

  const handleGenerate = async () => {
    if (selectedCount === 0) return;
    setGenerating(true);
    setResult('');

    try {
      const selectedActions: string[] = [];
      weeks.forEach(week => {
        week.actions.forEach((a, i) => {
          if (checkedItems[`${week.week}-${i}`]) {
            selectedActions.push(`Week ${week.week}: ${a.action}`);
          }
        });
      });

      const res = await fetch('/api/free-visitor-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actions: selectedActions,
          churchName: churchName || 'our church',
          visitorName: visitorName || 'the visitor',
        }),
      });

      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setResult(data.content || 'No result');
    } catch {
      setResult('Failed to generate. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%)', padding: '48px 24px', color: 'white', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>👋</div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Church Visitor Follow-Up Planner</h1>
        <p style={{ fontSize: '16px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 20px' }}>
          Select the follow-up actions you want, then generate a personalized plan with timelines and email templates.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '14px' }}>✅ 24 action items</span>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '14px' }}>📅 6-week timeline</span>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '14px' }}>🤖 AI-generated plan</span>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '14px' }}>💰 100% Free</span>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Quick Info */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Church Name (optional)</label>
            <input value={churchName} onChange={e => setChurchName(e.target.value)} placeholder="e.g. Grace Community Church" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Visitor Name (optional)</label>
            <input value={visitorName} onChange={e => setVisitorName(e.target.value)} placeholder="e.g. John Smith" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
          </div>
        </div>

        {/* Selection Counter */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span style={{ background: selectedCount > 0 ? '#dcfce7' : '#f1f5f9', color: selectedCount > 0 ? '#166534' : '#64748b', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' }}>
            {selectedCount} of 24 actions selected
          </span>
        </div>

        {/* Weeks */}
        {weeks.map((week) => (
          <div key={week.week} style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', background: '#1e3a5f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '800', fontSize: '18px', flexShrink: 0,
              }}>
                {week.week}
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a5f', margin: 0 }}>
                  Week {week.week}: {week.title}
                </h2>
                <span style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>{week.theme}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {week.actions.map((a, i) => {
                const key = `${week.week}-${i}`;
                const checked = checkedItems[key];
                return (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => toggleItem(key)}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '6px',
                      border: checked ? '2px solid #3b82f6' : '2px solid #d1d5db',
                      background: checked ? '#3b82f6' : 'white',
                      flexShrink: 0, marginTop: '2px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {checked && <span style={{ color: 'white', fontSize: '14px', lineHeight: 1 }}>✓</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e3a5f', lineHeight: '1.4', textDecoration: 'none' }}>
                        {a.action}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginTop: '2px' }}>
                        {a.detail}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Generate Button */}
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <button
            onClick={handleGenerate}
            disabled={selectedCount === 0 || generating}
            style={{
              background: selectedCount === 0 ? '#e2e8f0' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: selectedCount === 0 ? '#94a3b8' : 'white',
              padding: '16px 40px', borderRadius: '12px', border: 'none',
              fontSize: '18px', fontWeight: '700', cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
              boxShadow: selectedCount > 0 ? '0 4px 20px rgba(34,197,94,0.4)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {generating ? '⏳ Generating Your Plan...' : `🤖 Generate Personalized Plan (${selectedCount} actions)`}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a5f', marginBottom: '16px' }}>📋 Your Personalized Follow-Up Plan</h3>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.8', color: '#374151' }}>{result}</div>
          </div>
        )}

        {/* Register CTA after result */}
        {result && (
          <div style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', borderRadius: '16px', padding: '24px', textAlign: 'center', color: 'white', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Want AI to send these emails automatically?</h3>
            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '16px' }}>Sign up free and let ShepherdAI handle your visitor follow-up with personalized, timed emails.</p>
            <Link href="/register" style={{ background: 'white', color: '#16a34a', padding: '12px 28px', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}>
              Start Free — No Credit Card
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
