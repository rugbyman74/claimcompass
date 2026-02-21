import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: "ClaimCompass <onboardng@resend.dev>",
      to: "rugbyman74@gmail.com", // Replace with your actual email
      subject: "Test Email from ClaimCompass",
      html: "<h1>Success!</h1><p>Your email system is working!</p>",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}