import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Pricing — ShepherdAI' },
  description: 'Simple, transparent pricing for ShepherdAI. Start free ($0/mo), upgrade to Starter ($19/mo), Pro ($39/mo), or Growth ($79/mo). No credit card required.',
  alternates: {
    canonical: 'https://www.shepherdaitech.com/pricing',
  },
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    desc: '20 AI generations/month. Perfect for trying ShepherdAI.',
    bestValue: false,
    features: [
      '20 AI generations/month',
      'Visitor Follow-up Emails',
      'Prayer Request Management',
      'Church Announcements',
      'Church Community Page',
      'AI Member Pastoral Plan',
      'Ministry Health Report',
      'Community Knowledge Base',
      '5 Congregant Seats',
    ],
    cta: 'Start Free',
  },
  {
    name: 'Starter',
    price: '$19',
    period: '/mo',
    desc: 'For individual pastors ready to save time every week.',
    bestValue: false,
    features: [
      '100 AI generations/month',
      'Everything in Free',
      'Sermon to Social Media',
      'Daily Devotional Generator',
      'Weekly Newsletter Generator',
      'Sunday Worship Planner',
      'Monthly Church Newsletter',
      'Template Marketplace',
      '25 Congregant Seats',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Pro — Team Collaboration',
    price: '$39',
    period: '/mo',
    desc: 'AI that learns your style + collaboration + batch content.',
    bestValue: false,
    features: [
      '300 AI generations/month',
      'Everything in Starter',
      'Batch Content Studio (1 sermon → 50 posts)',
      'AI Habit Learning',
      'Share Templates & Earn Points',
      'Unlimited Congregant Seats',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Growth — Full Automation',
    price: '$79',
    period: '/mo',
    desc: 'Let AI run your entire ministry. White-label everything. Limited Founding spots!',
    bestValue: true,
    features: [
      'Unlimited AI generations',
      'Everything in Pro',
      'Full Auto AI Ministry Operations',
      'Founding Church Program ⭐',
      'White-Label Church Page',
      'Dedicated Account Manager',
      'Unlimited Congregant Seats',
    ],
    cta: 'Start Free Trial',
  },
];

export default function PricingPage() {
  return (
    <>
      <section style={{ padding: '80px 24px 40px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Pricing</p>
        <h1 style={{ fontSize: 48, fontWeight: 'bold', color: '#1e3a5f', lineHeight: 1.2, marginBottom: 16 }}>
          Simple, Transparent Pricing
        </h1>
        <p style={{ fontSize: 18, color: '#64748b', maxWidth: 700, margin: '0 auto 16px' }}>
          Start free, upgrade when you&apos;re ready. No hidden fees. No surprises. Just AI that actually does the work.
        </p>
        <Link href="/register" style={{ display: 'inline-block', padding: '14px 32px', background: '#1e3a5f', color: 'white', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>
          Start Free →
        </Link>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                padding: 32,
                background: 'white',
                borderRadius: 12,
                border: plan.bestValue ? '2px solid #f5a623' : '1px solid #e2e8f0',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {plan.bestValue && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f5a623, #f7c948)', color: 'white', padding: '4px 16px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                  BEST VALUE
                </div>
              )}
              <h3 style={{ fontSize: 22, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 8 }}>{plan.name}</h3>
              <div style={{ fontSize: 44, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 4 }}>
                {plan.price}<span style={{ fontSize: 16, fontWeight: 'normal', color: '#94a3b8' }}>{plan.period}</span>
              </div>
              <p style={{ color: '#64748b', marginBottom: 20, fontSize: 14, minHeight: 40 }}>{plan.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28, textAlign: 'left', fontSize: 14, flex: 1 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, color: '#475569', lineHeight: 1.5 }}>
                    <span style={{ color: '#16a34a', flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                style={{
                  display: 'block',
                  padding: '14px 24px',
                  background: plan.bestValue ? 'linear-gradient(135deg, #f5a623, #f7c948)' : '#1e3a5f',
                  color: plan.bestValue ? '#1e3a5f' : 'white',
                  borderRadius: 8,
                  fontWeight: 600,
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <section style={{ marginTop: '60px', padding: '40px 0 0' }}>
          <h2 style={{ fontSize: 28, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 8 }}>How We Compare</h2>
          <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 32 }}>Same job. Fraction of the cost. AI that actually does the work.</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <thead>
                <tr style={{ background: '#1e3a5f', color: 'white' }}>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>Feature</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, background: '#2d5a8e' }}>ShepherdAI<br /><span style={{ fontSize: 11, fontWeight: 400 }}>$0-79/mo</span></th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600 }}>Breeze<br /><span style={{ fontSize: 11, fontWeight: 400 }}>$72/mo</span></th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600 }}>Tithe.ly<br /><span style={{ fontSize: 11, fontWeight: 400 }}>$49+/mo</span></th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600 }}>Planning Center<br /><span style={{ fontSize: 11, fontWeight: 400 }}>$0-279/mo</span></th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={5} style={{ padding: '10px 14px', fontWeight: 600, color: '#1e3a5f', background: '#f8fafc' }}>AI & Automation</td></tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fffbeb' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#92400e' }}>🔥 AI Sermon Prep & Research</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: 700, color: '#15803d' }}>✓ Free</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px' }}>AI Content Generation</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: 700, color: '#15803d' }}>✓ Free</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <td style={{ padding: '10px 14px' }}>AI Learns Your Style</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: 700, color: '#15803d' }}>✓ Pro+</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px' }}>Batch Content (1 → 50 posts)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: 700, color: '#15803d' }}>✓ Pro+</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                </tr>
                <tr><td colSpan={5} style={{ padding: '10px 14px', fontWeight: 600, color: '#1e3a5f', background: '#f8fafc' }}>Ministry Tools</td></tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px' }}>Church Health Diagnosis</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: 700, color: '#15803d' }}>✓ AI-powered</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <td style={{ padding: '10px 14px' }}>Denomination-Aware AI (13+)</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: 700, color: '#15803d' }}>✓</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td><td style={{ padding: '10px 14px', textAlign: 'center', color: '#999' }}>✗</td>
                </tr>
                <tr><td colSpan={5} style={{ padding: '10px 14px', fontWeight: 600, color: '#1e3a5f', background: '#f8fafc' }}>Value</td></tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px' }}>Starting Price</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: 700, color: '#15803d' }}>$0</td><td style={{ padding: '10px 14px', textAlign: 'center' }}>$72/mo</td><td style={{ padding: '10px 14px', textAlign: 'center' }}>$49/mo</td><td style={{ padding: '10px 14px', textAlign: 'center' }}>$0-279/mo</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <td style={{ padding: '10px 14px' }}>Setup Time</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', background: '#f0fdf4', fontWeight: 700, color: '#15803d' }}>2 minutes</td><td style={{ padding: '10px 14px', textAlign: 'center' }}>Weeks</td><td style={{ padding: '10px 14px', textAlign: 'center' }}>Days</td><td style={{ padding: '10px 14px', textAlign: 'center' }}>Days</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: 'center', marginTop: 24, color: '#64748b', fontSize: 14 }}>
            They manage your church. We automate your ministry.
          </div>
        </section>
      </section>

      {/* 🆕 Founding Member Urgency Banner */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px' }}>
        <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '2px solid #f59e0b', borderRadius: 16, padding: '28px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⭐</div>
          <h2 style={{ fontSize: 22, fontWeight: '800', color: '#92400e', marginBottom: 8 }}>
            Founding Church Program — Limited to 10 Churches!
          </h2>
          <p style={{ fontSize: 15, color: '#92400e', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 16px' }}>
            Get <strong>50% off lifetime</strong> on any plan, early access to new features, direct roadmap input, 
            and a <strong>Founding Church badge</strong> on your church page. 
            Only <strong className="text-red-600 font-bold">10 founding spots</strong> available — and they&quot;re going fast!
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/register" style={{ display: 'inline-block', padding: '12px 28px', background: '#1e3a5f', color: 'white', borderRadius: 10, fontWeight: '700', fontSize: 15, textDecoration: 'none' }}>
              🚀 Claim Your Founding Spot
            </a>
            <a href="/founding-church" style={{ display: 'inline-block', padding: '12px 28px', background: 'rgba(30,58,95,0.1)', color: '#1e3a5f', borderRadius: 10, fontWeight: '600', fontSize: 15, textDecoration: 'none', border: '1px solid #1e3a5f' }}>
              Learn More →
            </a>
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: '#92400e', opacity: 0.8 }}>
            ⚡ 0 founding spots claimed so far — be the first!
          </div>
        </div>
      </section>      {/* FAQ Section */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 32 }}>Frequently Asked Questions</h2>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'Can I use ShepherdAI for free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes! The Free plan gives you 20 AI generations per month with full access to core features including visitor follow-up emails, prayer management, church announcements, community page, AI member pastoral plan, ministry health report, and community knowledge base. No credit card required.' } },
            { '@type': 'Question', name: 'What happens when I reach my AI generation limit?', acceptedAnswer: { '@type': 'Answer', text: 'When you reach your monthly generation limit, you can still access all your saved content. To continue generating, simply upgrade to a higher plan — Starter ($19/mo for 100 generations), Pro ($39/mo for 300), or Growth ($79/mo for unlimited).' } },
            { '@type': 'Question', name: 'Is there a contract or commitment?', acceptedAnswer: { '@type': 'Answer', text: 'No contracts. No hidden fees. All paid plans are month-to-month. You can cancel anytime with one click. Your data is always yours to export.' } },
            { '@type': 'Question', name: 'Can I switch plans later?', acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. Upgrade or downgrade anytime. If you upgrade mid-month, you get instant access to the new features. If you downgrade, it takes effect at the end of your billing cycle.' } },
            { '@type': 'Question', name: 'What denominations does ShepherdAI support?', acceptedAnswer: { '@type': 'Answer', text: 'ShepherdAI is denomination-aware and supports 13+ denominations including Baptist, Methodist, Lutheran, Presbyterian, Pentecostal, Catholic, Non-Denominational, Anglican, Orthodox, Adventist, Reformed, Nazarene, and Assemblies of God. You can switch anytime in Settings.' } },
            { '@type': 'Question', name: 'Do you offer a discount for annual billing?', acceptedAnswer: { '@type': 'Answer', text: 'Yes! Save 20% when you switch to annual billing on any paid plan. You can toggle between monthly and annual in your Settings page.' } },
            { '@type': 'Question', name: 'What support do you offer?', acceptedAnswer: { '@type': 'Answer', text: 'All plans include email support. Growth plan users get a dedicated account manager. We also have an active community knowledge base where pastors help each other.' } },
          ],
        }) }} />
        <dl>
          <div style={{ background: 'white', borderRadius: 10, padding: '20px 24px', marginBottom: 12, border: '1px solid #e2e8f0' }}>
            <dt style={{ fontWeight: 700, fontSize: 16, color: '#1e3a5f', marginBottom: 8 }}>Can I use ShepherdAI for free?</dt>
            <dd style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, margin: 0 }}>Yes! The Free plan gives you 20 AI generations per month with full access to core features including visitor follow-up emails, prayer management, church announcements, community page, AI member pastoral plan, ministry health report, and community knowledge base. <strong>No credit card required.</strong></dd>
          </div>
          <div style={{ background: 'white', borderRadius: 10, padding: '20px 24px', marginBottom: 12, border: '1px solid #e2e8f0' }}>
            <dt style={{ fontWeight: 700, fontSize: 16, color: '#1e3a5f', marginBottom: 8 }}>What happens when I reach my AI generation limit?</dt>
            <dd style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, margin: 0 }}>When you reach your monthly generation limit, you can still access all your saved content. To continue generating, simply upgrade to a higher plan — Starter ($19/mo for 100 generations), Pro ($39/mo for 300), or Growth ($79/mo for unlimited).</dd>
          </div>
          <div style={{ background: 'white', borderRadius: 10, padding: '20px 24px', marginBottom: 12, border: '1px solid #e2e8f0' }}>
            <dt style={{ fontWeight: 700, fontSize: 16, color: '#1e3a5f', marginBottom: 8 }}>Is there a contract or commitment?</dt>
            <dd style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, margin: 0 }}>No contracts. No hidden fees. All paid plans are month-to-month. You can cancel anytime with one click. Your data is always yours to export.</dd>
          </div>
          <div style={{ background: 'white', borderRadius: 10, padding: '20px 24px', marginBottom: 12, border: '1px solid #e2e8f0' }}>
            <dt style={{ fontWeight: 700, fontSize: 16, color: '#1e3a5f', marginBottom: 8 }}>Can I switch plans later?</dt>
            <dd style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, margin: 0 }}>Absolutely. Upgrade or downgrade anytime. If you upgrade mid-month, you get instant access to the new features. If you downgrade, it takes effect at the end of your billing cycle.</dd>
          </div>
          <div style={{ background: 'white', borderRadius: 10, padding: '20px 24px', marginBottom: 12, border: '1px solid #e2e8f0' }}>
            <dt style={{ fontWeight: 700, fontSize: 16, color: '#1e3a5f', marginBottom: 8 }}>What denominations does ShepherdAI support?</dt>
            <dd style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, margin: 0 }}>ShepherdAI is denomination-aware and supports 13+ denominations including Baptist, Methodist, Lutheran, Presbyterian, Pentecostal, Catholic, Non-Denominational, Anglican, Orthodox, Adventist, Reformed, Nazarene, and Assemblies of God. You can switch anytime in Settings.</dd>
          </div>
          <div style={{ background: 'white', borderRadius: 10, padding: '20px 24px', marginBottom: 12, border: '1px solid #e2e8f0' }}>
            <dt style={{ fontWeight: 700, fontSize: 16, color: '#1e3a5f', marginBottom: 8 }}>Do you offer a discount for annual billing?</dt>
            <dd style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, margin: 0 }}>Yes! Save 20% when you switch to annual billing on any paid plan. You can toggle between monthly and annual in your Settings page.</dd>
          </div>
          <div style={{ background: 'white', borderRadius: 10, padding: '20px 24px', marginBottom: 12, border: '1px solid #e2e8f0' }}>
            <dt style={{ fontWeight: 700, fontSize: 16, color: '#1e3a5f', marginBottom: 8 }}>What support do you offer?</dt>
            <dd style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, margin: 0 }}>All plans include email support. Growth plan users get a dedicated account manager. We also have an active community knowledge base where pastors help each other.</dd>
          </div>
        </dl>
      </section>

      <section style={{ background: '#f8fafc', padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 12 }}>Ready to Get Started?</h2>
        <p style={{ fontSize: 18, color: '#64748b', marginBottom: 24 }}>Start saving hours every week on sermons, follow-ups, and church communications.</p>
        <Link href="/register" style={{ display: 'inline-block', padding: '16px 40px', background: '#1e3a5f', color: 'white', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 16 }}>
          Start Your Free Account
        </Link>
        <p style={{ marginTop: 12, color: '#94a3b8', fontSize: 14 }}>✅ Free forever plan · 🔒 No credit card · ⚡ Setup in 2 minutes</p>
      </section>
    </>
  );
}
