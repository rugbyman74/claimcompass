"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ALL_BADGES, getUserBadges, type Badge } from "@/lib/badges";

type UserBadge = {
  id: string;
  badge_id: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  earned_at: string;
};

export default function BadgesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);

  const load = async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      router.replace("/login");
      return;
    }

    const userId = sessionData.session.user.id;
    const badges = await getUserBadges(userId);
    setEarnedBadges(badges);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const earnedIds = new Set(earnedBadges.map((b) => b.badge_id));

  const consistencyBadges = ALL_BADGES.filter((b) => b.category === "consistency");
  const milestoneBadges = ALL_BADGES.filter((b) => b.category === "milestone");
  const featureBadges = ALL_BADGES.filter((b) => b.category === "feature");

  const renderBadge = (badge: Badge, earned: boolean, earnedDate?: string) => {
    return (
      <div
        key={badge.id}
        className={`rounded-2xl border p-6 shadow-sm transition ${
          earned
            ? "border-emerald-200 bg-emerald-50"
            : "border-zinc-200 bg-zinc-100 opacity-60"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`text-4xl ${earned ? "" : "grayscale"}`}>
            {badge.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className={`font-semibold ${earned ? "text-emerald-900" : "text-zinc-600"}`}>
                  {badge.name}
                </div>
                <div className={`mt-1 text-sm ${earned ? "text-emerald-800" : "text-zinc-500"}`}>
                  {badge.description}
                </div>
              </div>
              {earned ? (
                <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                  Earned
                </span>
              ) : (
                <span className="rounded-full border border-zinc-300 bg-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-600">
                  Locked
                </span>
              )}
            </div>
            {earned && earnedDate ? (
              <div className="mt-2 text-xs text-emerald-700">
                Earned on {new Date(earnedDate).toLocaleDateString()}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-sm text-zinc-600">Loading badges…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl grid gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Badge Collection</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Earn badges by staying consistent and using ClaimCompass features.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className="text-2xl">🎖️</div>
          <div className="text-lg font-semibold">
            {earnedBadges.length} / {ALL_BADGES.length} badges earned
          </div>
        </div>
      </div>

      {/* Consistency Badges */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight" style={{color: '#B22234'}}>
            🔥 Consistency Badges
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Keep logging every day to build your streak
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {consistencyBadges.map((badge) => {
            const earnedBadge = earnedBadges.find((b) => b.badge_id === badge.id);
            return renderBadge(badge, !!earnedBadge, earnedBadge?.earned_at);
          })}
        </div>
      </section>

      {/* Milestone Badges */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight" style={{color: '#3C3B6E'}}>
            📊 Milestone Badges
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Reach logging milestones as you build evidence
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {milestoneBadges.map((badge) => {
            const earnedBadge = earnedBadges.find((b) => b.badge_id === badge.id);
            return renderBadge(badge, !!earnedBadge, earnedBadge?.earned_at);
          })}
        </div>
      </section>

      {/* Feature Badges */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight" style={{color: '#B22234'}}>
            ⭐ Feature Badges
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Explore ClaimCompass features to unlock these
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {featureBadges.map((badge) => {
            const earnedBadge = earnedBadges.find((b) => b.badge_id === badge.id);
            return renderBadge(badge, !!earnedBadge, earnedBadge?.earned_at);
          })}
        </div>
      </section>

      {/* Progress tip */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <div className="text-xl">💡</div>
          <div>
            <div className="text-sm font-semibold text-blue-900">Keep logging consistently!</div>
            <div className="mt-1 text-sm text-blue-800">
              The more you log your symptoms, the stronger your evidence becomes for your VA claim. Stay consistent to unlock all badges!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}