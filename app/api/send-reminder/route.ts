import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, email, fullName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "ClaimCompass <reminders@claimcompass.net>",
      to: email,
      subject: "Don't Forget to Log Your Symptoms Today",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3C3B6E;">Hi ${fullName || "there"}! 👋</h2>
          
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

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}