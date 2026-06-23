import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getChurchPageMeta,
  getChurchContent,
  denominations,
  cities,
  type ChurchCity,
} from '@/data/church-seo-data';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtCity(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function stateFull(abbr: string): string {
  return cities.find((c) => c.state === abbr)?.stateFull ?? abbr.toUpperCase();
}

// ── SSG ──────────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  const params: { state: string; city: string; denomination: string }[] = [];
  for (const city of cities) {
    for (const denom of denominations) {
      params.push({ state: city.state, city: city.city, denomination: denom.slug });
    }
  }
  return params;
}

export const dynamicParams = false;

// ── Metadata ─────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ state: string; city: string; denomination: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, city: citySlug, denomination: denomSlug } = await params;
  const city = cities.find((c) => c.state === state && c.city === citySlug);
  const denom = denominations.find((d) => d.slug === denomSlug);
  if (!city || !denom) return { title: 'Church Not Found — ShepherdAI' };
  const meta = getChurchPageMeta(city, denom);
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
    },
    alternates: {
      canonical: `/find-church/${state}/${citySlug}/${denomSlug}`,
    },
  };
}

// ── Styles ───────────────────────────────────────────────────────────────────

const navy = '#1e3a5f';
const blue = '#4a90a4';
const cardBase: React.CSSProperties = {
  background: 'white',
  borderRadius: 12,
  padding: 24,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};

