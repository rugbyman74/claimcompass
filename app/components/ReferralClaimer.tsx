"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const STORAGE_KEY = "claimcompass_pending_ref";

export default function ReferralClaimer() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;

    const run = async () => {
      const pending = window.localStorage.getItem(STORAGE_KEY);
      if (!pending) {
        setDone(true);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        // Not logged in yet; keep pending ref.
        setDone(true);
        return;
      }

      const referredUserId = session.user.id;

      // Look up referrer by referral code
      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("user_id, referral_code")
        .eq("referral_code", pending)
        .maybeSingle();

      if (profErr || !profile?.user_id) {
        // Invalid code → clear it so it doesn't keep trying
        window.localStorage.removeItem(STORAGE_KEY);
        setDone(true);
        return;
      }

      const referrerId = profile.user_id;

      // Prevent self-referrals
      if (referrerId === referredUserId) {
        window.localStorage.removeItem(STORAGE_KEY);
        setDone(true);
        return;
      }

      // Insert referral (RLS allows insert only if auth.uid() = referred_user_id)
      const { error: insErr } = await supabase.from("referrals").insert({
        referrer_id: referrerId,
        referred_user_id: referredUserId,
        referral_code: pending,
        status: "claimed",
      });

      // Either success OR duplicate constraint = we can clear it
      if (!insErr) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        // If already referred once, clear the pending so it stops retrying
        if ((insErr as any).code === "23505") {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }

      setDone(true);
    };

    run();
  }, [done]);

  return null;
}
