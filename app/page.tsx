"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
      } else {
        setChecking(false);
      }
    };
    check();
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-zinc-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="grid gap-12">
      {/* Hero Section */}
      <section className="text-center">
        {/* Veteran Badge */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 bg-blue-50 px-6 py-3">
            <span className="text-3xl">🇺🇸</span>
            <span className="text-base font-bold text-blue-900">
              Veteran Owned & Operated
            </span>
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Organize Your VA Claim Evidence
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
          ClaimCompass helps veterans track symptoms, store documents, and generate professional
          statements for VA disability claims. Built by veterans, for veterans.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          
            href="/login"
            className="rounded-lg bg-zinc-900 px-6 py-3 text-base font-semibold text-white hover:bg-zinc-800"
          >
            Get Started Free
          </a>
          
            href="/pricing"
            className="rounded-lg border-2 border-zinc-200 bg-white px-6 py-3 text-base font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            View Pricing
          </a>
        </div>

        <div className="mt-4 text-sm text-zinc-500">
          Free to start • No credit card required
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{borderTop: '3px solid #B22234'}}>
          <div className="text-3xl">📝</div>
          <h3 className="mt-3 text-lg font-semibold">Daily Symptom Tracking</h3>
          <p className="mt-2 text-sm text-zinc-600">
            Log symptoms and mood daily to build consistent evidence for your claim.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{borderTop: '3px solid #3C3B6E'}}>
          <div className="text-3xl">📄</div>
          <h3 className="mt-3 text-lg font-semibold">Statement Generation</h3>
          <p className="mt-2 text-sm text-zinc-600">
            Automatically generate professional statements from your logs as PDF or Word documents.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{borderTop: '3px solid #B22234'}}>
          <div className="text-3xl">🗂️</div>
          <h3 className="mt-3 text-lg font-semibold">Evidence Vault</h3>
          <p className="mt-2 text-sm text-zinc-600">
            Securely store medical records, doctor's notes, and supporting documents.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{borderTop: '3px solid #3C3B6E'}}>
          <div className="text-3xl">🎖️</div>
          <h3 className="mt-3 text-lg font-semibold">Achievement Badges</h3>
          <p className="mt-2 text-sm text-zinc-600">
            Stay motivated with badges for consistent logging and milestone achievements.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{borderTop: '3px solid #B22234'}}>
          <div className="text-3xl">🔔</div>
          <h3 className="mt-3 text-lg font-semibold">Smart Reminders</h3>
          <p className="mt-2 text-sm text-zinc-600">
            Email and SMS reminders to help you log consistently and build stronger evidence.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{borderTop: '3px solid #3C3B6E'}}>
          <div className="text-3xl">🛡️</div>
          <h3 className="mt-3 text-lg font-semibold">Secure & Private</h3>
          <p className="mt-2 text-sm text-zinc-600">
            Your sensitive medical data is encrypted and protected. HIPAA-compliant infrastructure.
          </p>
        </div>
      </section>

      {/* Why Veterans Trust Us */}
      <section className="rounded-2xl border-2 border-blue-600 bg-blue-50 p-8">
        <div className="text-center">
          <div className="text-4xl">🇺🇸</div>
          <h2 className="mt-4 text-2xl font-bold text-blue-900">
            Built by Veterans, For Veterans
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-blue-800">
            We understand the VA claims process because we've been through it ourselves. 
            ClaimCompass was created to help fellow veterans organize their evidence and 
            increase their chances of approval.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-8 text-sm font-semibold text-blue-900">
            <div>✓ No Affiliate Marketing</div>
            <div>✓ No Hidden Fees</div>
            <div>✓ Veteran Support</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-2xl bg-zinc-900 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to Strengthen Your VA Claim?</h2>
        <p className="mt-3 text-zinc-300">
          Join hundreds of veterans using ClaimCompass to organize their evidence.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          
            href="/login"
            className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-zinc-900 hover:bg-zinc-100"
          >
            Start Free Today
          </a>
          
            href="/pricing"
            className="rounded-lg border-2 border-white px-6 py-3 text-base font-semibold text-white hover:bg-white/10"
          >
            View Plans
          </a>
        </div>
      </section>
    </div>
  );
}