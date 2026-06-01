import type { Metadata, Viewport } from "next";
import "./globals.css";
import ConditionalShell from "@/components/ConditionalShell";

export const metadata: Metadata = {
  title: "ShepherdAI - AI-Powered Church Management Platform",
  description: "Your AI ministry platform for pastors and congregations. Sermon tools, visitor follow-up, prayer management, daily devotionals, and more. Starting at $19/mo.",
  keywords: "church management, AI pastor assistant, church newsletter, visitor follow-up, sermon generator, prayer management, church AI",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" translate="no">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased notranslate">
        <ConditionalShell>{children}</ConditionalShell>
      </body>
    </html>
  );
}
