import { Metadata } from 'next';
import Link from 'next/link';
import AuthCTA from '@/components/AuthCTA';

export const metadata: Metadata = {
  title: { absolute: 'Features — ShepherdAI' },
  description: 'Explore all ShepherdAI features — AI sermon prep, visitor follow-up, prayer management, devotionals, newsletters, batch content, and more. Designed for pastors and congregations.',
  alternates: { canonical: 'https://www.shepherdaitech.com/features' },
};

const coreFeatures = [
  { emoji: '📧', title: 'Visitor Follow-up', slug: 'visitor-followup', plan: 'Free', desc: 'AI writes 6 unique personalized emails per visitor. Pastor previews, edits, then auto-sends.' },
  { emoji: '🙏', title: 'Prayer Management', slug: 'prayer-requests', plan: 'Free', desc: 'AI-generated responses with Bible verses for prayer requests. Review and respond to congregant prayers.' },
  { emoji: '📢', title: 'Church Announcements', slug: 'church-announcement', plan: 'Free', desc: 'Generate polished church announcements for services, events, and special occasions in seconds.' },
  { emoji: '🌍', title: 'Community Knowledge Base', slug: 'community', plan: 'Free', desc: 'Share wisdom and learn from ministry leaders around the world. Ask questions, get answers.' },
  { emoji: '🎯', title: 'AI Member Pastoral Plan', slug: 'member/profile', plan: 'Free', desc: 'When congregants join, AI analyzes their background and needs to generate a personalized pastoral care plan.' },
  { emoji: '🏥', title: 'Ministry Health Report', slug: 'diagnosis', plan: 'Free', desc: 'See how your church is doing and get personalized recommendations to grow.' },
];

const starterFeatures = [
  { emoji: '📱', title: 'Sermon to Social Media', slug: 'sermon-social', plan: 'Starter', desc: 'Turn sermon notes into multiple engaging social media posts for Facebook, Instagram, X, all at once.' },
  { emoji: '📖', title: 'Daily Devotional', slug: 'daily-devotional', plan: 'Starter', desc: 'Bible verses, meditation prompts, life application, and closing prayer — fresh every day with email delivery.' },
  { emoji: '📰', title: 'Weekly Newsletter', slug: 'weekly-newsletter', plan: 'Starter', desc: 'Transform your week highlights into professional, engaging newsletters your congregation will actually read.' },
  { emoji: '🕊️', title: 'Sunday Worship Planner', slug: 'sunday-worship-planner', plan: 'Starter', desc: 'AI creates complete worship service plans — call to worship, hymns, scripture, sermon, benediction.' },
  { emoji: '📰', title: 'Monthly Newsletter', slug: 'monthly-newsletter', plan: 'Starter', desc: 'AI writes a full monthly newsletter — pastor message, highlights, events, ministry updates, prayer focus.' },
  { emoji: '📋', title: 'Template Marketplace', slug: 'templates', plan: 'Starter', desc: 'Share your gift, bless thousands. Browse and use sermon outlines and templates from pastors worldwide.' },
];

const proFeatures = [
  { emoji: '⚡', title: 'Batch Content', slug: 'batch-content', plan: 'Pro', desc: 'One sermon → 50 social media posts. One theme → a month of devotionals. Scale your ministry content.' },
  { emoji: '🧠', title: 'AI Habit Learning', slug: 'pastor/style-profile', plan: 'Pro', desc: 'ShepherdAI learns your style, tone, and preferences over time. The more you use it, the better it gets.' },
  { emoji: '🏅', title: 'Share Templates & Earn', slug: 'points-center', plan: 'Pro', desc: 'Share your sermon outlines and templates. Earn points and recognition from the community.' },
];

const growthFeatures = [
  { emoji: '🤖', title: 'Full Auto AI Ministry', slug: 'dashboard', plan: 'Growth', desc: 'AI writes, sends, and follows up. Let ShepherdAI run your entire ministry workflow autonomously.' },
  { emoji: '🏷️', title: 'White-Label Church Page', slug: 'church-community', plan: 'Growth', desc: 'Your church, your brand. Custom branded community page without ShepherdAI watermark.' },
  { emoji: '⭐', title: 'Founding Church Program', slug: 'founding-church', plan: 'Growth', desc: 'Exclusive founding church benefits, free for 1 year, direct input on product roadmap.' },
];

const communityFeatures = [
  { emoji: '🙏', title: 'Prayer Community', slug: 'prayer-requests', plan: 'Free', desc: 'Share prayer requests, pray for others, and grow together in a supportive faith community.' },
  { emoji: '📖', title: 'Daily Devotional', slug: 'daily-devotional', plan: 'Free', desc: 'Start every day with Scripture and reflection. Personalized to your spiritual journey. Free for everyone.' },
  { emoji: '⛪', title: 'Find a Church', slug: 'find-church', plan: 'Free', desc: 'Discover churches near you that use ShepherdAI. Connect with a welcoming community.' },
];

