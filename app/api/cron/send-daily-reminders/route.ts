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
    // TEMPORARILY DISABLED FOR DEBUGGING
    // const authHeader = req.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const now = new Date();
    const currentHourUTC = now.getUTCHours();

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
    const errors = [];

    const debugInfo = []; // Store debug info for each user

    for (const profile of profiles) {
      const user = users.data.users.find(u => u.id === profile.user_id);
      if (!user || !user.email) continue;

      const userTimezone = profile.timezone || "America/Chicago";
      const userLocalTime = toZonedTime(now, userTimezone);
      const userLocalHour = userLocalTime.getHours();

      const reminderHour = parseInt(profile.reminder_time?.split(":")[0] || "18");

      // Debug info for this user
      const debug = {
        email: user.email,
        timezone: userTimezone,
        reminderTime: profile.reminder_time,
        reminderHour: reminderHour,
        currentUTC: now.toISOString(),
        currentHourUTC: currentHourUTC,
        userLocalTime: userLocalTime.toISOString(),
        userLocalHour: userLocalHour,
        shouldSend: userLocalHour === reminderHour,
      };
      debugInfo.push(debug);

      if (userLocalHour === reminderHour) {
        const dayofWeek = userLocalTime.getDay();
        const shouldSend =
          profile.reminder_days === "daily" ||
          (profile.reminder_days === "weekdays" && dayofWeek >= 1 && dayofWeek <= 5) ||
          (profile.reminder_days === "weekends" && (dayofWeek === 0 || dayofWeek === 6));

        if (shouldSend) {
          try {
            await resend.emails.send({
              from: "ClaimCompass <onboarding@resend.dev>",
              to: user.email,
              subject: "Don't forget to log Your Symptoms Today",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #3C3B6E;">Hi ${profile.full_name || "there"}! 👋</h2>
                  
                  <p>This is your daily reminder to log your symptoms in ClaimCompass.</p>
                  
                  <p><strong>Consistency is key!</strong> Regular symptom tracking builds stronger evidence for your VA claim.</p>
                  
                  <div style="margin: 30px 0;">
                    <a href="https://claimcompass.net/log" 
                       style="background-color: #3C3B6E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Log Symptoms Now
                    </a>
                  </div>
                  
                  <p style="color: #666; font-size: 14px;">
                    You can manage your reminder settings in your <a href="https://claimcompass.net/account">account settings</a>.
                  </p>
                </div>
              `,
            });
            emailsSent++;
          } catch (err: any) {
            console.error("Send error:", err);
            errors.push({ email: user.email, error: err.message });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      totalUsersChecked: profiles.length,
      currentTimeUTC: now.toISOString(),
      currentHourUTC,
      debugInfo, // Include debug info in response
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error("Cron error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}