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
      if (!data.session) {
        setLoading(false);
        return;
      }

      const pro = await getProStatus();
      setIsPro(pro.isPro);
      setLoading(false);
    };

    load();
  }, []);

  const handleUpgrade = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      router.push("/login");
      return;
    }

    const priceId = billingCycle === "monthly" 
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID 
      : process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID;

    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  const monthlyPrice = 12;
  const annualPrice = 100;
  const monthlySavings = (monthlyPrice * 12 - annualPrice).toFixed(0);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="mt-4 text-lg text-zinc-600">
          Start free, upgrade when you need advanced features
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-lg border-2 border-zinc-200 bg-zinc-100 p-1">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-md px-6 py-2 text-sm font-semibold transition-all ${
              billingCycle === "monthly"
                ? "bg-white text-zinc-900 shadow"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`rounded-md px-6 py-2 text-sm font-semibold transition-all ${
              billingCycle === "annual"
                ? "bg-white text-zinc-900 shadow"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Annual
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
              Save ${monthlySavings}
            </span>
          </button>
        </div>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border-2 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">Free</h2>
          <div className="mt-4">
            <div className="text-4xl font-bold">$0</div>
            <div className="text-sm text-zinc-600">Forever</div>
          </div>

          <ul className="mt-8 space-y-4">
            <li className="flex items-start gap-3">
              <div className="text-emerald-600">✓</div>
              <div className="text-sm">Daily symptom & mood tracking</div>
            </li>
            <li className="flex items-start gap-3">
              <div className="text-emerald-600">✓</div>
              <div className="text-sm">Basic document storage</div>
            </li>
            <li className="flex items-start gap-3">
              <div className="text-emerald-600">✓</div>
              <div className="text-sm">Achievement badges</div>
            </li>
            <li className="flex items-start gap-3">
              <div className="text-emerald-600">✓</div>
              <div className="text-sm">Email reminders</div>
            </li>
            <li className="flex items-start gap-3">
              <div className="text-emerald-600">✓</div>
              <div className="text-sm">Referral system</div>
            </li>
          </ul>

          <button
            onClick={() => router.push("/login")}
            className="mt-8 w-full rounded-lg border-2 border-zinc-200 bg-white px-6 py-3 text-base font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Get Started Free
          </button>
        </div>

        <div className="relative rounded-2xl border-2 border-emerald-500 bg-white p-8 shadow-lg">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-sm font-bold text-white">
            Most Popular
          </div>

          <h2 className="text-2xl font-bold">Pro</h2>
          <div className="mt-4">
            {billingCycle === "monthly" ? (
              <>
                <div className="text-4xl font-bold">${monthlyPrice}</div>
                <div className="text-sm text-zinc-600">per month</div>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-bold">${annualPrice}</div>
                  <div className="text-lg text-zinc-500 line-through">${monthlyPrice * 12}</div>
                </div>
                <div className="text-sm text-zinc-600">
                  per year (${(annualPrice / 12).toFixed(2)}/month)
                </div>
                <div className="mt-1 text-sm font-semibold text-emerald-600">
                  Save ${monthlySavings} annually!
                </div>
              </>
            )}
          </div>

          <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
            <strong>Everything in Free, plus:</strong>
          </div>

          <ul className="mt-6 space-y-4">
            <li className="flex items-start gap-3">
              <div className="text-emerald-600">✓</div>
              <div className="text-sm">
                <strong>PDF & Word Exports</strong> - Generate professional statements
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="text-emerald-600">✓</div>
              <div className="text-sm">
                <strong>Unlimited Storage</strong> - Store all your medical records
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="text-emerald-600">✓</div>
              <div className="text-sm">
                <strong>SMS Reminders</strong> - Text message notifications
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="text-emerald-600">✓</div>
              <div className="text-sm">
                <strong>Priority Support</strong> - Get help when you need it
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="text-emerald-600">✓</div>
              <div className="text-sm">
                <strong>Post-Approval Tracking</strong> - Monitor new conditions
              </div>
            </li>
          </ul>

          {loading ? (
            <button
              disabled
              className="mt-8 w-full rounded-lg bg-zinc-400 px-6 py-3 text-base font-semibold text-white"
            >
              Loading...
            </button>
          ) : isPro ? (
            <button
              disabled
              className="mt-8 w-full rounded-lg bg-emerald-100 px-6 py-3 text-base font-semibold text-emerald-700"
            >
              Current Plan
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              className="mt-8 w-full rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-700"
            >
              Upgrade to Pro
            </button>
          )}

          <div className="mt-4 text-center text-xs text-zinc-500">
            Cancel anytime. No questions asked.
          </div>
        </div>
      </div>

      <div className="mt-16 rounded-2xl border-2 border-blue-600 bg-blue-50 p-8">
        <div className="text-center">
          <div className="text-4xl">🇺🇸</div>
          <h2 className="mt-4 text-2xl font-bold text-blue-900">
            Built by a Veteran, For Veterans
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-blue-800">
            As a 12-year Army veteran with 100% P&T, I built ClaimCompass to help fellow veterans 
            organize their evidence and strengthen their VA claims. No affiliate marketing, no data 
            selling - just a tool to help you get the benefits you have earned.
          </p>
        </div>
      </div>
    </div>
  );
}