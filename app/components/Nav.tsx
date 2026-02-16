"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function parseAdminEmails(raw: string | undefined | null) {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    >
      {children}
    </Link>
  );
}

export default function Nav() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState<string>("");

  const isDev = process.env.NODE_ENV === "development";

  const adminEmails = useMemo(
    () => parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS),
    []
  );

  const showDevLink = useMemo(() => {
    if (!isDev) return false;
    if (!email) return false;
    return adminEmails.includes(email.toLowerCase());
  }, [adminEmails, email, isDev]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      setLoggedIn(!!session);
      setEmail(session?.user?.email ?? "");
    };

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
      setEmail(session?.user?.email ?? "");
    });

    return () => sub.subscription.unsubscribe();
  }, []);
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white">
            CC
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">ClaimCompass</div>
            <div className="text-xs text-zinc-500">VA claim organizer</div>
          </div>
        </Link>

        <nav className="ml-3 hidden items-center gap-1 md:flex">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/log">Symptom Log</NavLink>
          <NavLink href="/statement">Statement</NavLink>
          <NavLink href="/vault">Vault</NavLink>
          <NavLink href="/refer">Refer</NavLink>
          <NavLink href="/settings">Settings</NavLink>
          {showDevLink ? <NavLink href="/dev">Dev</NavLink> : null}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {loggedIn ? (
            <button
              onClick={logout}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-3 md:hidden">
        <div className="flex flex-wrap gap-2">
          <NavLink href="/dashboard">Dash</NavLink>
          <NavLink href="/log">Log</NavLink>
          <NavLink href="/statement">Statement</NavLink>
          <NavLink href="/vault">Vault</NavLink>
          <NavLink href="/refer">Refer</NavLink>
          <NavLink href="/settings">Settings</NavLink>
          {showDevLink ? <NavLink href="/dev">Dev</NavLink> : null}
        </div>
      </div>
    </header>
  );
}