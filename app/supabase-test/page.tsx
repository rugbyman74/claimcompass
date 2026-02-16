"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SupabaseTestPage() {
  const [status, setStatus] = useState("Testing connection...");

  useEffect(() => {
    const checkConnection = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setStatus("❌ Supabase error: " + error.message);
      } else {
        setStatus("✅ Supabase is connected successfully.");
      }
    };

    checkConnection();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Supabase Test</h1>
      <p>{status}</p>
    </div>
  );
}
