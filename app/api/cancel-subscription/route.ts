import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { data: sessionData } = await supabaseAdmin.auth.getSession();
    
    if (!sessionData.session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = sessionData.session.user.id;

    // Get user's profile to find their Stripe customer ID
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    // Get all active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    const subscription = subscriptions.data[0];

    // Cancel the subscription at period end (not immediately)
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription will cancel at the end of the billing period",
      cancel_at: (subscription as any).current_period_end,
    });
  } catch (error: any) {
    console.error("Cancellation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}