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
    if (!session) { router.replace("/login"); return; }
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", session.user.id).single();
    const autoName = profile?.full_name || session.user.email || "";
    setFullName(autoName);
    const { data, error } = await supabase.from("symptom_logs").select("id, condition, severity, affected_work, notes, logged_at").gte("logged_at", fromDate).order("logged_at", { ascending: false });
    if (error) setStatus("Load error: " + error.message);
    else setLogs((data?? []) as SymptomLog[]);
  };

  useEffect(() => {
    const init = async () => { await load(); const res = await getProStatus(); setIsPro(res.isPro); setProLoaded(true); };
    init();
  }, []);

  const statementText = useMemo(() => {
    if (logs.length === 0) return "";
    const groups = new Map<string, SymptomLog[]>();
    for (const l of logs) {
      const key = l.condition.trim() || "Unspecified condition";
      groups.set(key, [...(groups.get(key)?? []), l]);
    }
    const lines: string[] = [];
    lines.push("STATEMENT IN SUPPORT OF CLAIM");
    lines.push("");
    lines.push(`Name: ${fullName || "[Your Name]"}`);
    if (claimFor.trim()) lines.push(`Claim type / request: ${claimFor.trim()}`);
    lines.push(`Date range covered: ${fromDate} through ${new Date().toISOString().slice(0, 10)}`);
    lines.push("");
    lines.push("I am submitting this statement to describe the frequency, severity, and functional impact of my symptoms during the period listed above. The information below is based on a daily symptom log I kept to accurately document my condition(s).");
    lines.push("");
    for (const [condition, entries] of groups.entries()) {
      const severities = entries.map((e) => e.severity);
      const avg = Math.round((severities.reduce((a, b) => a + b, 0) / severities.length) * 10) / 10;
      const high = Math.max(...severities);
      const workImpactDays = entries.filter((e) => e.affected_work).length;
      lines.push(`Condition: ${condition}`);
      lines.push(`- Number of logged days: ${entries.length}`);
      lines.push(`- Average severity (1-10): ${avg}`);
      lines.push(`- Highest severity (1-10): ${high}`);
      lines.push(`- Days affecting work/function: ${workImpactDays}`);
      lines.push("");
      const noteExamples = entries.filter((e) => (e.notes?? "").trim().length > 0).slice(0, 6);
      if (noteExamples.length > 0) {
        lines.push("Examples from my log:");
        for (const ex of noteExamples) {
          const impact = ex.affected_work? " (affected work/function)" : "";
          lines.push(`- ${ex.logged_at}: severity ${ex.severity}/10${impact}. ${ex.notes?.trim()}`);
        }
        lines.push("");
      }
    }
    lines.push("I certify that the statements above are true and correct to the best of my knowledge and belief.");
    lines.push(""); lines.push("Signature: ____________________________"); lines.push("Date: _________________________________");
    return lines.join("\n");
  }, [logs, fullName, claimFor, fromDate]);

  const copyToClipboard = async () => {
    try { await navigator.clipboard.writeText(statementText); setStatus("COPIED TO CLIPBOARD"); }
    catch { setStatus("Could not copy. Select manually."); }
  };

  const downloadPdf = async () => {
    setStatus(""); if (!statementText.trim()) { setStatus("Nothing to export yet."); return; }
    if (!isPro) { setStatus("Pro required to download PDF."); return; }
    const res = await fetch("/api/statement-pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "STATEMENT IN SUPPORT OF CLAIM", filename: "ClaimCompass-Statement.pdf", content: statementText }) });
    if (!res.ok) { const msg = await res.text(); setStatus("PDF export failed: " + msg); return; }
    const blob = await res.blob(); const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ClaimCompass-Statement.pdf"; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    setStatus("PDF DOWNLOADED");
  };

  const downloadWord = async () => {
    setStatus(""); if (!statementText.trim()) { setStatus("Nothing to export yet."); return; }
    if (!isPro) { setStatus("Pro required to download Word."); return; }
    const res = await fetch("/api/statement-docx", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "STATEMENT IN SUPPORT OF CLAIM", filename: "ClaimCompass-Statement.docx", content: statementText }) });
    if (!res.ok) { const msg = await res.text(); setStatus("Word export failed: " + msg); return; }
    const blob = await res.blob(); const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ClaimCompass-Statement.docx"; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    setStatus("WORD DOWNLOADED");
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <div className="text- font-black tracking-[0.3em] text-[#4B5320] uppercase mb-2">Output // Statement Builder // V1</div>
          <h1 className="text-3xl font-black tracking-[0.1em] uppercase text-[#E8E8E8]">Statement Generator</h1>
          <p className="mt-2 text-xs tracking-[0.1em] uppercase text-[#6B7280]">Builds structured statement from last 30 days — exports as PDF or Word.</p>
        </div>
        <div className="text-sm">
          {proLoaded? isPro? <span className="border border-[#4B5320] bg-[#1A1A1A] px-3 py-1 text- font-black uppercase tracking-[0.15em] text-[#4B5320]">Pro Enabled</span> : <Link href="/pricing" className="border border-[#E8E8E8] bg-[#E8E8E8] px-3 py-1 text- font-black uppercase text-[#0F0F0F]">Upgrade to Pro</Link> : <span className="text-[#6B7280] text-xs">Checking plan…</span>}
        </div>
      </div>

      {!isPro? (
        <div className="border border-[#5A4A1A] bg-[#1A160F] p-4">
          <div className="text- font-black tracking-[0.2em] uppercase text-[#E8C87A]">Pro Feature: PDF & Word Export</div>
          <div className="mt-1 text- text-[#A0A0A0]">You can generate and copy your statement text for free. Downloading as PDF or Word is Pro.</div>
          <div className="mt-3"><Link href="/pricing" className="inline-flex border border-[#4B5320] bg-[#4B5320] px-4 py-2 text- font-black uppercase tracking-[0.15em] text-white">View Pricing</Link></div>
        </div>
      ) : null}

      <section className="border border-[#2A2A2A] bg-[#1A1A1A] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <span className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Veteran Name // Auto-filled</span>
            <div className="border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 text-sm text-[#E8E8E8]">{fullName || "-"}</div>
          </div>
          <label className="grid gap-2">
            <span className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Request // Optional</span>
            <input className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" value={claimFor} onChange={(e) => setClaimFor(e.target.value)} placeholder="INCREASE FOR MIGRAINES; NEW CLAIM PTSD" />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={load} className="border border-[#2A2A2A] bg-[#0F0F0F] px-4 py-3 text- font-black tracking-[0.15em] uppercase text-[#E8E8E8] hover:border-[#4B5320]">Refresh From Logs</button>
          <button onClick={copyToClipboard} disabled={!statementText.trim()} className="border border-[#2A2A2A] bg-[#E8E8E8] px-4 py-3 text- font-black tracking-[0.15em] uppercase text-[#0F0F0F] hover:bg-white disabled:opacity-50">Copy Text</button>
          <button onClick={downloadPdf} disabled={!statementText.trim()} className={`border px-4 py-3 text- font-black tracking-[0.15em] uppercase disabled:opacity-50 ${isPro? "border-[#2A2A2A] bg-[#0F0F0F] text-[#E8E8E8] hover:border-[#4B5320]" : "border-[#5A4A1A] bg-[#1A160F] text-[#E8C87A]"}`}>Download PDF {isPro? "" : "(Pro)"}</button>
          <button onClick={downloadWord} disabled={!statementText.trim()} className={`border px-4 py-3 text- font-black tracking-[0.15em] uppercase disabled:opacity-50 ${isPro? "border-[#2A2A2A] bg-[#0F0F0F] text-[#E8E8E8] hover:border-[#4B5320]" : "border-[#5A4A1A] bg-[#1A160F] text-[#E8C87A]"}`}>Download Word {isPro? "" : "(Pro)"}</button>
          {status? <div className="border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text- font-black uppercase text-[#4B5320]">{status}</div> : null}
        </div>
      </section>

      <section className="border border-[#2A2A2A] bg-[#1A1A1A]">
        <div className="border-b border-[#2A2A2A] p-6 flex justify-between">
          <div>
            <h2 className="text- font-black tracking-[0.2em] uppercase text-[#E8E8E8]">Preview // Statement</h2>
            <p className="mt-1 text- tracking-[0.15em] uppercase text-[#6B7280]">{logs.length === 0? "No logs found in last 30 days. Add entries first." : "Review before exporting."}</p>
          </div>
          <div className="text- tracking-[0.15em] text-[#4B5320] border border-[#4B5320] px-2 py-1 h-fit">CLASSIFICATION: VA READY</div>
        </div>
        {logs.length === 0? <div className="p-6 text- text-[#6B7280]">Go to <a className="font-black underline text-[#4B5320]" href="/log">/log</a> and add entries.</div> : <textarea readOnly value={statementText} className="w-full min-h- bg-[#0F0F0F] p-6 text- leading-6 text-[#E8E8E8] outline-none font-mono" />}
      </section>
    </div>
  );
}