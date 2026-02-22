import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import { Analytics } from '@vercel/analytics/react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClaimCompass - VA Claim Evidence Organizer",
  description: "Track symptoms, store evidence, and generate statements for your VA disability claim. Built by veterans, for veterans.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Nav />
        <main className="mx-auto max-w-5xl px-4 py-8">
          {children}
        </main>

        <footer className="mt-16 border-t bg-zinc-50 py-8">
          <div className="mx-auto max-w-5xl px-4">
            <div className="mb-6 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 bg-blue-50 px-6 py-3">
                <span className="text-2xl">🇺🇸</span>
                <span className="text-sm font-bold text-blue-900">
                  Veteran Owned & Operated
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-600">
              <a href="/about" className="hover:text-zinc-900">About</a>
              <a href="/pricing" className="hover:text-zinc-900">Pricing</a>
              <a href="/privacy" className="hover:text-zinc-900">Privacy</a>
              <a href="/terms" className="hover:text-zinc-900">Terms</a>
              <a href="/feedback" className="hover:text-zinc-900">Feedback</a>
            </div>

            <div className="mt-6 text-center text-xs text-zinc-500">
              © 2026 ClaimCompass. All rights reserved.
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}