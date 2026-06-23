import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Free Daily Devotional Generator for Your Church | ShepherdAI' },
  description:
    'Send personalized daily devotionals to your congregation. AI-generated Bible verses, meditation prompts, and prayers. Fresh content every day.',
  alternates: {
    canonical: 'https://www.shepherdaitech.com/tools/daily-devotional-generator',
  },
};

const sampleDevotional = {
  date: 'Today',
  theme: 'God\'s Faithfulness in Uncertainty',
  verse: {
    text: 'The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.',
    reference: 'Lamentations 3:22-23 (ESV)',
  },
  meditation:
    'In seasons of uncertainty, it is easy to fix our eyes on what we cannot control. Yet the prophet Jeremiah, writing from the rubble of Jerusalem, declares an unshakeable truth: God\'s mercies are new every morning. Not some mornings. Not when we\'ve earned them. Every single morning, without fail. Before you face the demands of today, pause and receive this: the same God who was faithful yesterday will be faithful today. His love has not run out. His mercy has not expired. Great is His faithfulness — not because your circumstances are great, but because He is.',
  prayer:
    'Lord, in the uncertainty of today, anchor my heart in Your faithfulness. When my mind races toward what could go wrong, gently turn it toward what You have already promised. Thank You that Your mercies are new this morning — not because I deserve them, but because You are good. Help me to trust You with what I cannot see and to walk in confidence, not in fear. Amen.',
  reflection: 'What area of your life needs a fresh reminder of God\'s faithfulness today? Write down one way God has been faithful to you this past week.',
};

const benefits = [
  {
    icon: '🌅',
    title: 'Daily Spiritual Nourishment',
    desc: 'Your congregation receives a fresh devotional every morning — Bible verse, meditation, prayer, and reflection question. A 3-minute spiritual reset before the day begins.',
  },
  {
    icon: '🙌',
    title: 'Zero Pastor Work',
    desc: 'Once configured, ShepherdAI generates devotionals automatically. No writing, no scheduling, no scrambling for content. Your congregation stays fed while you focus on ministry.',
  },
  {
    icon: '🎯',
    title: 'Personalized by Tradition',
    desc: 'Devotionals match your denomination, worship style, and preferred Bible translation. Baptist, Methodist, Pentecostal, Catholic — every tradition gets content that fits.',
  },
  {
    icon: '📧',
    title: 'Email or In-App Delivery',
    desc: 'Deliver devotionals via email or directly in the ShepherdAI congregant app. Your members choose how they receive content.',
  },
  {
    icon: '❤️',
    title: 'Builds Daily Connection',
    desc: 'Daily touchpoints keep your church connected between Sundays. Members start their day engaged with God\'s Word — and with your church.',
  },
  {
    icon: '📊',
    title: 'Track Engagement',
    desc: 'See who opens, who reads, and who engages. Identify members who may need a personal pastoral check-in.',
  },
];

