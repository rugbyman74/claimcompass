"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProStatus } from "@/lib/pro";

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [logCount, setLogCount] = useState<number>(0);

  const [isPro, setIsPro] = useState(false);
  const [proLoaded, setProLoaded] = useState(false);

  const planLabel = useMemo(() => (isPro ? "Pro" : "Free"), [isPro]);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (sessionError) {
        router.replace("/login");
        return;
      }

      if (!session) {
        router.replace("/login");
        return;
      }

      const meta = (session.user.user_metadata ?? {}) as Record<string, any>;
      const autoName =
        (typeof meta.full_name === "string" && meta.full_name.trim()) ||
        (typeof meta.name === "string" && meta.name.trim()) ||
        null;

      setFullName(autoName);
      setEmail(session.user.email ?? null);

      // Pro status
      const res = await getProStatus();
      setIsPro(res.isPro);
      setProLoaded(true);

      // Count logs
      const { count } = await supabase
        .from("symptom_logs")
        .select("*", { count: "exact", head: true });

      setLogCount(count ?? 0);

      setLoading(false);
    };

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-sm text-zinc-600">Loading dashboard…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl grid gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome{fullName ? `, ${fullName}` : ""}.
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            {email ? `Signed in as ${email}` : "Your claim dashboard."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {proLoaded ? (
            isPro ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                Plan: Pro
              </span>
            ) : (
              <>
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-semibold text-zinc-900">
                  Plan: Free
                </span>
                <Link
                  href="/pricing"
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  Upgrade to Pro
                </Link>
              </>
            )
          ) : (
            <span className="text-sm text-zinc-500">Checking plan…</span>
          )}
        </div>
      </div>

      {/* Optional banner for free users */}
      {!isPro ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-amber-900">
                Unlock ClaimCompass Pro
              </div>
              <div className="mt-1 text-sm text-amber-900/90">
                Pro includes PDF export for statements and uploads to the Evidence Vault.
              </div>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              View pricing
            </Link>
          </div>
        </div>
      ) : null}

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-zinc-500">Total symptom logs</div>
          <div className="mt-2 text-3xl font-semibold">{logCount}</div>
          <div className="mt-2 text-xs text-zinc-500">
            Consistency builds stronger evidence.
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-zinc-500">Evidence Vault uploads</div>
          <div className="mt-2 text-3xl font-semibold">{isPro ? "Enabled" : "Pro"}</div>
          <div className="mt-2 text-xs text-zinc-500">
            {isPro
              ? "Upload and store supporting evidence."
              : "Uploads require Pro. You can still view your existing files."}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-zinc-500">Statement PDF export</div>
          <div className="mt-2 text-3xl font-semibold">{isPro ? "Enabled" : "Pro"}</div>
          <div className="mt-2 text-xs text-zinc-500">
            {isPro
              ? "Download a formatted PDF statement."
              : "Copy text is free. PDF export requires Pro."}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-6 md:grid-cols-4">
        <Link
          href="/log"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:border-zinc-400 transition"
        >
          <div className="text-lg font-semibold">Symptom Log</div>
          <div className="mt-2 text-sm text-zinc-600">
            Add, edit, and delete daily entries.
          </div>
        </Link>

        <Link
          href="/statement"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:border-zinc-400 transition"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-lg font-semibold">Statement</div>
            {!isPro ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                PDF = Pro
              </span>
            ) : null}
          </div>
          <div className="mt-2 text-sm text-zinc-600">
            Build a structured statement from your logs.
          </div>
        </Link>

        <Link
          href="/vault"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:border-zinc-400 transition"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-lg font-semibold">Evidence Vault</div>
            {!isPro ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                Upload = Pro
              </span>
            ) : null}
          </div>
          <div className="mt-2 text-sm text-zinc-600">
            Store PDFs/images securely and download anytime.
          </div>
        </Link>

        <Link
          href="/refer"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:border-zinc-400 transition"
        >
          <div className="text-lg font-semibold">Refer</div>
          <div className="mt-2 text-sm text-zinc-600">
            Share your referral link with friends.
          </div>
        </Link>
      </div>

      {/* Bottom helper */}
      <div className="rounded-2xl border bg-white p-6 text-sm text-zinc-700 shadow-sm">
        <div className="font-semibold">Next best action</div>
        <div className="mt-2">
          {logCount === 0
            ? "Start by adding your first symptom entry in the Symptom Log."
            : "Keep logging daily. Then generate a statement and export it when you’re ready."}
        </div>
      </div>
    </div>
  );
}
