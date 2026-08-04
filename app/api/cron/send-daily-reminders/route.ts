import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { toZonedTime } from "date-fns-tz";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const now = new Date();

    const { data: profiles, error } = await supabaseAdmin
   .from("profiles")
   .select("user_id, full_name, reminder_time, reminder_days, timezone, email_reminders_enabled")
   .eq("email_reminders_enabled", true);

    if (error) {
      console.error("Error fetching profiles:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const users = await supabaseAdmin.auth.admin.listUsers();
    let emailsSent = 0;
    const errors: any[] = [];

    for (const profile of profiles) {
      const user = users.data.users.find(u => u.id === profile.user_id);
      if (!user ||!user.email) continue;

      const userTimezone = profile.timezone || "America/Chicago";
      const userLocalTime = toZonedTime(now, userTimezone);
      const userLocalHour = userLocalTime.getHours();

      const reminderHour = parseInt(profile.reminder_time?.split(":")[0] || "18");

      if (userLocalHour === reminderHour) {
        const dayofWeek = userLocalTime.getDay();
        const shouldSend =
          profile.reminder_days === "daily" ||
          (profile.reminder_days === "weekdays" && dayofWeek >= 1 && dayofWeek <= 5) ||
          (profile.reminder_days === "weekends" && (dayofWeek === 0 || dayofWeek === 6));

        if (shouldSend) {
          try {
            await resend.emails.send({
              from: "Squad Leader <squad@claimcompass.net>",
              to: user.email,
              subject: "Daily SITREP: Log Your Symptoms",
              html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #3C3B6E;">SITREP, ${profile.full_name?.split(' ')[0] || 'Warrior'} 🫡</h2>
  <p><strong>Mission: Document your symptoms.</strong></p
