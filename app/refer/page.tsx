"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ReferPage() {
  const router = useRouter();
  const [code, setCode] = useState<string>("");
  const [status, setStatus] = useState("");

  const link = useMemo(() => {
    if (!code) return "";
    // window only exists on client; this page is client
    return `${window.location.origin}/login?ref=${encodeURIComponent(code)}`;
  }, [code]);

  useEffect(() => {
    const load = async () => {
      setStatus("");

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setStatus("❌ Session error: " + sessionError.message);
        return;
      }

      const session = sessionData.session;
      if (!session) {
        router.replace("/login");
        return;
      }

      // Try to read your profile row
      const { data, error } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        setStatus("❌ Could not load referral code: " + error.message);
        return;
      }

      if (data?.referral_code) {
        setCode(data.referral_code);
        return;
      }

      // If no row exists (older account), create it client-side:
      // (RLS allows update/select; insert isn’t enabled for clients, so we show a helpful message.)
      setStatus(
        "⚠️ Referral code missing for this account. Run the one-time ‘backfill profiles’ SQL in Supabase, then refresh this page."
      );
    };

    load();
  }, [router]);

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setStatus("✅ Copied referral link.");
    } catch {
      setStatus("❌ Could not copy. You can select the link and copy manually.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Refer a friend</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Share your referral link. When your friend signs up using it, we’ll record the referral.
      </p>

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <div className="text-sm text-zinc-700">
          <div className="text-xs font-medium text-zinc-700">Your referral code</div>
          <div className="mt-1 rounded-lg border bg-zinc-50 px-3 py-2 font-semibold tracking-wider">
            {code || "—"}
          </div>
        </div>

        <div className="text-sm text-zinc-700">
          <div className="text-xs font-medium text-zinc-700">Your referral link</div>
          <input
            readOnly
            value={link || ""}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={copy}
            disabled={!link}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            Copy link
          </button>

          {status ? (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                status.startsWith("❌")
                  ? "border-red-200 bg-red-50 text-red-700"
                  : status.startsWith("⚠️")
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {status}
            </div>
          ) : null}
        </div>

        <div className="text-xs text-zinc-500">
          Tip: Share by text or email. The referral is “claimed” after your friend creates an account and logs in.
        </div>
      </div>
    </div>
  );
}