const churchMgmtFeatures = [
  { emoji: '👥', title: 'Membership Management', slug: 'membership-management', plan: 'Free', desc: 'Complete member directory, AI pastoral care plans, attendance tracking, small groups, volunteer scheduling. Know and care for every member.' },
  { emoji: '💰', title: 'Donation Management', slug: 'donation-management', plan: 'Free', desc: 'Track tithes and offerings, generate giving statements, run pledge campaigns, and analyze giving trends. All in one place.' },
  { emoji: '⛪', title: 'For Religious Organizations', slug: 'for-churches', plan: 'Free', desc: 'Purpose-built for churches with 13+ denomination support. Not a generic tool — every feature is designed around church ministry workflows.' },
];

export default function FeaturesPage() {
  return (
    <>
      <section style={{ padding: '80px 24px 40px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Features</p>
        <h1 style={{ fontSize: 48, fontWeight: 'bold', color: '#1e3a5f', lineHeight: 1.2, marginBottom: 16 }}>
          Everything You Need to Serve Better
        </h1>
        <p style={{ fontSize: 18, color: '#64748b', maxWidth: 700, margin: '0 auto 16px' }}>
          AI tools designed for pastors and congregations. Save hours every week on admin — and focus on what matters: shepherding your flock.
        </p>
        <Link href="/register" style={{ display: 'inline-block', padding: '14px 32px', background: '#1e3a5f', color: 'white', borderRadius: 8, fontWeight: 600, textDecoration: 'none', marginRight: 12 }}>
          Start Free →
        </Link>
        <Link href="#pastor-features" style={{ display: 'inline-block', padding: '14px 32px', background: 'white', color: '#1e3a5f', borderRadius: 8, fontWeight: 600, textDecoration: 'none', border: '1px solid #e2e8f0' }}>
          Explore Features ↓
        </Link>
      </section>

      <section id="pastor-features" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 8 }}>⛪ For Pastors & Church Leaders</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 40, fontSize: 16 }}>Automate the busywork. Shepherd more.</p>

        <FeatureSection title="Core Features — Free ($0/mo)" features={coreFeatures} color="#16a34a" />
        <FeatureSection title="Starter Features — $19/mo" features={starterFeatures} color="#2563eb" />
        <FeatureSection title="Pro Features — $39/mo" features={proFeatures} color="#7c3aed" />
        <FeatureSection title="Growth Features — $79/mo" features={growthFeatures} color="#f5a623" />
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 8 }}>🙏 For Congregants — Free</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 40, fontSize: 16 }}>Grow your faith. Connect with your church community. Always free.</p>
        <FeatureSection title={''} features={communityFeatures} color="#16a34a" />
      </section>

      {/* Church Management Core Features */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 8 }}>🏛️ Church Management Features</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 40, fontSize: 16 }}>Complete church management — membership, donations, and tools built for religious organizations.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {churchMgmtFeatures.map((f) => (
            <Link
              key={f.slug}
              href={`/${f.slug}`}
              style={{
                padding: '32px 28px', borderRadius: 16, border: '1px solid #e2e8f0', background: 'white',
                textDecoration: 'none', transition: 'box-shadow 0.2s, transform 0.2s',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.emoji}</div>
              <h3 style={{ fontSize: 20, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
              <span style={{ display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 600, color: '#3b82f6' }}>Learn More →</span>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ background: '#f8fafc', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 12 }}>Ready to Transform Your Ministry?</h2>
        <p style={{ fontSize: 18, color: '#64748b', marginBottom: 24 }}>Start saving hours every week on sermons, follow-ups, and church communications.</p>
        <AuthCTA featureHref="/dashboard" style={{ display: "inline-block", padding: "16px 40px", background: "#1e3a5f", color: "white", borderRadius: 8, fontWeight: 600, fontSize: 16 }}>
          Start Your Free Account
        </AuthCTA>
        <p style={{ marginTop: 12, color: '#94a3b8', fontSize: 14 }}>✅ Free forever plan · 🔒 No credit card · ⚡ Setup in 2 minutes</p>
      </section>
    </>
  );
}

function FeatureSection({ title, features, color }: { title: string; features: typeof coreFeatures; color: string }) {
  return (
    <div style={{ marginBottom: 48 }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid #f1f5f9' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0 }}></span>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>{title}</h3>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {features.map((f) => (
          <Link
            key={f.slug}
            href={`/features/${f.slug}`}
            style={{
              padding: 24,
              background: 'white',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
            }}
          >
            <div style={{ fontSize: 28, flexShrink: 0, width: 40, textAlign: 'center' }}>{f.emoji}</div>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>{f.title}</h4>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 8px' }}>{f.desc}</p>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Included in {f.plan}{' '}
                <span style={{ color }}>●</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
