import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: Request) {
  try {
    const { email, userId, priceId } = await req.json();

    if (!email || !userId) {
      return NextResponse.json({ error: "Email and User ID required" }, { status: 400 });
    }

    if (!priceId) {
      return NextResponse.json({ error: "Price ID required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/pricing?canceled=true`,
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}