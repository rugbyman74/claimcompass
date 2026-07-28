"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "claimcompass_pending_ref";

function LoginForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && ref.trim()) {
      window.localStorage.setItem(STORAGE_KEY, ref.trim().toUpperCase());
    }
  }, [searchParams]);

  const handle = async () => {
    setStatus("");
    if (!email.trim() ||!password.trim()) { setStatus("Enter email and password."); return; }
    if (mode === "signup") {
      if (!fullName.trim()) { setStatus("Enter full name."); return; }
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName.trim() } } });
      if (error) setStatus(`${error.message}`); else setStatus("ACCOUNT CREATED. YOU CAN LOG IN NOW.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setStatus(`${error.message}`); else window.location.href = "/log";
  };

  return (
    <div className="mx-auto max-w-md pt-10">
      <div className="border border-[#2A2A2A] bg-[#1A1A1A] p-8">
        <div className="mb-6 border-b border-[#2A2A2A] pb-6">
          <div className="text- font-black tracking-[0.3em] text-[#4B5320] uppercase">Access // Terminal V1 // Secure</div>
          <div className="mt-2 text-xl font-black tracking-[0.1em] uppercase text-[#E8E8E8]">
            {mode === "login"? "Secure Access" : "Create Credentials"}
          </div>
          <div className="mt-1 text- tracking-[0.1em] uppercase text-[#6B7280]">
            {mode === "login"? "Credentials required to access evidence locker." : "Create account to start building trail."}
          </div>
        </div>

        <div className="grid gap-4">
          {mode === "signup"? (
            <label className="grid gap-2">
              <span className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Full Name</span>
              <input className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="JOHN DOE" autoComplete="name" />
            </label>
          ) : null}

          <label className="grid gap-2">
            <span className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Email // ID</span>
            <input className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="OPERATOR@EXAMPLE.COM" autoComplete="email" />
          </label>

          <label className="grid gap-2">
            <span className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Password // Key</span>
            <input className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === "login"? "current-password" : "new-password"} />
          </label>

          <button onClick={handle} className="mt-2 w-full bg-[#4B5320] px-3 py-3 text- font-black tracking-[0.2em] uppercase text-white hover:bg-[#5A6330]">{mode === "login"? "Authorize // Log In" : "Create Account // Execute"}</button>

          {status? <div className="border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 text- font-black uppercase tracking-[0.1em] text-[#E8C87A]">{status}</div> : null}

          <button onClick={() => { setStatus(""); setMode(mode === "login"? "signup" : "login"); }} className="text- font-black tracking-[0.15em] uppercase text-[#6B7280] hover:text-[#E8E8E8]">{mode === "login"? "Need Credentials? Sign Up // Request Access" : "Have Credentials? Log In // Authorized Only"}</button>
        </div>
      </div>

      <div className="mt-4 flex justify-between text- uppercase tracking-[0.15em] text-[#555]">
        <span>ClaimCompass // Tactical V1</span>
        <span className="text-[#4B5320]">Enc // Active</span>
      </div>
      <div className="mt-2 text- uppercase tracking-[0.1em] text-[#444] text-center">Tip: For testing, don't reuse sensitive password.</div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md pt-10"><div className="border border-[#2A2A2A] bg-[#1A1A1A] p-6"><div className="text- text-[#6B7280] uppercase">Loading Terminal...</div></div></div>}>
      <LoginForm />
    </Suspense>
  );
}