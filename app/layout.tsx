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
  title: "CLAIMCOMPASS // TACTICAL VA EVIDENCE LOCKER",
  description: "COMMAND CENTER for VA claims. Field Log, Evidence Vault, Statement Builder. Built by vets, for vets. SECURE. PRIVATE. TACTICAL.",
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
        <meta name="theme-color" content="#0F0F0F" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0F0F0F] text-[#E8E8E8]`}>
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>

        <footer className="mt-16 border-t border-[#2A2A2A] bg-[#1A1A1A] py-8">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-6 flex justify-center">
              <div className="inline-flex items-center gap-3 border border-[#4B5320] bg-[#0F0F0F] px-6 py-3">
                <span className="h-2 w-2 bg-[#4B5320]"></span>
                <span className="text-xs font-black tracking-[0.2em] text-[#E8E8E8] uppercase">
                  Veteran Owned & Operated // EST 2026
                </span>
                <span className="h-2 w-2 bg-[#4B5320]"></span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-xs font-bold tracking-widest text-[#A0A0A0] uppercase">
              <a href="/about" className="hover:text-[#E8E8E8]">About</a>
              <a href="/pricing" className="hover:text-[#E8E8E8]">Pricing</a>
              <a href="/privacy" className="hover:text-[#E8E8E8]">Privacy</a>
              <a href="/terms" className="hover:text-[#E8E8E8]">Terms</a>
              <a href="/feedback" className="hover:text-[#E8E8E8]">Feedback</a>
            </div>

            <div className="mt-6 text-center text- tracking-[0.2em] text-[#6B7280] uppercase">
              © 2026 CLAIMCOMPASS // SECURE LOCKER SYSTEM
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}