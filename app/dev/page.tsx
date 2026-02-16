"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type ProfileRow = {
  user_id: string;
  is_pro: boolean;
  referral_code?: string;
};

function parseAdminEmails(raw: string | undefined | null) {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export default function DevAdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);

  const [email, setEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isPro, setIsPro] = useState<boolean>(false);
  const [referralCode, setReferralCode] = useState<string>("");

  const [status, setStatus] = useState<string>("");

  const isDev = process.env.NODE_ENV === "development";

  const adminEmails = useMemo(
    () => parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS),
    []
  );

  const isAdmin = useMemo(() => {
    if (!email) return false;
    return adminEmails.includes(email.toLowerCase());
  }, [adminEmails, email]);

  const load = async () => {
    setStatus("");

    // Require login
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      setStatus("❌ Session error: " + sessionError.message);
      setLoading(false);
      setChecking(false);
      return;
    }

    const session = sessionData.session;
    if (!session) {
      router.replace("/login");
      return;
    }

    const e = session.user.email ?? "";
    setEmail(e);
    setUserId(session.user.id);

    // Load profile
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, is_pro, referral_code")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error) {
      setStatus("❌ Could not load profile: " + error.message);
    } else {
      const row = data as ProfileRow | null;
      setIsPro(!!row?.is_pro);
      setReferralCode(row?.referral_code ?? "");
    }

    setLoading(false);
    setChecking(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setProFlag = async (next: boolean) => {
    setStatus("");
    setChecking(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) {
      router.replace("/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_pro: next })
      .eq("user_id", session.user.id);

    if (error) {
      setStatus("❌ Update failed: " + error.message);
      setChecking(false);
      return;
    }

    setIsPro(next);
    setStatus(next ? "✅ Pro enabled (dev)." : "✅ Pro disabled (dev).");
    setChecking(false);
  };

  // Hard gates
  if (!isDev) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold">Not available</div>
        <div className="mt-2 text-sm text-zinc-700">
          The Dev Admin page is only available in development mode.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm text-zinc-600">Loading dev tools…</div>
      </div>
    );
  }

  if (!process.env.NEXT_PUBLIC_ADMIN_EMAILS) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm space-y-3">
        <div className="text-lg font-semibold">Admin not configured</div>
        <div className="text-sm text-zinc-700">
          Add <span className="font-mono">NEXT_PUBLIC_ADMIN_EMAILS</span> to{" "}
          <span className="font-mono">.env.local</span> and restart the dev server.
        </div>
        <pre className="rounded-xl border bg-zinc-50 p-3 text-xs text-zinc-800 overflow-x-auto">
{`NEXT_PUBLIC_ADMIN_EMAILS=you@example.com`}
        </pre>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm space-y-2">
        <div className="text-lg font-semibold">Access denied</div>
        <div className="text-sm text-zinc-700">
          This page is restricted to admin accounts.
        </div>
        <div className="text-xs text-zinc-500">
          Signed in as: <span className="font-mono">{email || "unknown"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dev Admin</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Development-only tools. Restricted by admin email list.
        </p>
      </div>

      <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <div className="grid gap-2 text-sm">
          <div>
            <span className="text-zinc-500">Email: </span>
            <span className="font-mono">{email}</span>
          </div>
          <div>
            <span className="text-zinc-500">User ID: </span>
            <span className="font-mono">{userId}</span>
          </div>
          <div>
            <span className="text-zinc-500">Referral code: </span>
            <span className="font-mono">{referralCode || "—"}</span>
          </div>
          <div>
            <span className="text-zinc-500">Plan: </span>
            {isPro ? (
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Pro
              </span>
            ) : (
              <span className="inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-900">
                Free
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setProFlag(true)}
            disabled={checking || isPro}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            Enable Pro
          </button>

          <button
            onClick={() => setProFlag(false)}
            disabled={checking || !isPro}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-50"
          >
            Disable Pro
          </button>

          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Reload
          </button>
        </div>

        {status ? (
          <div
            className={`rounded-lg border px-3 py-2 text-sm ${
              status.startsWith("❌")
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {status}
          </div>
        ) : null}

        <div className="text-xs text-zinc-500">
          Tip: After toggling Pro, refresh <span className="font-mono">/dashboard</span>,{" "}
          <span className="font-mono">/statement</span>, and <span className="font-mono">/vault</span>.
        </div>
      </section>
    </div>
  );
}
