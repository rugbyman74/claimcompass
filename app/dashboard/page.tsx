"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProStatus } from "@/lib/pro";

type SymptomLog = {
  id: string;
  condition: string;
  severity: number;
  affected_work: boolean;
  notes: string | null;
  logged_at: string;
  created_at: string;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateShort(iso: string) {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const [fullName, setFullName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [isPro, setIsPro] = useState(false);
  const [proLoaded, setProLoaded] = useState(false);

  const [logCount, setLogCount] = useState(0);
  const [vaultCount, setVaultCount] = useState<number | null>(null);
  const [refCount, setRefCount] = useState<number | null>(null);

  const [recentLogs, setRecentLogs] = useState<SymptomLog[]>([]);
  const [loggedToday, setLoggedToday] = useState<boolean>(false);

  const planLabel = useMemo(() => (isPro ? "Pro" : "Free"), [isPro]);

  const load = async () => {
    setStatus("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (sessionError || !session) {
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
    const pro = await getProStatus();
    setIsPro(pro.isPro);
    setProLoaded(true);

    // Log count
    const { count: logsTotal } = await supabase
      .from("symptom_logs")
      .select("*", { count: "exact", head: true });

    setLogCount(logsTotal ?? 0);

    // Recent logs
    const { data: recent, error: recentErr } = await supabase
      .from("symptom_logs")
      .select("id, condition, severity, affected_work, notes, logged_at, created_at")
      .order("logged_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);

    if (!recentErr) setRecentLogs((recent ?? []) as SymptomLog[]);

    // Logged today?
    const t = todayISO();
    const { data: todayRow } = await supabase
      .from("symptom_logs")
      .select("id")
      .eq("logged_at", t)
      .limit(1)
      .maybeSingle();

    setLoggedToday(!!todayRow?.id);

    // Evidence vault count
    const { count: vaultTotal, error: vaultErr } = await supabase
      .from("evidence_files")
      .select("*", { count: "exact", head: true });

    if (vaultErr) setVaultCount(null);
    else setVaultCount(vaultTotal ?? 0);

    // Referrals count
    const { count: refTotal, error: refErr } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true });

    if (refErr) setRefCount(null);
    else setRefCount(refTotal ?? 0);

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border bg-white p-8 shadow-sm" style={{borderTop: '3px solid #B22234'}}>
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
                Plan: {planLabel}
              </span>
            ) : (
              <>
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-semibold text-zinc-900">
                  Plan: {planLabel}
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

      {/* Today card */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{borderTop: '3px solid #3C3B6E'}}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-zinc-900">Today</div>
            <div className="mt-1 text-sm text-zinc-600">
              {loggedToday ? "You've logged symptoms today." : "No entry logged for today yet."}
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/log"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              {loggedToday ? "View / Edit logs" : "Add today's log"}
            </Link>

            <button
              onClick={load}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Optional Pro banner */}
      {!isPro ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-amber-900">Unlock ClaimCompass Pro</div>
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
        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{borderTop: '3px solid #B22234'}}>
          <div className="text-sm text-zinc-500">Symptom logs</div>
          <div className="mt-2 text-3xl font-semibold">{logCount}</div>
          <div className="mt-2 text-xs text-zinc-500">Consistency builds stronger evidence.</div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{borderTop: '3px solid #FFFFFF', borderTopWidth: '3px', borderTopStyle: 'solid', borderTopColor: '#ddd'}}>
          <div className="text-sm text-zinc-500">Evidence files</div>
          <div className="mt-2 text-3xl font-semibold">
            {vaultCount === null ? "—" : vaultCount}
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            {isPro ? "Uploads enabled." : "Uploads are Pro. Viewing remains free."}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{borderTop: '3px solid #3C3B6E'}}>
          <div className="text-sm text-zinc-500">Referrals</div>
          <div className="mt-2 text-3xl font-semibold">{refCount === null ? "—" : refCount}</div>
          <div className="mt-2 text-xs text-zinc-500">Rewards activate at launch.</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-6 md:grid-cols-4">
        <Link
          href="/log"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:border-zinc-400 transition"
          style={{borderLeft: '4px solid #B22234'}}
        >
          <div className="text-lg font-semibold">Symptom Log</div>
          <div className="mt-2 text-sm text-zinc-600">Add, edit, and delete entries.</div>
        </Link>

        <Link
          href="/statement"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:border-zinc-400 transition"
          style={{borderLeft: '4px solid #3C3B6E'}}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-lg font-semibold">Statement</div>
            {!isPro ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                PDF = Pro
              </span>
            ) : null}
          </div>
          <div className="mt-2 text-sm text-zinc-600">Generate a statement from your logs.</div>
        </Link>

        <Link
          href="/vault"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:border-zinc-400 transition"
          style={{borderLeft: '4px solid #B22234'}}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-lg font-semibold">Evidence Vault</div>
            {!isPro ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                Upload = Pro
              </span>
            ) : null}
          </div>
          <div className="mt-2 text-sm text-zinc-600">Store PDFs/images securely.</div>
        </Link>

        <Link
          href="/refer"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:border-zinc-400 transition"
          style={{borderLeft: '4px solid #3C3B6E'}}
        >
          <div className="text-lg font-semibold">Refer</div>
          <div className="mt-2 text-sm text-zinc-600">Share your referral link.</div>
        </Link>
      </div>

      {/* Recent activity */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm" style={{borderTop: '3px solid #B22234'}}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Recent activity</h2>
            <p className="mt-1 text-sm text-zinc-600">Your last 5 symptom entries.</p>
          </div>
          <Link
            href="/log"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            View all
          </Link>
        </div>

        <div className="mt-4 grid gap-3">
          {recentLogs.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-zinc-600">
              No recent logs yet. Add your first entry in <span className="font-semibold">Symptom Log</span>.
            </div>
          ) : (
            recentLogs.map((l) => (
              <div key={l.id} className="rounded-xl border border-zinc-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{l.condition}</div>
                    <div className="mt-1 text-sm text-zinc-600">
                      {formatDateShort(l.logged_at)} • Severity {l.severity}/10 • Affected work:{" "}
                      {l.affected_work ? "Yes" : "No"}
                    </div>
                    {l.notes ? (
                      <div className="mt-2 text-sm text-zinc-700 whitespace-pre-wrap">{l.notes}</div>
                    ) : null}
                  </div>

                  <Link
                    href="/log"
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                  >
                    Edit in Log
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {status ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {status}
          </div>
        ) : null}
      </section>
    </div>
  );
}