const sideLinkBase: React.CSSProperties = {
  display: 'block',
  padding: '10px 14px',
  background: '#f8fafc',
  borderRadius: 8,
  fontSize: 14,
  color: navy,
  textDecoration: 'none',
  border: '1px solid #e2e8f0',
  fontWeight: 500,
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ChurchDenomPage({ params }: Props) {
  const { state, city: citySlug, denomination: denomSlug } = await params;

  const city = cities.find((c) => c.state === state && c.city === citySlug);
  const denom = denominations.find((d) => d.slug === denomSlug);

  if (!city || !denom) {
    return (
      <div style={{ padding: 64, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ color: navy, fontSize: 24, marginBottom: 8 }}>Page Not Found</h1>
        <p style={{ color: '#666' }}>
          The church listing you&apos;re looking for doesn&apos;t exist.{' '}
          <Link href="/find-church" style={{ color: blue }}>
            Browse all churches
          </Link>
        </p>
      </div>
    );
  }

  const content = getChurchContent(city, denom);
  const cityDisplay = fmtCity(citySlug);
  const stateDisplay = city.stateFull;

  const nearbyCities = cities
    .filter((c) => c.state === state && c.city !== citySlug)
    .slice(0, 6);

  const otherDenoms = denominations.filter((d) => d.slug !== denomSlug);

  // ── JSON‑LD ──────────────────────────────────────────────────────────────

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I find ${denom.label} churches in ${cityDisplay}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Use ShepherdAI's free church finder to discover ${denom.label} churches in ${cityDisplay}, ${stateDisplay}. Browse church profiles, connect with pastors, and find worship services near you.`,
        },
      },
      {
        '@type': 'Question',
        name: `What ${denom.label} churches are in ${cityDisplay}, ${stateDisplay}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${cityDisplay} is home to several ${denom.label} congregations including ${city.knownChurches.slice(0, 3).join(', ')}. Discover more through ShepherdAI's free church finder.`,
        },
      },
      {
        '@type': 'Question',
        name: `Are there ${denom.label} worship services near me in ${cityDisplay}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, ${cityDisplay} has active ${denom.label} congregations offering Sunday worship, Bible studies, and community events. ShepherdAI helps you find and connect with the right church.`,
        },
      },
    ],
  };

  const searchActionSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ShepherdAI Church Finder',
    url: 'https://shepherdai.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://shepherdai.com/find-church?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(searchActionSchema) }}
      />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px', fontFamily: 'system-ui, sans-serif' }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 24, fontSize: 14, color: '#666' }}>
          <Link href="/find-church" style={{ color: blue, textDecoration: 'none' }}>
            Church Finder
          </Link>
          {' › '}
          <Link
            href={`/find-church?state=${state}`}
            style={{ color: blue, textDecoration: 'none' }}
          >
            {stateDisplay}
          </Link>
          {' › '}
          <span style={{ color: navy, fontWeight: 600 }}>{cityDisplay}</span>
        </nav>

        {/* Hero */}
        <div
          style={{
            background: `linear-gradient(135deg, ${navy} 0%, #2d5a87 100%)`,
            borderRadius: 16,
            padding: '48px 32px',
            marginBottom: 32,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>
            {content.heading}
          </h1>
          <p
            style={{
              fontSize: 16,
              opacity: 0.9,
              maxWidth: 640,
              margin: '0 auto 24px',
              lineHeight: 1.6,
            }}
          >
            {content.intro}
          </p>
          <Link
            href="/register"
            style={{
              display: 'inline-block',
              background: 'white',
              color: navy,
              padding: '14px 32px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 16,
              textDecoration: 'none',
            }}
          >
            Connect with {denom.label} Churches in {cityDisplay}
          </Link>
        </div>

        {/* Two‑column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: 24,
          }}
        >
          {/* ── MAIN ────────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Known churches */}
            <section style={cardBase}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: navy, marginBottom: 16 }}>
                {denom.label} Congregations in {cityDisplay}
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 12,
                }}
              >
                {city.knownChurches.map((name, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: 16,
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontSize: 14,
                        fontWeight: 600,
                        color: navy,
                        marginBottom: 4,
                      }}
                    >
                      {name}
                    </span>
                    <span style={{ fontSize: 12, color: '#666' }}>
                      {cityDisplay}, {stateDisplay}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* About */}
            <section style={cardBase}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: navy, marginBottom: 12 }}>
                About {denom.label} Churches in {cityDisplay}
              </h2>
              <p style={{ fontSize: 15, color: '#444', lineHeight: 1.7 }}>
                {cityDisplay}, {stateDisplay} is home to a vibrant {denom.label} community. With
                a population of {city.population}, {cityDisplay} offers many {denom.label}{' '}
                congregations serving the spiritual needs of the community. Whether you&apos;re
                looking for traditional worship, contemporary services, or community outreach,
                you&apos;ll find a church home in {cityDisplay}.
              </p>
            </section>

            {/* How it works */}
            <section style={cardBase}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: navy, marginBottom: 12 }}>
                How ShepherdAI Helps You Connect
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  `Browse ${denom.label} churches in ${cityDisplay} and connect directly`,
                  'Get personalized church recommendations based on your preferences',
                  'Join churches and earn points for community engagement',
                  'Pastors: register your church to reach more visitors',
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{
                      padding: '10px 0',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: 15,
                      color: '#444',
                    }}
                  >
                    <span style={{ color: blue, marginRight: 8, fontWeight: 700 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Bottom CTA */}
            <div
              style={{
                background: `linear-gradient(135deg, ${blue}, ${navy})`,
                borderRadius: 12,
                padding: 32,
                color: 'white',
                textAlign: 'center',
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                Find Your {denom.label} Church Home
              </h2>
              <p style={{ fontSize: 15, opacity: 0.9, marginBottom: 20 }}>
                Join ShepherdAI and connect with {denom.label} congregations in {cityDisplay}
              </p>
              <Link
                href="/register"
                style={{
                  display: 'inline-block',
                  background: 'white',
                  color: navy,
                  padding: '12px 28px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: 'none',
                }}
              >
                Get Started Free
              </Link>
            </div>
          </div>

          {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Other denominations in this city */}
            <aside style={cardBase}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: navy, marginBottom: 16 }}>
                Other Denominations in {cityDisplay}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {otherDenoms.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/find-church/${state}/${citySlug}/${d.slug}`}
                    style={sideLinkBase}
                  >
                    {d.label} Churches
                  </Link>
                ))}
              </div>
            </aside>

            {/* Nearby cities — same denomination */}
            <aside style={cardBase}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: navy, marginBottom: 16 }}>
                {denom.label} Churches in Nearby Cities
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {nearbyCities.map((c) => (
                  <Link
                    key={c.city}
                    href={`/find-church/${c.state}/${c.city}/${denomSlug}`}
                    style={sideLinkBase}
                  >
                    {fmtCity(c.city)} ← {denom.label}
                  </Link>
                ))}
              </div>
            </aside>

            {/* City quick‑facts */}
            <aside
              style={{
                background: '#f8fafc',
                borderRadius: 12,
                padding: 20,
                border: '1px solid #e2e8f0',
              }}
            >
              <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.6 }}>
                <strong>{cityDisplay}</strong> is a city in {stateDisplay} with an estimated
                population of {city.population}. Find {denom.label} churches and worship services
                near you with ShepherdAI.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
