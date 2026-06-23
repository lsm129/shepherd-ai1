import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Church Visitor Follow-Up Email Generator | ShepherdAI' },
  description:
    'AI writes personalized follow-up emails for church visitors. 6-email sequences designed to welcome, connect, and bring visitors back. Free to try.',
  alternates: {
    canonical: 'https://www.shepherdaitech.com/tools/visitor-followup-email',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Church Visitor Follow-Up Email Generator',
  description:
    'AI writes personalized follow-up emails for church visitors. 6-email sequences designed to welcome, connect, and bring visitors back.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Enter Visitor Information',
      text: 'Input the visitor\'s name, how they found your church, and any notes about their visit (family status, interests, prayer requests).',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'AI Generates a 6-Email Sequence',
      text: 'ShepherdAI generates six personalized, unique emails tailored to the visitor\'s background and journey — each with a distinct purpose in the follow-up sequence.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Review, Edit & Send',
      text: 'Preview each email, make any edits, personalize further, and schedule or send the sequence directly from ShepherdAI.',
    },
  ],
  tool: [
    {
      '@type': 'HowToTool',
      name: 'ShepherdAI Visitor Follow-Up Email Generator',
    },
  ],
};

const emailSequence = [
  {
    day: 'Email 1',
    timeline: 'Within 24 hours',
    subject: 'Thank You for Worshiping With Us!',
    purpose:
      'A warm, immediate thank-you that acknowledges their visit without pressure. Includes service details, a personal note from the pastor, and a gentle invitation to return.',
    icon: '📬',
  },
  {
    day: 'Email 2',
    timeline: 'Day 3',
    subject: 'We\'d Love to Get to Know You',
    purpose:
      'A relational email sharing more about the church\'s story, ministries, and small groups. Includes an invitation to coffee with the pastor or a church leader.',
    icon: '☕',
  },
  {
    day: 'Email 3',
    timeline: 'Day 5',
    subject: 'Something That Might Interest You',
    purpose:
      'Based on what you know about the visitor (kids, young adult, empty nester), the AI recommends a specific ministry, event, or small group that fits their season of life.',
    icon: '🎯',
  },
  {
    day: 'Email 4',
    timeline: 'Day 10',
    subject: 'A Message From This Sunday\'s Sermon',
    purpose:
      'Shares a highlight from the most recent sermon — a key takeaway, scripture, or reflection — to stay top of mind and provide spiritual value.',
    icon: '📖',
  },
  {
    day: 'Email 5',
    timeline: 'Day 14',
    subject: 'You\'re Invited!',
    purpose:
      'A warm invitation to an upcoming church event, service, or newcomer gathering. Makes a specific, actionable invitation rather than a generic "come back."',
    icon: '🎉',
  },
  {
    day: 'Email 6',
    timeline: 'Day 21',
    subject: 'Checking In',
    purpose:
      'A gentle final check-in. Softens any pressure, simply asks how they\'re doing, and leaves the door open with a low-friction invitation to connect when ready.',
    icon: '💛',
  },
];

