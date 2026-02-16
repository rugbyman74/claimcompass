"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  useEffect(() => {
    const go = async () => {
      const { data, error } = await supabase.auth.getSession();

      // If session check fails for any reason, send to login
      if (error) {
        window.location.href = "/login";
        return;
      }

      if (data.session) window.location.href = "/dashboard";
      else window.location.href = "/login";
    };

    go();
  }, []);

  return null;
}
