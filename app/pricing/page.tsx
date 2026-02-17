"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleUpgrade = async () => {
    setStatus("");
    setLoading(true);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        setStatus("❌ Please log in first");
        setLoading(false);
        router.push("/login");
        return;
      }

      const userId = sessionData.session.user.id;
      const email = sessionData.session.user.email;

      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      setStatus(`❌ ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl grid gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">ClaimCompass Pro</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Upgrade to unlock premium features.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-zinc-900">Free</div>
          <div className="mt-2 text-3xl font-semibold">$0</div>
          <ul className="mt-4 space-y-2 text-sm text-zinc-700">
            <li>✅ Symptom logging</li>
            <li>✅ Edit & delete entries</li>
            <li>✅ Statement builder preview</li>
            <li>✅ Referral link</li>
            <li>✅ Badge system</li>
          </ul>
        </div>

        <div className="rounded-2xl border-2 border-blue-500 bg-white p-6 shadow-lg relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
            RECOMMENDED
          </div>
          <div className="text-sm font-semibold text-zinc-900">Pro</div>
          <div className="mt-2 text-3xl font-semibold">
            $12<span className="text-base font-semibold text-zinc-500">/mo</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-zinc-700">
            <li>⭐ PDF export for statements</li>
            <li>⭐ Evidence Vault uploads & storage</li>
            <li>⭐ All Free features</li>
            <li>⭐ Priority support</li>
            <li>⭐ Future: claim package builder</li>
          </ul>

          <div className="mt-6">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Upgrade to Pro"}
            </button>

            {status ? (
              <div
                className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
                  status.startsWith("❌")
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {status}
              </div>
            ) : null}
          </div>

          <div className="mt-4 text-xs text-zinc-500 text-center">
            Secure payment powered by Stripe
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
        <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <div className="font-semibold text-zinc-900">Can I cancel anytime?</div>
            <div className="mt-1 text-zinc-600">Yes, cancel anytime. No questions asked.</div>
          </div>
          <div>
            <div className="font-semibold text-zinc-900">Is my payment secure?</div>
            <div className="mt-1 text-zinc-600">
              Yes, all payments are processed securely through Stripe. We never see your card details.
            </div>
          </div>
          <div>
            <div className="font-semibold text-zinc-900">What happens to my data if I cancel?</div>
            <div className="mt-1 text-zinc-600">
              Your data stays safe. You can still view everything, but uploads and PDF exports require Pro.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}