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

      const meta = sessionData.session.user.user_metadata ?? {};
      const name = 
        (typeof meta.full_name === "string" && meta.full_name.trim()) ||
        (typeof meta.name === "string" && meta.name.trim()) ||
        sessionData.session.user.email?.split("@")[0] ||
        "there";
      
      setUserName(name);

      const pro = await getProStatus();
      setIsPro(pro.isPro);

      const { data: logs } = await supabase
        .from("symptom_logs")
        .select("id, condition, severity, logged_at")
        .order("logged_at", { ascending: false })
        .limit(5);

      setRecentLogs((logs ?? []) as SymptomLog[]);

      const { data: badgeData } = await supabase
        .from("user_badges")
        .select("badge_id, badges(id, name, description, icon)")
        .eq("user_id", sessionData.session.user.id)
        .limit(3);

      const earnedBadges = (badgeData ?? [])
        .map((b: any) => b.badges)
        .filter(Boolean) as Badge[];

      setBadges(earnedBadges);
      setLoading(false);
    };

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-zinc-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome, {userName}!</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Track your progress and manage your VA claim evidence.
          </p>
        </div>

        <div className="text-sm">
          {isPro ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
              Plan: Pro
            </span>
          ) : (
            <Link
              href="/pricing"
              className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/log"
          className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="text-3xl">📝</div>
          <h3 className="mt-3 text-lg font-semibold">Log Symptoms</h3>
          <p className="mt-2 text-sm text-zinc-600">
            Track your daily symptoms and mood.
          </p>
        </Link>

        <Link
          href="/statement"
          className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="text-3xl">📄</div>
          <h3 className="mt-3 text-lg font-semibold">Generate Statement</h3>
          <p className="mt-2 text-sm text-zinc-600">
            Create professional claim statements.
          </p>
        </Link>

        <Link
          href="/vault"
          className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="text-3xl">🗂️</div>
          <h3 className="mt-3 text-lg font-semibold">Evidence Vault</h3>
          <p className="mt-2 text-sm text-zinc-600">
            Store medical records securely.
          </p>
        </Link>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Recent Symptom Logs</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Your last 5 entries
            </p>
          </div>
          <Link
            href="/log"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            View All
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed p-6 text-sm text-zinc-600">
            No symptom logs yet. Start tracking to build your evidence!
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <div className="font-medium">{log.condition}</div>
                  <div className="text-sm text-zinc-500">{log.logged_at}</div>
                </div>
                <div className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold">
                  {log.severity}/10
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Recent Badges</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Your latest achievements
            </p>
          </div>
          <Link
            href="/badges"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            View All
          </Link>
        </div>

        {badges.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed p-6 text-sm text-zinc-600">
            No badges earned yet. Keep logging to earn achievements!
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="rounded-xl border bg-gradient-to-br from-blue-50 to-purple-50 p-4"
              >
                <div className="text-3xl">{badge.icon}</div>
                <div className="mt-2 font-semibold">{badge.name}</div>
                <div className="mt-1 text-xs text-zinc-600">{badge.description}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}