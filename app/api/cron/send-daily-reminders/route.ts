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
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: "No users with reminders enabled" });
    }

    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    let emailsSent = 0;
    const errors = [];

    for (const profile of profiles) {
      const user = users.find(u => u.id === profile.user_id);
      if (!user || !user.email) continue;

      const userTimezone = profile.timezone || "America/Chicago";
      const userLocalTime = toZonedTime(now, userTimezone);
      const userLocalHour = userLocalTime.getHours();

      const reminderHour = parseInt(profile.reminder_time?.split(":")[0] || "18");

      if (userLocalHour === reminderHour) {
        const dayOfWeek = userLocalTime.getDay();
        const shouldSend = 
          profile.reminder_days === "daily" ||
          (profile.reminder_days === "weekdays" && dayOfWeek >= 1 && dayOfWeek <= 5) ||
          (profile.reminder_days === "weekends" && (dayOfWeek === 0 || dayOfWeek === 6));

        if (shouldSend) {
          try {
            await resend.emails.send({
              from: "ClaimCompass <onboarding@resend.dev>",
              to: user.email,
              subject: "Don't Forget to Log Your Symptoms Today",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #3C3B6E;">Hi ${profile.full_name || "there"}! 👋</h2>
                  
                  <p>This is your daily reminder to log your symptoms in ClaimCompass.</p>
                  
                  <p><strong>Consistency is key!</strong> Regular symptom tracking builds stronger evidence for your VA claim.</p>
                  
                  <div style="margin: 30px 0;">
                    <a href="https://claimcompass-fath.vercel.app/log" 
                       style="background-color: #3C3B6E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                      Log Symptoms Now
                    </a>
                  </div>
                  
                  <p style="color: #666; font-size: 14px;">
                    <strong>Quick tips for today:</strong><br>
                    • Rate your symptom severity (1-10)<br>
                    • Note if symptoms affected work/daily activities<br>
                    • Track your mood level<br>
                    • Add any notes about what happened
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                  
                  <p style="color: #999; font-size: 12px;">
                    You're receiving this because you enabled email reminders in ClaimCompass. 
                    You can change your reminder settings anytime in your Account page.
                  </p>
                  
                  <p style="color: #999; font-size: 12px;">
                    🇺🇸 ClaimCompass - Veteran Owned & Operated
                  </p>
                </div>
              `,
            });
            emailsSent++;
          } catch (emailError: any) {
            console.error(`Failed to send to ${user.email}:`, emailError);
            errors.push({ email: user.email, error: emailError.message });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      totalUsersChecked: profiles.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}