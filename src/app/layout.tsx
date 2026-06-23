import type { Metadata, Viewport } from "next";
import "./globals.css";
import ConditionalShell from "@/components/ConditionalShell";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import SocialProofBanner from "@/components/SocialProofBanner";
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    template: '%s — ShepherdAI',
    default: 'ShepherdAI | Church Management That Works While You Minister — From $0/mo',
  },
  description: "Save 15+ hours every week with AI that handles visitor follow-ups, sermons, newsletters, and prayer management—so you can focus on your congregation, not admin. Free plan, no credit card.",
  keywords: "church management software, AI pastor tool, church visitor follow-up, sermon AI, church newsletter generator, prayer management, free church software",
  openGraph: {
    title: 'ShepherdAI | AI-Powered Church Management — Free Plan Available',
    description: 'Save 15+ hours/week. AI visitor follow-up, sermon-to-social, prayer management, and more. Built for pastors, priced for ministry.',
    url: 'https://www.shepherdaitech.com',
    siteName: 'ShepherdAI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.shepherdaitech.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ShepherdAI - AI-Powered Church Management Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShepherdAI | AI-Powered Church Management — Free Plan Available',
    description: 'Save 15+ hours/week. AI visitor follow-up, sermon-to-social, prayer management, and more. Built for pastors, priced for ministry.',
    images: ['https://www.shepherdaitech.com/og-image.png'],
  },
  metadataBase: new URL("https://www.shepherdaitech.com"),
  alternates: {
    canonical: 'https://www.shepherdaitech.com',
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ShepherdAI",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const BUILD_HASH = '2026-06-16-sitemap-v3';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is ShepherdAI?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "ShepherdAI is a church management platform that automates admin tasks for pastors — visitor follow-up, sermon-to-social media, prayer management, devotionals, newsletters, and more — saving 15+ hours per week."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is ShepherdAI free?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, ShepherdAI offers a free plan with 20 AI generations per month, 7 core features, and 5 congregant seats. No credit card required. Paid plans start at $19/month."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does ShepherdAI compare to Planning Center or Church Community Builder?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "ShepherdAI starts at $0/mo vs $49-72/mo for competitors like Breeze, Tithe.ly, and Planning Center. It offers AI-powered visitor follow-up with 6 unique emails per visitor, AI style learning, batch content studio, and all-in-one tools. Competitors charge more but offer zero AI automation."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is my church data safe with ShepherdAI?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "ShepherdAI uses 256-bit AES encryption, is GDPR compliant, and never sells or shares your data. No credit card is required to start."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can ShepherdAI write personalized follow-up emails for church visitors?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. ShepherdAI writes 6 unique personalized emails per visitor based on their background, interests, and visit details. The pastor can preview and edit each email before it is sent automatically."
                  }
                }
              ]
            })
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "ShepherdAI",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "description": "Church management platform that helps pastors save 15+ hours per week by automating admin tasks. AI visitor follow-up, sermon-to-social media, prayer management, devotionals, newsletters, and AI reports.",
              "url": "https://www.shepherdaitech.com",
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Free",
                  "price": "0",
                  "priceCurrency": "USD",
                  "description": "20 AI generations/month, 7 core features, 5 congregant seats"
                },
                {
                  "@type": "Offer",
                  "name": "Starter",
                  "price": "19",
                  "priceCurrency": "USD",
                  "billingIncrement": "P1M",
                  "description": "100 generations/month, everything in Free plus sermon-to-social, devotionals, newsletters, worship planner"
                },
                {
                  "@type": "Offer",
                  "name": "Pro",
                  "price": "39",
                  "priceCurrency": "USD",
                  "billingIncrement": "P1M",
                  "description": "300 generations/month, everything in Starter plus batch content, AI style learning, unlimited congregant seats"
                },
                {
                  "@type": "Offer",
                  "name": "Growth",
                  "price": "79",
                  "priceCurrency": "USD",
                  "billingIncrement": "P1M",
                  "description": "Unlimited AI generations, full auto AI ministry, founding church program, white-label page, dedicated account manager"
                }
              ],
              "featureList": [
                "AI Visitor Follow-up (6 unique emails per visitor)",
                "Sermon to Social Media",
                "Prayer Management with Bible verses",
                "Daily Devotional with email delivery",
                "Weekly Newsletter generator",
                "Church Announcements generator",
                "Batch Content Studio (1 sermon → 50 posts)",
                "AI Habit Learning",
                "AI Member Pastoral Plan",
                "Ministry Health Report",
                "Sunday Worship Planner",
                "Monthly Church Newsletter",
                "Template Marketplace",
                "Church Community Page",
                "Community Knowledge Base"
              ],
              "screenshot": "https://www.shepherdaitech.com/icon-192.png",

            })
          }}
        />
      </head>
      <body className="antialiased">
        <SocialProofBanner />
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "x22pkatf8o");`}
        </Script>
        <AnalyticsTracker>
          <GlobalErrorBoundary>
              <ConditionalShell>{children}</ConditionalShell>
          </GlobalErrorBoundary>
        </AnalyticsTracker>
        <Analytics />
      </body>
    </html>
  );
}