export default function VisitorFollowupEmailPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section
        style={{
          backgroundColor: '#1e3a5f',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%)',
          padding: '80px 24px',
          textAlign: 'center',
          color: '#ffffff',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: 'uppercase',
              opacity: 0.8,
              marginBottom: 16,
            }}
          >
            Free AI Tool for Pastors
          </p>
          <h1
            style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 800,
              marginBottom: 20,
              lineHeight: 1.2,
            }}
          >
            Church Visitor Follow-Up Email Generator
          </h1>
          <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 32, lineHeight: 1.6 }}>
            AI writes personalized follow-up emails for church visitors. 6-email sequences designed
            to welcome, connect, and bring visitors back. Free to try.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/visitor-followup"
              style={{
                backgroundColor: '#ffffff',
                color: '#1e3a5f',
                fontWeight: 700,
                fontSize: 16,
                padding: '14px 36px',
                borderRadius: 8,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Try the Follow-Up Email Generator Free
            </Link>
            <Link
              href="/register"
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 16,
                padding: '14px 36px',
                borderRadius: 8,
                border: '2px solid rgba(255,255,255,0.5)',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Create Free Account
            </Link>
          </div>
          <p style={{ fontSize: 13, marginTop: 16, opacity: 0.65 }}>
            No credit card required · Free plan includes visitor follow-up · Cancel anytime
          </p>
        </div>
      </section>

      {/* The Problem Stats */}
      <section style={{ padding: '80px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 800,
              color: '#1e3a5f',
              marginBottom: 16,
            }}
          >
            Why Follow-Up Matters
          </h2>
          <p
            style={{
              fontSize: 17,
              color: '#64748b',
              marginBottom: 48,
              lineHeight: 1.6,
              maxWidth: 700,
              margin: '0 auto 48px auto',
            }}
          >
            First-time visitors are a precious gift to your church. But without intentional follow-up,
            most will never come back.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 24,
            }}
          >
            {[
              {
                stat: '70%',
                label: 'of first-time visitors never return without follow-up contact',
                color: '#ef4444',
              },
              {
                stat: '85%',
                label: 'of returning visitors say follow-up contact influenced their decision',
                color: '#10b981',
              },
              {
                stat: '48%',
                label: 'of churches have no structured visitor follow-up process',
                color: '#f59e0b',
              },
              {
                stat: '3x',
                label: 'higher retention rate for churches that follow up within 48 hours',
                color: '#1e3a5f',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: 12,
                  padding: '32px 20px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    fontSize: 42,
                    fontWeight: 800,
                    color: item.color,
                    marginBottom: 8,
                  }}
                >
                  {item.stat}
                </div>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 24px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 800,
              color: '#1e3a5f',
              marginBottom: 12,
            }}
          >
            How It Works
          </h2>
          <p
            style={{
              textAlign: 'center',
              fontSize: 17,
              color: '#64748b',
              marginBottom: 48,
              lineHeight: 1.6,
            }}
          >
            From visitor to returning member — an automated follow-up sequence in three steps.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {[
              {
                number: '1',
                icon: '📝',
                title: 'Enter Visitor Information',
                desc: 'Input the visitor\'s name, how they found your church, and any notes from their visit — family details, interests, prayer requests, or conversation highlights.',
              },
              {
                number: '2',
                icon: '🤖',
                title: 'AI Generates 6 Personalized Emails',
                desc: 'ShepherdAI creates six unique, warm emails over 21 days. Each email has a distinct purpose: welcome, connect, recommend, inspire, invite, and check in. No two emails are the same.',
              },
              {
                number: '3',
                icon: '✅',
                title: 'Review, Edit & Send',
                desc: 'Preview every email. Personalize further if you want. Schedule them automatically or send manually. Track opens and engagement.',
              },
            ].map((step) => (
              <div
                key={step.number}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: 36,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{step.icon}</div>
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#1e3a5f',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '4px 12px',
                    borderRadius: 20,
                    marginBottom: 16,
                  }}
                >
                  Step {step.number}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', marginBottom: 12 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6-Email Flow */}
      <section style={{ padding: '80px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 800,
              color: '#1e3a5f',
              marginBottom: 12,
            }}
          >
            The 6-Email Follow-Up Sequence
          </h2>
          <p
            style={{
              textAlign: 'center',
              fontSize: 17,
              color: '#64748b',
              marginBottom: 48,
              lineHeight: 1.6,
            }}
          >
            A proven, pastor-tested sequence designed over 21 days. No spam — just thoughtful,
            personal touchpoints.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {emailSequence.map((email, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 20,
                  backgroundColor: '#f8fafc',
                  borderRadius: 12,
                  padding: 24,
                  border: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#1e3a5f',
                    color: '#ffffff',
                    minWidth: 48,
                    height: 48,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e3a5f' }}>
                      {email.day}
                    </h3>
                    <span
                      style={{
                        fontSize: 12,
                        color: '#64748b',
                        backgroundColor: '#e2e8f0',
                        padding: '2px 10px',
                        borderRadius: 12,
                      }}
                    >
                      {email.timeline}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: '#334155',
                      fontStyle: 'italic',
                      marginBottom: 8,
                    }}
                  >
                    Subject: &ldquo;{email.subject}&rdquo;
                  </p>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                    {email.purpose}
                  </p>
                </div>
                <div style={{ fontSize: 28, alignSelf: 'center' }}>{email.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', backgroundColor: '#1e3a5f' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', color: '#ffffff' }}>
          <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 800, marginBottom: 48 }}>
            Why Pastors Trust ShepherdAI for Visitor Follow-Up
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 32,
            }}
          >
            {[
              {
                title: '100% Personalized',
                desc: 'AI writes each email based on the visitor\'s actual background — how they found you, their family situation, and their interests. No templates with blanks to fill in.',
              },
              {
                title: '6-Email Proven Sequence',
                desc: 'Designed with pastor input. Each email has a unique purpose. The sequence has been proven to increase return visits by up to 3x.',
              },
              {
                title: 'Pastor Keeps Control',
                desc: 'Every email goes through you first. Preview, edit, add personal touches, or rewrite completely. AI is the assistant — you make the final call.',
              },
              {
                title: 'Auto-Send or Manual',
                desc: 'Set it and forget it with automated scheduling, or send each email manually one at a time. The choice is yours.',
              },
              {
                title: 'Congregant Profiles',
                desc: 'When visitors create a free account, their profile is automatically enriched — occupation, family, interests — helping you pastor them better.',
              },
              {
                title: 'Mobile-Ready',
                desc: 'Approve and send follow-up emails from your phone. Perfect for busy pastors on the go.',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: 28,
                }}
              >
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 24px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 800,
              color: '#1e3a5f',
              marginBottom: 48,
            }}
          >
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              {
                q: 'Is the visitor follow-up tool really free?',
                a: 'Yes! The Free plan includes 20 AI generations per month, and visitor follow-up emails are included. No credit card is required to get started.',
              },
              {
                q: 'How personalized are the emails?',
                a: 'Very. ShepherdAI generates unique emails for each visitor based on their name, how they found your church, family situation, occupation, and any conversation notes you provide. No two email sequences are identical.',
              },
              {
                q: 'Can I customize the 6-email sequence timing?',
                a: 'Yes. The default sequence is spaced across 3 weeks (Day 1, 3, 5, 10, 14, 21), but you can adjust the timing for each email to fit your church\'s rhythm.',
              },
              {
                q: 'Do I have to send all 6 emails?',
                a: 'No. You can use as many or as few as you like. Some churches use all 6, others use just the first 3. You\'re in complete control.',
              },
              {
                q: 'What if the visitor replies to an email?',
                a: 'Follow-up emails come from your connected email address. When a visitor replies, it goes directly to your inbox — not lost in an automated system.',
              },
              {
                q: 'Can I use this for returning visitors too?',
                a: 'Absolutely! The AI adapts based on the context you provide — whether someone is a first-time visitor, a returning guest, or someone who has been away for a while.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 10,
                  padding: '28px 32px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e3a5f', marginBottom: 10 }}>
                  {faq.q}
                </h3>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', backgroundColor: '#ffffff' }}>
        <div
          style={{
            maxWidth: 700,
            margin: '0 auto',
            textAlign: 'center',
            backgroundColor: '#1e3a5f',
            borderRadius: 16,
            padding: '56px 40px',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(22px, 4vw, 32px)',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: 16,
            }}
          >
            Don&apos;t Let Another Visitor Slip Away
          </h2>
          <p
            style={{
              fontSize: 17,
              color: 'rgba(255,255,255,0.85)',
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            70% of first-time visitors never return without follow-up. Start sending personalized,
            AI-crafted emails today — free, no credit card required.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/visitor-followup"
              style={{
                backgroundColor: '#ffffff',
                color: '#1e3a5f',
                fontWeight: 700,
                fontSize: 16,
                padding: '14px 36px',
                borderRadius: 8,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Try the Follow-Up Email Generator Free
            </Link>
            <Link
              href="/register"
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 16,
                padding: '14px 36px',
                borderRadius: 8,
                border: '2px solid rgba(255,255,255,0.5)',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#f8fafc', padding: '16px 24px', textAlign: 'center' }}>
        <nav style={{ fontSize: 13, color: '#64748b' }}>
          <Link href="/" style={{ color: '#1e3a5f', textDecoration: 'none' }}>
            Home
          </Link>
          {' / '}
          <Link href="/tools" style={{ color: '#1e3a5f', textDecoration: 'none' }}>
            Free Church Tools
          </Link>
          {' / '}
          <span style={{ color: '#94a3b8' }}>Visitor Follow-Up Email Generator</span>
        </nav>
      </div>
    </>
  );
}
