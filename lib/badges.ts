import { supabase } from "./supabaseClient";

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "consistency" | "milestone" | "feature";
};

// All available badges
export const ALL_BADGES: Badge[] = [
  // Consistency badges
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Log symptoms 7 days in a row",
    icon: "🔥",
    category: "consistency",
  },
  {
    id: "month-master",
    name: "Month Master",
    description: "Log symptoms 30 days in a row",
    icon: "📅",
    category: "consistency",
  },
  {
    id: "dedicated",
    name: "Dedicated",
    description: "Log symptoms 90 days in a row",
    icon: "💪",
    category: "consistency",
  },

  // Milestone badges
  {
    id: "first-entry",
    name: "First Entry",
    description: "Add your first symptom log",
    icon: "📝",
    category: "milestone",
  },
  {
    id: "data-collector",
    name: "Data Collector",
    description: "Log 10 entries",
    icon: "📊",
    category: "milestone",
  },
  {
    id: "evidence-builder",
    name: "Evidence Builder",
    description: "Log 50 entries",
    icon: "📈",
    category: "milestone",
  },
  {
    id: "thorough-documenter",
    name: "Thorough Documenter",
    description: "Log 100 entries",
    icon: "🏆",
    category: "milestone",
  },

  // Feature usage badges
  {
    id: "statement-creator",
    name: "Statement Creator",
    description: "Generate your first statement",
    icon: "📄",
    category: "feature",
  },
  {
    id: "vault-user",
    name: "Vault User",
    description: "Upload your first file",
    icon: "🗂️",
    category: "feature",
  },
  {
    id: "detail-oriented",
    name: "Detail Oriented",
    description: "Add notes to 10 entries",
    icon: "✍️",
    category: "feature",
  },
];

// Check and award badges for a user
export async function checkAndAwardBadges(userId: string) {
  try {
    // Get user's current badges
    const { data: earnedBadges } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId);

    const earnedIds = new Set((earnedBadges || []).map((b) => b.badge_id));

    // Get user's symptom logs
    const { data: logs } = await supabase
      .from("symptom_logs")
      .select("logged_at, notes")
      .eq("user_id", userId)
      .order("logged_at", { ascending: true });

    const logCount = logs?.length || 0;
    const logsWithNotes = logs?.filter((l) => l.notes && l.notes.trim()).length || 0;

    // Check milestone badges
    const badgesToAward: Badge[] = [];

    if (logCount >= 1 && !earnedIds.has("first-entry")) {
      badgesToAward.push(ALL_BADGES.find((b) => b.id === "first-entry")!);
    }
    if (logCount >= 10 && !earnedIds.has("data-collector")) {
      badgesToAward.push(ALL_BADGES.find((b) => b.id === "data-collector")!);
    }
    if (logCount >= 50 && !earnedIds.has("evidence-builder")) {
      badgesToAward.push(ALL_BADGES.find((b) => b.id === "evidence-builder")!);
    }
    if (logCount >= 100 && !earnedIds.has("thorough-documenter")) {
      badgesToAward.push(ALL_BADGES.find((b) => b.id === "thorough-documenter")!);
    }

    // Detail oriented badge
    if (logsWithNotes >= 10 && !earnedIds.has("detail-oriented")) {
      badgesToAward.push(ALL_BADGES.find((b) => b.id === "detail-oriented")!);
    }

    // Check consistency (consecutive days)
    if (logs && logs.length > 0) {
      const streak = calculateStreak(logs.map((l) => l.logged_at));
      
      if (streak >= 7 && !earnedIds.has("week-warrior")) {
        badgesToAward.push(ALL_BADGES.find((b) => b.id === "week-warrior")!);
      }
      if (streak >= 30 && !earnedIds.has("month-master")) {
        badgesToAward.push(ALL_BADGES.find((b) => b.id === "month-master")!);
      }
      if (streak >= 90 && !earnedIds.has("dedicated")) {
        badgesToAward.push(ALL_BADGES.find((b) => b.id === "dedicated")!);
      }
    }

    // Award new badges
    if (badgesToAward.length > 0) {
      const badgeInserts = badgesToAward.map((badge) => ({
        user_id: userId,
        badge_id: badge.id,
        badge_name: badge.name,
        badge_description: badge.description,
        badge_icon: badge.icon,
      }));

      await supabase.from("user_badges").insert(badgeInserts);
    }

    return { newBadges: badgesToAward };
  } catch (error) {
    console.error("Error checking badges:", error);
    return { newBadges: [] };
  }
}

// Calculate current streak of consecutive days
function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const uniqueDates = [...new Set(dates)].sort();
  let streak = 1;
  let maxStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 1;
    }
  }

  return maxStreak;
}

// Get user's earned badges
export async function getUserBadges(userId: string) {
  const { data, error } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });

  if (error) {
    console.error("Error fetching badges:", error);
    return [];
  }

  return data || [];
}