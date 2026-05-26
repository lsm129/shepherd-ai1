import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShepherdAI - AI-Powered Church Management",
  description: "Your AI assistant for church visitor follow-up and weekly newsletters. Save time, grow your community.",
  keywords: "church management, AI pastor assistant, church newsletter, visitor follow-up",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
