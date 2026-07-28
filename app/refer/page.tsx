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
    return `${window.location.origin}/login?ref=${encodeURIComponent(code)}`;
  }, [code]);

  useEffect(() => {
    const load = async () => {
      setStatus("");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) { setStatus("Session error: " + sessionError.message); return; }
      const session = sessionData.session;
      if (!session) { router.replace("/login"); return; }
      const { data, error } = await supabase.from("profiles").select("referral_code").eq("user_id", session.user.id).maybeSingle();
      if (error) { setStatus("Could not load referral code: " + error.message); return; }
      if (data?.referral_code) { setCode(data.referral_code); return; }
      setStatus("Referral code missing. Run backfill profiles SQL in Supabase, then refresh.");
    };
    load();
  }, [router]);

  const copy = async () => {
    if (!link) return;
    try { await navigator.clipboard.writeText(link); setStatus("Copied referral link // Ready to deploy."); }
    catch { setStatus("Could not copy. Select link manually."); }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="border-b border-[#2A2A2A] pb-6">
        <div className="text- font-black tracking-[0.3em] text-[#4B5320] uppercase">Recruit // Referral Ops // V1</div>
        <h1 className="mt-2 text-3xl font-black tracking-[0.1em] uppercase text-[#E8E8E8]">Refer A Friend // Recruit</h1>
        <p className="mt-2 text- uppercase tracking-[0.15em] text-[#6B7280]">Share Link // Squad Up // Record Referral</p>
      </div>

      <div className="mt-8 border border-[#2A2A2A] bg-[#1A1A1A] p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="text- font-black tracking-[0.2em] uppercase text-[#6B7280]">Your Referral Code // Callsign</div>
            <div className="mt-2 border border-[#2A2A2A] bg-[#0F0F0F] px-4 py-3 font-mono text-sm font-black tracking-[0.2em] text-[#E8C87A]">{code || "—"}</div>
          </div>
          <div>
            <div className="text- font-black tracking-[0.2em] uppercase text-[#6B7280]">Status // Ops</div>
            <div className="mt-2 border border-[#4B5320]/30 bg-[#0F0F0F] px-4 py-3 text- uppercase tracking-[0.1em] text-[#4B5320]">Active // Ready To Deploy</div>
          </div>
        </div>

        <div>
          <div className="text- font-black tracking-[0.2em] uppercase text-[#6B7280]">Your Referral Link // Exfil Route</div>
          <input readOnly value={link || ""} className="mt-2 w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 font-mono text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" placeholder="Generating link..." />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[#2A2A2A] pt-6">
          <button onClick={copy} disabled={!link} className="bg-[#4B5320] px-6 py-2.5 text- font-black uppercase tracking-[0.15em] text-white hover:bg-[#5A6330] disabled:opacity-50">Copy Link // Copy Exfil</button>
          {status? <div className="border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text- font-black uppercase tracking-[0.05em] text-[#E8C87A]">{status}</div> : null}
        </div>

        <div className="border border-[#2A2A2A]/50 bg-[#0F0F0F] p-3 text- uppercase tracking-[0.1em] text-[#555]">Tip: Share By Text Or Email. Referral Is Claimed After Friend Creates Account And Logs In. // Recruit Protocol</div>
      </div>

      <div className="mt-6 border border-[#4B5320]/20 bg-[#1A1A1A] p-4">
        <div className="text- font-black uppercase tracking-[0.2em] text-[#4B5320]">Mission // Why Recruit</div>
        <p className="mt-2 text- leading-5 text-[#A0A0A0]">Built by a veteran for veterans. More operators with organized evidence = more wins. No data selling. Just helping squad get benefits earned.</p>
      </div>
    </div>
  );
}