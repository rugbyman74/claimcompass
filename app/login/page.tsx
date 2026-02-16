"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "claimcompass_pending_ref";

export default function LoginPage() {
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState(""); // signup only
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

    if (!email.trim() || !password.trim()) {
      setStatus("Please enter email and password.");
      return;
    }

    if (mode === "signup") {
      if (!fullName.trim()) {
        setStatus("Please enter your full name.");
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) setStatus(`❌ ${error.message}`);
      else setStatus("✅ Account created. You can log in now.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setStatus(`❌ ${error.message}`);
    else window.location.href = "/dashboard";
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4">
          <div className="text-xl font-semibold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </div>
          <div className="mt-1 text-sm text-zinc-600">
            {mode === "login"
              ? "Log in to continue to ClaimCompass."
              : "Sign up to start logging symptoms and organizing evidence."}
          </div>
        </div>

        <div className="grid gap-3">
          {mode === "signup" ? (
            <label className="grid gap-1">
              <span className="text-xs font-medium text-zinc-700">Full name</span>
              <input
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Christopher Lansaw"
                autoComplete="name"
              />
            </label>
          ) : null}

          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">Email</span>
            <input
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">Password</span>
            <input
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>

          <button
            onClick={handle}
            className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            {mode === "login" ? "Log in" : "Sign up"}
          </button>

          {status ? (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                status.startsWith("❌")
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {status}
            </div>
          ) : null}

          <button
            onClick={() => {
              setStatus("");
              setMode(mode === "login" ? "signup" : "login");
            }}
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>

      <div className="mt-4 text-xs text-zinc-500">
        Tip: For testing, don’t reuse a sensitive password.
      </div>
    </div>
  );
}
