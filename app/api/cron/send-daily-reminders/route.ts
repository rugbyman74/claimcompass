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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const users = await supabaseAdmin.auth.admin.listUsers();
    let emailsSent = 0;

    for (const profile of profiles) {
      const user = users.data.users.find(u => u.id === profile.user_id);
      if (!user?.email) continue;

      const userTimezone = profile.timezone || "America/Chicago";
      const userLocalTime = toZonedTime(now, userTimezone);
      const userLocalHour = userLocalTime.getHours();
      const reminderHour = parseInt(profile.reminder_time?.split(":")[0] || "18");

      if (userLocalHour!== reminderHour) continue;

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentLogs } = await supabaseAdmin
       .from("reminder_logs")
       .select("id")
       .eq("user_id", profile.user_id)
       .gte("sent_at", oneHourAgo)
       .limit(1);

      if (recentLogs && recentLogs.length > 0) continue;

      const dayOfWeek = userLocalTime.getDay();
      const shouldSend =
        profile.reminder_days === "daily" ||
        (profile.reminder_days === "weekdays" && dayOfWeek >= 1 && dayOfWeek <= 5) ||
        (profile.reminder_days === "weekends" && (dayOfWeek === 0 || dayOfWeek === 6));

      if (!shouldSend) continue;

      try {
        await resend.emails.send({
          from: "Squad Leader <squad@claimcompass.net>",
          to: user.email,
          subject: "Daily SITREP: Log Your Symptoms",
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #3C3B6E;">SITREP, ${profile.full_name?.split(" ")[0] || "Warrior"}</h2><p><strong>Mission: Document your symptoms.</strong></p><p>VA doesn't award what you don't document. Every log entry is evidence.</p><div style="margin: 30px 0;"><a href="https://claimcompass.net/log" style="background-color: #3C3B6E; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">LOG SITREP NOW</a></div><p style="color: #666; font-size: 14px;">Manage alerts in <a href="https://claimcompass.net/account">account settings</a>.</p></div>`,
        });

        await supabaseAdmin.from("reminder_logs").insert({
          user_id: profile.user_id,
          email: user.email,
          timezone_used: userTimezone,
          status: 'sent'
        });

        emailsSent++;
      } catch (err: any) {
        await supabaseAdmin.from("reminder_logs").insert({
          user_id: profile.user_id,
          email: user.email,
          timezone_used: userTimezone,
          status: 'failed',
          error_message: err.message
        });
      }
    }

    return NextResponse.json({ success: true, emailsSent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
