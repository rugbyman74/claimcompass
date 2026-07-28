"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      <div className="flex min-h- items-center justify-center">
        <div className="text- font-black tracking-[0.2em] uppercase text-[#6B7280] border border-[#2A2A2A] px-6 py-3 bg-[#1A1A1A]">
          SYSTEM CHECK // LOADING LOCKER...
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {/* HERO - Tactical Locker */}
      <section className="border border-[#2A2A2A] bg-[#1A1A1A] p-8 md:p-12">
        <div className="inline-flex items-center gap-2 border border-[#4B5320] bg-[#0F0F0F] px-3 py-1 mb-6">
          <span className="h-1.5 w-1.5 bg-[#4B5320] animate-pulse"></span>
          <span className="text- font-black tracking-[0.2em] text-[#4B5320] uppercase">System Online // Secure Locker V1</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-[0.05em] uppercase leading-[0.9] text-[#E8E8E8]">
          Organize Your<br />
          <span className="text-[#4B5320]">VA Claim</span><br />
          Evidence
        </h1>

        <p className="mt-6 max-w-2xl text-sm leading-6 text-[#A0A0A0] border-l-2 border-[#2A2A2A] pl-4">
          ClaimCompass is a Tactical Evidence Locker. Field Log, Evidence Vault, Statement Builder.
          Built by veterans, for veterans. No fluff. Just the system.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/login" className="bg-[#4B5320] border border-[#4B5320] px-8 py-4 text- font-black tracking-[0.2em] uppercase text-white hover:bg-[#5A6330]">
            Get Started Free
          </Link>
          <Link href="/pricing" className="bg-[#0F0F0F] border border-[#2A2A2A] px-8 py-4 text- font-black tracking-[0.2em] uppercase text-[#A0A0A0] hover:border-[#E8E8E8] hover:text-[#E8E8E8]">
            View Pricing
          </Link>
        </div>
        <div className="mt-4 text- tracking-[0.15em] uppercase text-[#6B7280]">
          Free to start - No credit card required // Encrypted at rest
        </div>
      </section>

      {/* 6 LOCKER BAYS - No emojis */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { id: "01", label: "Daily Symptom Tracking", desc: "Log symptoms and mood daily to build consistent evidence.", spec: "LOG // DAILY" },
          { id: "02", label: "Statement Generation", desc: "Generate professional statements as PDF or Word documents.", spec: "OUTPUT // PDF" },
          { id: "03", label: "Evidence Vault", desc: "Securely store medical records and documents.", spec: "VAULT // ENCRYPTED" },
          { id: "04", label: "Achievement Badges", desc: "Stay motivated with badges for consistent logging.", spec: "SYSTEM // STREAKS" },
          { id: "05", label: "Smart Reminders", desc: "Email and SMS reminders to help you log consistently.", spec: "REMINDER // SMS" },
          { id: "06", label: "Secure and Private", desc: "Your medical data is encrypted and protected.", spec: "SECURE // ZERO" },
        ].map((card) => (
          <div key={card.id} className="group border border-[#2A2A2A] bg-[#1A1A1A] p-6 hover:border-[#4B5320] transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="text- font-black tracking-[0.2em] text-[#4B5320]">{card.id} // BAY</div>
              <div className="text- tracking-[0.15em] text-[#6B7280] border border-[#2A2A2A] px-2 py-1">{card.spec}</div>
            </div>
            <div className="text- font-black tracking-[0.15em] uppercase text-[#E8E8E8] mb-2">{card.label}</div>
            <div className="text- leading-5 text-[#A0A0A0]">{card.desc}</div>
            <div className="mt-4 h- w-full bg-[#2A2A2A] group-hover:bg-[#4B5320] transition-colors"></div>
          </div>
        ))}
      </section>

      {/* Built by Vets - Tactical */}
      <section className="border border-[#4B5320] bg-[#0F0F0F] p-8 text-center">
        <div className="inline-flex items-center gap-3 border border-[#4B5320] bg-[#1A1A1A] px-6 py-2 mb-4">
          <span className="h-2 w-2 bg-[#4B5320]"></span>
          <span className="text- font-black tracking-[0.2em] uppercase text-[#E8E8E8]">Veteran Owned & Operated</span>
          <span className="h-2 w-2 bg-[#4B5320]"></span>
        </div>
        <h2 className="text-xl font-black tracking-[0.15em] uppercase text-[#E8E8E8]">Built by Veterans, For Veterans</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[#A0A0A0]">
          We understand the VA claims process because we have been through it. ClaimCompass helps veterans organize evidence and increase approval chances.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-6 text- font-black tracking-[0.15em] uppercase text-[#4B5320]">
          <div className="border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1">No Affiliate Marketing</div>
          <div className="border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1">No Hidden Fees</div>
          <div className="border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1">Veteran Support</div>
        </div>
      </section>

      {/* CTA */}
      <section className="border border-[#2A2A2A] bg-[#1A1A1A] p-8 text-center">
        <h2 className="text-xl font-black tracking-[0.15em] uppercase text-[#E8E8E8]">Ready to Strengthen Your Claim?</h2>
        <p className="mt-2 text-sm text-[#6B7280]">Join hundreds of veterans using ClaimCompass.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className="bg-[#E8E8E8] px-8 py-3 text- font-black tracking-[0.15em] uppercase text-[#0F0F0F] hover:bg-white">
            Start Free Today
          </Link>
          <Link href="/pricing" className="border border-[#2A2A2A] bg-[#0F0F0F] px-8 py-3 text- font-black tracking-[0.15em] uppercase text-[#A0A0A0] hover:text-[#E8E8E8]">
            View Plans
          </Link>
        </div>
      </section>
    </div>
  );
}