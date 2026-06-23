import { Metadata } from 'next';
import Link from 'next/link';
import AuthCTA from '@/components/AuthCTA';

export const metadata: Metadata = {
  title: { absolute: 'Membership Management — ShepherdAI' },
  description: 'AI-powered membership management for churches. Member directory, profiles, pastoral care plans, engagement tracking, and digital check-in — all in one place.',
  alternates: { canonical: 'https://www.shepherdaitech.com/membership-management' },
};

const features = [
  {
    emoji: '👥',
    title: 'Member Directory & Database',
    desc: 'Complete church membership database with contact info, family relationships, spiritual milestones, baptism dates, and notes. Searchable, filterable, always up to date.',
  },
  {
    emoji: '🎯',
    title: 'AI Member Pastoral Plan',
    desc: 'When a new member joins, AI analyzes their background, occupation, family situation, and spiritual needs to generate a personalized pastoral care plan — instantly.',
  },
  {
    emoji: '📋',
    title: 'Engagement Tracking',
    desc: 'Track service attendance, small group participation, volunteer hours, and event attendance. Identify active members and those who need a pastoral check-in.',
  },
  {
    emoji: '✅',
    title: 'Digital Check-In',
    desc: 'Members check in for services and events digitally. Track attendance trends, spot absent members, and trigger automatic follow-up messages.',
  },
  {
    emoji: '🏠',
    title: 'Small Group Management',
    desc: 'Create and manage small groups, Bible studies, and ministry teams. Assign leaders, track attendance, share resources, and communicate within groups.',
  },
  {
    emoji: '🎪',
    title: 'Volunteer Scheduling',
    desc: 'Schedule volunteers for worship services, events, and ministries. Auto-send reminders, track serving hours, and never scramble for ushers or greeters again.',
  },
  {
    emoji: '👶',
    title: 'Family & Household View',
    desc: 'View members by household. Track family milestones, children&apos;s ministry participation, and lifecycle events — all connected in one place.',
  },
  {
    emoji: '📊',
    title: 'Membership Analytics',
    desc: 'See membership growth trends, retention rates, engagement scores, and demographic insights. Make data-informed pastoral decisions.',
  },
  {
    emoji: '🌐',
    title: 'Congregant Portal',
    desc: 'Members get their own portal to update info, view their giving, join groups, and stay connected. Seat-based pricing — pay only for active members.',
  },
];

const howItWorks = [
  {
    step: 1,
    title: 'Add Your Members',
    desc: 'Import from your existing system, add manually, or let members join through your church community page. AI auto-enriches profiles with smart suggestions.',
  },
  {
    step: 2,
    title: 'Engage & Care',
    desc: 'AI generates personalized pastoral care plans for each member. Track attendance, send follow-ups to absent members, and never lose touch with your flock.',
  },
  {
    step: 3,
    title: 'Grow Your Church',
    desc: 'Use membership analytics to understand your congregation. Spot growth opportunities, improve retention, and shepherd your members more effectively.',
  },
];

export default function MembershipManagementPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ padding: '80px 24px 40px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
          Membership Management
        </p>
        <h1 style={{ fontSize: 48, fontWeight: 'bold', color: '#1e3a5f', lineHeight: 1.2, marginBottom: 16 }}>
          Know Every Member.Shepherd Every Soul.
        </h1>
        <p style={{ fontSize: 18, color: '#64748b', maxWidth: 700, margin: '0 auto 24px', lineHeight: 1.7 }}>
          AI-powered membership management that helps you track, engage, and care for every person in your congregation — from first-time visitors to lifelong members.
        </p>
        <AuthCTA
          featureHref="/member/dashboard"
          style={{ display: 'inline-block', padding: '14px 32px', background: '#3b82f6', color: 'white', borderRadius: 8, fontWeight: 600, marginRight: 12 }}
        >
          Start Managing Members →
        </AuthCTA>
        <Link
          href="#features"
          style={{ display: 'inline-block', padding: '14px 32px', background: 'white', color: '#1e3a5f', borderRadius: 8, fontWeight: 600, border: '1px solid #e2e8f0' }}
        >
          Explore Features ↓
        </Link>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 8 }}>
          Complete Membership Management
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 48, fontSize: 16 }}>
          From member directory to pastoral care plans — everything you need to shepherd your congregation well.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                padding: '32px 28px',
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                background: 'white',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.emoji}</div>
              <h3 style={{ fontSize: 20, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ background: '#f8fafc', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 48 }}>
            How Membership Management Works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {howItWorks.map((item) => (
              <div key={item.step} style={{ textAlign: 'center', padding: '24px' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: '#3b82f6',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: 'bold',
                    margin: '0 auto 20px',
                  }}
                >
                  {item.step}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 8 }}>
          Why ShepherdAI for Members?
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 48, fontSize: 16 }}>
          Compare how ShepherdAI handles membership vs. traditional church management software.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#1e3a5f', fontWeight: 700 }}>Feature</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', background: '#eff6ff', color: '#3b82f6', fontWeight: 700, borderRadius: '8px 8px 0 0' }}>
                  ShepherdAI
                </th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: '#94a3b8', fontWeight: 600 }}>
                  Other ChMS
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Member Directory & Search', '✓ Full database', '✓ Included'],
                ['AI Pastoral Care Plans', '✓ Auto-generated', '✗'],
                ['Attendance & Check-In', '✓ Digital + trends', 'Manual'],
                ['Small Group Management', '✓ Groups + resources', 'Limited'],
                ['Volunteer Scheduling', '✓ With auto-reminders', 'Sometimes'],
                ['Family/Household View', '✓ Connected profiles', 'Basic only'],
                ['Member Self-Service Portal', '✓ Congregants update info', 'Often read-only'],
                ['Membership Analytics', '✓ AI-powered insights', 'Basic reports'],
                ['Starting Price', '$0', '$49-72/mo'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', color: '#334155', fontWeight: 500 }}>{row[0]}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', background: '#eff6ff', color: '#3b82f6', fontWeight: 600 }}>
                    {row[1]}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#1e3a5f', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 'bold', color: 'white', marginBottom: 16 }}>
          Know Your Flock. Care for Every Soul.
        </h2>
        <p style={{ fontSize: 18, color: '#cbd5e1', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Start managing your members with AI that helps you track engagement, generate care plans, and never miss a pastoral opportunity.
        </p>
        <AuthCTA
          featureHref="/member/dashboard"
          style={{ display: 'inline-block', padding: '16px 40px', background: '#3b82f6', color: 'white', borderRadius: 8, fontWeight: 600, fontSize: 18 }}
        >
          Start Your Free Account
        </AuthCTA>
        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 16 }}>✅ Free forever plan · 🔒 No credit card · ⚡ Setup in 2 minutes</p>
      </section>
    </>
  );
}
