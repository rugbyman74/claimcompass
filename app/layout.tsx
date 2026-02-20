import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Link from "next/link";
import ReferralClaimer from "./components/ReferralClaimer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClaimCompass",
  description: "A secure VA claim organizer for symptom logs, statements, and evidence storage.",
  manifest: "/manifest.json",
  themeColor: "#3C3B6E",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ClaimCompass",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 text-zinc-900`}>
        <Nav />
        <ReferralClaimer />
        <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>

        <footer className="border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-6">
            {/* Veteran Badge */}
            <div className="mb-4 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 bg-blue-50 px-4 py-2">
                <span className="text-2xl">🇺🇸</span>
                <span className="text-sm font-bold text-blue-900">
                  Veteran Owned & Operated
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-xs text-zinc-500">
                ClaimCompass is not affiliated with the VA and does not provide legal or medical advice.
              </div>

              <div className="flex flex-wrap gap-3 text-xs">
                <Link className="text-zinc-600 hover:text-zinc-900" href="/faq">FAQ</Link>
                <Link className="text-zinc-600 hover:text-zinc-900" href="/contact">Contact</Link>
                <Link className="text-zinc-600 hover:text-zinc-900" href="/data-deletion">Data Deletion</Link>
                <Link className="text-zinc-600 hover:text-zinc-900" href="/privacy">Privacy</Link>
                <Link className="text-zinc-600 hover:text-zinc-900" href="/terms">Terms</Link>
                <Link className="text-zinc-600 hover:text-zinc-900" href="/security">Security</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}