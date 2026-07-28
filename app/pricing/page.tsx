"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { getProStatus } from "@/lib/pro";

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { setLoading(false); return; }
      const pro = await getProStatus();
      setIsPro(pro.isPro); setLoading(false);
    }; load();
  }, []);

  const handleUpgrade = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) { router.push("/login"); return; }
    const priceId = billingCycle === "monthly"? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID : process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID;
    const res = await fetch("/api/create-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priceId }) });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  const monthlyPrice = 12;
  const annualPrice = 100;
  const monthlySavings = (monthlyPrice * 12 - annualPrice).toFixed(0);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="border-b border-[#2A2A2A] pb-8 text-center">
        <div className="text- font-black tracking-[0.3em] text-[#4B5320] uppercase mb-3">Supply // Requisition Form // V1</div>
        <h1 className="text-4xl font-black tracking-[0.1em] uppercase text-[#E8E8E8]">Requisition Gear</h1>
        <p className="mt-3 text-xs tracking-[0.15em] uppercase text-[#6B7280]">Select Loadout // Start Free, Upgrade When Ready</p>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="inline-flex border border-[#2A2A2A] bg-[#1A1A1A] p-1">
          <button onClick={() => setBillingCycle("monthly")} className={`px-6 py-2 text- font-black tracking-[0.15em] uppercase transition-all ${billingCycle === "monthly"? "bg-[#4B5320] text-white" : "text-[#6B7280] hover:text-[#E8E8E8]"}`}>Monthly</button>
          <button onClick={() => setBillingCycle("annual")} className={`px-6 py-2 text- font-black tracking-[0.15em] uppercase transition-all ${billingCycle === "annual"? "bg-[#4B5320] text-white" : "text-[#6B7280] hover:text-[#E8E8E8]"}`}>Annual <span className="ml-2 border-[#4B5320] bg-[#0F0F0F] px-2 py-0.5 text- text-[#4B5320]">Save ${monthlySavings}</span></button>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="border border-[#2A2A2A] bg-[#1A1A1A] p-8">
          <div className="text- font-black tracking-[0.2em] uppercase text-[#6B7280]">Loadout // Basic</div>
          <h2 className="mt-2 text-xl font-black tracking-[0.1em] uppercase text-[#E8E8E8]">Free</h2>
          <div className="mt-4"><div className="text-4xl font-black text-[#E8E8E8]">$0</div><div className="text- uppercase tracking-[0.15em] text-[#6B7280]">Forever // No Expiry</div></div>
          <ul className="mt-8 space-y-3">
            {["Daily symptom & mood tracking","Basic document storage","Achievement badges","Email reminders","Referral system"].map(t => (
              <li key={t} className="flex gap-3 text- tracking-[0.05em] text-[#A0A0A0]"><span className="text-[#4B5320] font-black">■</span>{t.toUpperCase()}</li>
            ))}
          </ul>
          <button onClick={() => router.push("/login")} className="mt-8 w-full border border-[#2A2A2A] bg-[#0F0F0F] px-6 py-3 text- font-black tracking-[0.15em] uppercase text-[#E8E8E8] hover:border-[#4B5320]">Get Started Free</button>
        </div>

        <div className="relative border border-[#4B5320] bg-[#1A1A1A] p-8">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4B5320] px-4 py-1 text- font-black tracking-[0.15em] uppercase text-white">Most Deployed</div>
          <div className="text- font-black tracking-[0.2em] uppercase text-[#4B5320]">Loadout // Operator</div>
          <h2 className="mt-2 text-xl font-black tracking-[0.1em] uppercase text-[#E8E8E8]">Pro</h2>
          <div className="mt-4">
            {billingCycle === "monthly"? (<><div className="text-4xl font-black text-[#E8E8E8]">${monthlyPrice}</div><div className="text- uppercase tracking-[0.15em] text-[#6B7280]">Per Month</div></>) : (<><div className="flex items-baseline gap-2"><div className="text-4xl font-black text-[#E8E8E8]">${annualPrice}</div><div className="text-lg text-[#6B7280] line-through">${monthlyPrice * 12}</div></div><div className="text- uppercase tracking-[0.15em] text-[#6B7280]">Per Year (${(annualPrice / 12).toFixed(2)}/mo)</div><div className="mt-2 text- font-black uppercase text-[#4B5320]">Save ${monthlySavings} Annually</div></>)}
          </div>
          <div className="mt-6 border border-[#4B5320]/30 bg-[#0F0F0F] p-3 text- font-black tracking-[0.1em] uppercase text-[#4B5320]">Everything in Free, Plus:</div>
          <ul className="mt-6 space-y-3">
            {[
              "PDF & Word Exports - Professional statements",
              "Unlimited Storage - All medical records",
              "SMS Reminders - Text notifications",
              "Priority Support - Get help fast",
              "Post-Approval Tracking - Monitor new conditions"
            ].map(t => (
              <li key={t} className="flex gap-3 text- tracking-[0.05em] text-[#E8E8E8]"><span className="text-[#4B5320] font-black">■</span>{t.toUpperCase()}</li>
            ))}
          </ul>
          {loading? <button disabled className="mt-8 w-full bg-[#2A2A2A] px-6 py-3 text- font-black uppercase text-[#6B7280]">Loading...</button> : isPro? <button disabled className="mt-8 w-full border border-[#4B5320] bg-[#0F0F0F] px-6 py-3 text- font-black uppercase text-[#4B5320]">Current Loadout // Active</button> : <button onClick={handleUpgrade} className="mt-8 w-full bg-[#4B5320] px-6 py-3 text- font-black tracking-[0.15em] uppercase text-white hover:bg-[#5A6330]">Upgrade To Pro // Execute</button>}
          <div className="mt-4 text-center text- uppercase tracking-[0.1em] text-[#6B7280]">Cancel Anytime. No Questions.</div>
        </div>
      </div>

      <div className="mt-16 border border-[#2A2A2A] bg-[#1A1A1A] p-8">
        <div className="text-center">
          <div className="text- font-black tracking-[0.3em] text-[#4B5320] uppercase">Origin // Veteran Built</div>
          <h2 className="mt-3 text-xl font-black tracking-[0.1em] uppercase text-[#E8E8E8]">Built By A Veteran, For Veterans</h2>
          <p className="mx-auto mt-4 max-w-2xl text- leading-6 text-[#A0A0A0]">As a 12-year Army veteran with 100% P&T, I built ClaimCompass to help fellow veterans organize their evidence and strengthen VA claims. No affiliate marketing, no data selling - just a tool to help you get the benefits you earned.</p>
          <div className="mt-4 text- tracking-[0.2em] text-[#6B7280] uppercase">ClaimCompass // Tactical Evidence Locker // V1 // Alabama</div>
        </div>
      </div>
    </div>
  );
}