export default function DailyDevotionalGeneratorPage() {
  return (
    <>
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
            Free Daily Devotional Generator for Your Church
          </h1>
          <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 32, lineHeight: 1.6 }}>
            Send personalized daily devotionals to your congregation. AI-generated Bible verses,
            meditation prompts, and prayers. Fresh content every day.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/daily-devotional"
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
              Start Generating Free Daily Devotionals
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
            No credit card required · Free plan includes daily devotionals · Cancel anytime
          </p>
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
            Set it up once. ShepherdAI delivers fresh, personalized devotionals every day.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 32,
            }}
          >
            {[
              {
                number: '1',
                icon: '⚙️',
                title: 'Configure Your Devotional Style',
                desc: 'Choose your denomination, preferred Bible translation, tone (pastoral, reflective, encouraging), and delivery method — email, in-app, or both.',
              },
              {
                number: '2',
                icon: '🤖',
                title: 'AI Generates Fresh Content Daily',
                desc: 'Every morning, ShepherdAI creates a brand new devotional: a carefully selected Bible verse, a 200-300 word meditation, a closing prayer, and a reflection question for personal application.',
              },
              {
                number: '3',
                icon: '📬',
                title: 'Delivered to Your Congregation',
                desc: 'Your congregants wake up to a fresh devotional in their inbox or app. You can preview before sending, or let it auto-deliver on your configured schedule.',
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

      {/* Sample Devotional */}
      <section style={{ padding: '80px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 800,
              color: '#1e3a5f',
              marginBottom: 12,
            }}
          >
            Sample Daily Devotional
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
            Here is what your congregation receives every morning — fresh, theologically sound, and
            personally meaningful.
          </p>
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: 16,
              border: '2px solid #e2e8f0',
              padding: '48px 40px',
            }}
          >
            <div
              style={{
                textAlign: 'center',
                marginBottom: 32,
              }}
            >
              <span
                style={{
                  backgroundColor: '#1e3a5f',
                  color: '#ffffff',
                  padding: '6px 20px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {sampleDevotional.date}
              </span>
              <h3
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: '#1e3a5f',
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                {sampleDevotional.theme}
              </h3>
            </div>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 10,
                padding: 24,
                border: '1px solid #e2e8f0',
                marginBottom: 28,
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontSize: 17,
                  fontStyle: 'italic',
                  color: '#1e3a5f',
                  lineHeight: 1.8,
                  marginBottom: 12,
                }}
              >
                &ldquo;{sampleDevotional.verse.text}&rdquo;
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: '#64748b',
                  fontWeight: 600,
                }}
              >
                — {sampleDevotional.verse.reference}
              </p>
            </div>
            <div style={{ marginBottom: 28 }}>
              <h4
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#1e3a5f',
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Meditation
              </h4>
              <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.9 }}>
                {sampleDevotional.meditation}
              </p>
            </div>
            <div style={{ marginBottom: 28 }}>
              <h4
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#1e3a5f',
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Prayer
              </h4>
              <p
                style={{
                  fontSize: 15,
                  color: '#334155',
                  lineHeight: 1.9,
                  fontStyle: 'italic',
                }}
              >
                {sampleDevotional.prayer}
              </p>
            </div>
            <div>
              <h4
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#1e3a5f',
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Reflection
              </h4>
              <p
                style={{
                  fontSize: 15,
                  color: '#334155',
                  lineHeight: 1.7,
                }}
              >
                {sampleDevotional.reflection}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '80px 24px', backgroundColor: '#1e3a5f' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', color: '#ffffff' }}>
          <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 800, marginBottom: 12 }}>
            Benefits for Your Congregation
          </h2>
          <p
            style={{
              textAlign: 'center',
              fontSize: 17,
              opacity: 0.8,
              marginBottom: 48,
              lineHeight: 1.6,
            }}
          >
            Daily devotionals keep your congregation spiritually engaged and connected to your church
            — every single day.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 32,
            }}
          >
            {benefits.map((item, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: 28,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 14 }}>{item.icon}</div>
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
                q: 'Is the daily devotional generator really free?',
                a: 'Yes! ShepherdAI includes daily devotional generation in the Free plan (20 AI generations/month). For daily delivery to your congregation, the Starter plan provides unlimited access.',
              },
              {
                q: 'Are the devotionals theologically sound?',
                a: 'Yes. Every devotional is AI-generated with safeguards for theological accuracy. Content is tailored to your denomination, uses your preferred Bible translation, and you can preview and edit every devotional before it reaches your congregation.',
              },
              {
                q: 'Can I customize the devotional format?',
                a: 'Absolutely. Choose your preferred structure — verse, meditation, prayer, reflection — or customize the sections. Adjust tone (pastoral, encouraging, reflective, academic), length, and delivery time.',
              },
              {
                q: 'How are devotionals delivered?',
                a: 'You choose: email delivery to your congregation (via your connected email), in-app delivery through the ShepherdAI congregant app, or both.',
              },
              {
                q: 'Do I have to approve each devotional before it sends?',
                a: 'You can choose. Preview mode lets you review and approve each devotional before sending. Auto-pilot mode delivers them automatically on your schedule. Switch between modes any time.',
              },
              {
                q: 'What if I need devotionals in another language?',
                a: 'ShepherdAI supports devotionals in English, Spanish, Portuguese, French, Korean, and more. Set your preferred language in your church profile.',
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
            Keep Your Congregation Spiritually Fed Every Day
          </h2>
          <p
            style={{
              fontSize: 17,
              color: 'rgba(255,255,255,0.85)',
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Start generating and sending personalized daily devotionals today. Fresh content every
            morning — zero extra work for you.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/daily-devotional"
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
              Start Generating Free Daily Devotionals
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
          <span style={{ color: '#94a3b8' }}>Daily Devotional Generator</span>
        </nav>
      </div>
    </>
  );
}
