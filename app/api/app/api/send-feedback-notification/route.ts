import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { feedbackType, message, userEmail } = await req.json();

    const { data, error } = await resend.emails.send({
      from: "ClaimCompass <onboarding@resend.dev>",
      to: "rugbyman74@gmail.com",
      subject: `New Feedback: ${feedbackType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3C3B6E;">New Feedback Received</h2>
          
          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Type:</strong> ${feedbackType}</p>
            <p style="margin: 8px 0 0 0;"><strong>From:</strong> ${userEmail || "Anonymous"}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <strong>Message:</strong>
            <div style="margin-top: 8px; padding: 16px; background-color: white; border: 1px solid #ddd; border-radius: 8px; white-space: pre-wrap;">
${message}
            </div>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            This feedback was submitted through ClaimCompass feedback form.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Email send error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Notification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}