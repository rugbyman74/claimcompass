"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { getProStatus } from "@/lib/pro";

type SymptomLog = {
  id: string;
  condition: string;
  severity: number;
  affected_work: boolean;
  notes: string | null;
  logged_at: string;
};

function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function StatementPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [fullName, setFullName] = useState("");
  const [claimFor, setClaimFor] = useState("");

  const [isPro, setIsPro] = useState(false);
  const [proLoaded, setProLoaded] = useState(false);

  const fromDate = useMemo(() => daysAgoISO(30), []);

  const load = async () => {
    setStatus("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) return setStatus("Session error: " + sessionError.message);

    const session = sessionData.session;
    if (!session) {
      router.replace("/login");
      return;
    }

    // Fetch profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", session.user.id)
      .single();

    const autoName = profile?.full_name || session.user.email || "";

    setFullName(autoName);

    const { data, error } = await supabase
      .from("symptom_logs")
      .select("id, condition, severity, affected_work, notes, logged_at")
      .gte("logged_at", fromDate)
      .order("logged_at", { ascending: false });

    if (error) setStatus("Load error: " + error.message);
    else setLogs((data ?? []) as SymptomLog[]);
  };

  useEffect(() => {
    const init = async () => {
      await load();
      const res = await getProStatus();
      setIsPro(res.isPro);
      setProLoaded(true);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statementText = useMemo(() => {
    if (logs.length === 0) return "";

    const groups = new Map<string, SymptomLog[]>();
    for (const l of logs) {
      const key = l.condition.trim() || "Unspecified condition";
      groups.set(key, [...(groups.get(key) ?? []), l]);
    }

    const lines: string[] = [];
    lines.push("STATEMENT IN SUPPORT OF CLAIM");
    lines.push("");
    lines.push(`Name: ${fullName || "[Your Name]"}`);
    if (claimFor.trim()) lines.push(`Claim type / request: ${claimFor.trim()}`);
    lines.push(`Date range covered: ${fromDate} through ${new Date().toISOString().slice(0, 10)}`);
    lines.push("");
    lines.push(
      "I am submitting this statement to describe the frequency, severity, and functional impact of my symptoms during the period listed above. The information below is based on a daily symptom log I kept to accurately document my condition(s)."
    );
    lines.push("");

    for (const [condition, entries] of groups.entries()) {
      const severities = entries.map((e) => e.severity);
      const avg =
        Math.round((severities.reduce((a, b) => a + b, 0) / severities.length) * 10) / 10;
      const high = Math.max(...severities);
      const workImpactDays = entries.filter((e) => e.affected_work).length;

      lines.push(`Condition: ${condition}`);
      lines.push(`- Number of logged days: ${entries.length}`);
      lines.push(`- Average severity (1–10): ${avg}`);
      lines.push(`- Highest severity (1–10): ${high}`);
      lines.push(`- Days affecting work/function: ${workImpactDays}`);
      lines.push("");

      const noteExamples = entries
        .filter((e) => (e.notes ?? "").trim().length > 0)
        .slice(0, 6);

      if (noteExamples.length > 0) {
        lines.push("Examples from my log:");
        for (const ex of noteExamples) {
          const impact = ex.affected_work ? " (affected work/function)" : "";
          lines.push(`- ${ex.logged_at}: severity ${ex.severity}/10${impact}. ${ex.notes?.trim()}`);
        }
        lines.push("");
      }
    }

    lines.push(
      "I certify that the statements above are true and correct to the best of my knowledge and belief."
    );
    lines.push("");
    lines.push("Signature: ____________________________");
    lines.push("Date: _________________________________");

    return lines.join("\n");
  }, [logs, fullName, claimFor, fromDate]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(statementText);
      setStatus("✅ Copied to clipboard.");
    } catch {
      setStatus("❌ Could not copy. You can select the text and copy manually.");
    }
  };

  const downloadPdf = async () => {
    setStatus("");

    if (!statementText.trim()) {
      setStatus("❌ Nothing to export yet.");
      return;
    }

    if (!isPro) {
      setStatus("⭐ Pro required to download PDF. You can still copy the text for free.");
      return;
    }

    const res = await fetch("/api/statement-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "STATEMENT IN SUPPORT OF CLAIM",
        filename: "ClaimCompass-Statement.pdf",
        content: statementText,
      }),
    });

    if (!res.ok) {
      const msg = await res.text();
      setStatus("❌ PDF export failed: " + msg);
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ClaimCompass-Statement.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
    setStatus("✅ PDF downloaded.");
  };

  const downloadWord = async () => {
    setStatus("");

    if (!statementText.trim()) {
      setStatus("❌ Nothing to export yet.");
      return;
    }

    if (!isPro) {
      setStatus("⭐ Pro required to download Word document. You can still copy the text for free.");
      return;
    }

    const res = await fetch("/api/statement-docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "STATEMENT IN SUPPORT OF CLAIM",
        filename: "ClaimCompass-Statement.docx",
        content: statementText,
      }),
    });

    if (!res.ok) {
      const msg = await res.text();
      setStatus("❌ Word export failed: " + msg);
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ClaimCompass-Statement.docx";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
    setStatus("✅ Word document downloaded.");
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Statement Generator</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Builds a structured statement from your last 30 days of logs – then exports as PDF or Word.
          </p>
        </div>

        <div className="text-sm">
          {proLoaded ? (
            isPro ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                Pro enabled
              </span>
            ) : (
              <Link
                href="/pricing"
                className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Upgrade to Pro
              </Link>
            )
          ) : (
            <span className="text-zinc-500">Checking plan…</span>
          )}
        </div>
      </div>

      {!isPro ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-semibold">Pro feature: PDF & Word export</div>
          <div className="mt-1">
            You can generate and copy your statement text for free. Downloading as PDF or Word document is available on Pro.
          </div>
          <div className="mt-3">
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              View pricing
            </Link>
          </div>
        </div>
      ) : null}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">Veteran name</span>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800">
              {fullName || "–"}
            </div>
            <div className="text-xs text-zinc-500">Auto-filled from your account profile.</div>
          </div>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">Request (optional)</span>
            <input
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
              value={claimFor}
              onChange={(e) => setClaimFor(e.target.value)}
              placeholder="e.g., Increase for migraines; new claim for PTSD"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={load}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Refresh from logs
          </button>

          <button
            onClick={copyToClipboard}
            disabled={!statementText.trim()}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-50"
          >
            Copy text
          </button>

          <button
            onClick={downloadPdf}
            disabled={!statementText.trim()}
            className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
              isPro
                ? "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
                : "border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
            }`}
          >
            Download PDF {isPro ? "" : " (Pro)"}
          </button>

          <button
            onClick={downloadWord}
            disabled={!statementText.trim()}
            className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
              isPro
                ? "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
                : "border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
            }`}
          >
            Download Word {isPro ? "" : " (Pro)"}
          </button>

          {status ? (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                status.startsWith("❌")
                  ? "border-red-200 bg-red-50 text-red-700"
                  : status.startsWith("⭐")
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {status}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Preview</h2>
            <p className="mt-1 text-sm text-zinc-600">
              {logs.length === 0
                ? "No logs found in the last 30 days. Add entries first."
                : "Review before exporting."}
            </p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed p-6 text-sm text-zinc-600">
            Go to{" "}
            <a className="font-semibold underline" href="/log">
              /log
            </a>{" "}
            and add entries, then come back.
          </div>
        ) : (
          <textarea
            readOnly
            value={statementText}
            className="mt-4 w-full min-h-[420px] rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800 outline-none"
          />
        )}
      </section>
    </div>
  );
}