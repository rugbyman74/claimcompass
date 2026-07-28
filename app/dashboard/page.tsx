"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProStatus } from "@/lib/pro";

type SymptomLog = {
  id: string;
  condition: string;
  severity: number;
  logged_at: string;
};

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [recentLogs, setRecentLogs] = useState<SymptomLog[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/login");
        return;
      }
      const meta = sessionData.session.user.user_metadata?? {};
      const name =
        (typeof meta.full_name === "string" && meta.full_name.trim()) ||
        (typeof meta.name === "string" && meta.name.trim()) ||
        sessionData.session.user.email?.split("@")[0] ||
        "OPERATOR";

      setUserName(name.toUpperCase());
      const pro = await getProStatus();
      setIsPro(pro.isPro);

      const { data: logs } = await supabase
       .from("symptom_logs")
       .select("id, condition, severity, logged_at")
       .order("logged_at", { ascending: false })
       .limit(5);

      setRecentLogs((logs?? []) as SymptomLog[]);

      const { data: badgeData } = await supabase
       .from("user_badges")
       .select("badge_id, badges(id, name, description, icon)")
       .eq("user_id", sessionData.session.user.id)
       .limit(3);

      const earnedBadges = (badgeData?? [])
       .map((b: any) => b.badges)
       .filter(Boolean) as Badge[];

      setBadges(earnedBadges);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h- items-center justify-center">
        <div className="text- font-black tracking-[0.2em] uppercase text-[#6B7280] border border-[#2A2A2A] px-6 py-3 bg-[#1A1A1A]">
          LOADING COMMAND CENTER...
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <div className="text- font-black tracking-[0.3em] text-[#4B5320] uppercase mb-2">Command Center // Active</div>
          <h1 className="text-3xl font-black tracking-[0.1em] uppercase text-[#E8E8E8]">Welcome, {userName}</h1>
          <p className="mt-2 text-xs tracking-[0.1em] uppercase text-[#6B7280]">
            Evidence Locker Online // Mission: Build Consistent Trail
          </p>
        </div>
        <div>
          {isPro? (
            <span className="border border-[#4B5320] bg-[#1A1A1A] px-4 py-2 text- font-black tracking-[0.15em] uppercase text-[#4B5320]">
              Plan: Pro // Active
            </span>
          ) : (
            <Link href="/pricing" className="border border-[#E8E8E8] bg-[#E8E8E8] px-4 py-2 text- font-black tracking-[0.15em] uppercase text-[#0F0F0F] hover:bg-white">
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      {/* QUICK ACTIONS - Pelican Bays */}
      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/log" className="group border border-[#2A2A2A] bg-[#1A1A1A] p-6 hover:border-[#4B5320] transition-colors">
          <div className="text- font-black tracking-[0.2em] text-[#4B5320] mb-3">BAY 01 // FIELD OPS</div>
          <div className="text- font-black tracking-[0.15em] uppercase text-[#E8E8E8]">Log Symptoms</div>
          <div className="mt-2 text- leading-5 text-[#A0A0A0]">Daily entries build your trail.</div>
          <div className="mt-4 text- font-black tracking-[0.15em] uppercase text-[#6B7280] group-hover:text-[#4B5320]">EXECUTE →</div>
        </Link>

        <Link href="/statement" className="group border border-[#2A2A2A] bg-[#1A1A1A] p-6 hover:border-[#4B5320] transition-colors">
          <div className="text- font-black tracking-[0.2em] text-[#4B5320] mb-3">BAY 02 // OUTPUT</div>
          <div className="text- font-black tracking-[0.15em] uppercase text-[#E8E8E8]">Generate Statement</div>
          <div className="mt-2 text- leading-5 text-[#A0A0A0]">Professional statements for raters.</div>
          <div className="mt-4 text- font-black tracking-[0.15em] uppercase text-[#6B7280] group-hover:text-[#4B5320]">EXECUTE →</div>
        </Link>

        <Link href="/vault" className="group border border-[#2A2A2A] bg-[#1A1A1A] p-6 hover:border-[#4B5320] transition-colors">
          <div className="text- font-black tracking-[0.2em] text-[#4B5320] mb-3">BAY 03 // STORAGE</div>
          <div className="text- font-black tracking-[0.15em] uppercase text-[#E8E8E8]">Evidence Vault</div>
          <div className="mt-2 text- leading-5 text-[#A0A0A0]">Medical records, DBQs, nexus.</div>
          <div className="mt-4 text- font-black tracking-[0.15em] uppercase text-[#6B7280] group-hover:text-[#4B5320]">OPEN →</div>
        </Link>
      </section>

      {/* RECENT LOGS - Tactical Table */}
      <section className="border border-[#2A2A2A] bg-[#1A1A1A]">
        <div className="flex items-end justify-between gap-4 border-b border-[#2A2A2A] p-6">
          <div>
            <h2 className="text- font-black tracking-[0.2em] uppercase text-[#E8E8E8]">Recent Field Logs</h2>
            <p className="mt-1 text- tracking-[0.15em] uppercase text-[#6B7280]">Last 5 Entries // Most Recent First</p>
          </div>
          <Link href="/log" className="border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text- font-black tracking-[0.15em] uppercase text-[#A0A0A0] hover:text-[#E8E8E8]">
            View All
          </Link>
        </div>

        {recentLogs.length === 0? (
          <div className="m-4 border border-dashed border-[#2A2A2A] p-6 text- tracking-wide text-[#6B7280]">
            No field logs yet. Start logging to build your evidence trail.
          </div>
        ) : (
          <div className="divide-y divide-[#2A2A2A]">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="text- font-bold tracking-wide uppercase text-[#E8E8E8]">{log.condition}</div>
                  <div className="text- tracking-[0.1em] text-[#6B7280] mt-1">{new Date(log.logged_at).toLocaleString()}</div>
                </div>
                <div className="border border-[#4B5320] bg-[#0F0F0F] px-3 py-1 text- font-black text-[#4B5320]">
                  SEV {log.severity}/10
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BADGES - Tactical Patches */}
      <section className="border border-[#2A2A2A] bg-[#1A1A1A]">
        <div className="flex items-end justify-between gap-4 border-b border-[#2A2A2A] p-6">
          <div>
            <h2 className="text- font-black tracking-[0.2em] uppercase text-[#E8E8E8]">Earned Patches</h2>
            <p className="mt-1 text- tracking-[0.15em] uppercase text-[#6B7280]">Mission Progress</p>
          </div>
          <Link href="/badges" className="border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text- font-black tracking-[0.15em] uppercase text-[#A0A0A0] hover:text-[#E8E8E8]">
            View All
          </Link>
        </div>

        {badges.length === 0? (
          <div className="m-4 border border-dashed border-[#2A2A2A] p-6 text- tracking-wide text-[#6B7280]">
            No patches earned yet. Keep logging to earn tactical patches.
          </div>
        ) : (
          <div className="grid gap-0 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#2A2A2A]">
            {badges.map((badge) => (
              <div key={badge.id} className="p-6">
                <div className="text- font-black tracking-[0.2em] text-[#4B5320] uppercase">{badge.icon} PATCH</div>
                <div className="mt-2 text- font-black tracking-[0.1em] uppercase text-[#E8E8E8]">{badge.name}</div>
                <div className="mt-1 text- leading-4 text-[#6B7280]">{badge.description}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}