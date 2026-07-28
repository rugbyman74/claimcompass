"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function parseAdminEmails(raw: string | undefined | null) {
  return (raw?? "")
   .split(",")
   .map((s) => s.trim().toLowerCase())
   .filter(Boolean);
}

function NavLink({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`
        px-4 py-2.5 text- font-black tracking-[0.15em] uppercase border transition-all
        ${primary
         ? "bg-[#4B5320] border-[#4B5320] text-white hover:bg-[#5A6330]"
          : "bg-[#1A1A1A] border-[#2A2A2A] text-[#A0A0A0] hover:border-[#4B5320] hover:text-[#E8E8E8]"
        }
      `}
    >
      {children}
    </Link>
  );
}

export default function Nav() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
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
      setEmail(session?.user?.email?? "");
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
      setEmail(session?.user?.email?? "");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#2A2A2A] bg-[#0F0F0F]">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center bg-[#1A1A1A] border border-[#4B5320] text-[#E8E8E8] font-black text-sm tracking-widest">
            CC
          </div>
          <div className="leading-tight">
            <div className="text- font-black tracking-[0.2em] text-[#E8E8E8] uppercase">ClaimCompass</div>
            <div className="text- tracking-[0.15em] text-[#4B5320] uppercase font-bold">Tactical Evidence Locker // V1</div>
          </div>
        </Link>

        {/* DESKTOP - PRIMARY LOCKER */}
        <nav className="ml-8 hidden items-center gap-2 lg:flex">
          <NavLink href="/dashboard" primary>Command Center</NavLink>
          <NavLink href="/log">Field Log</NavLink>
          <NavLink href="/vault">Evidence Vault</NavLink>
          <NavLink href="/statement">Statement Builder</NavLink>
        </nav>

        {/* DESKTOP - SYSTEM */}
        <nav className="hidden items-center gap-2 lg:flex ml-auto">
          <NavLink href="/account">Account</NavLink>
          <NavLink href="/refer">Refer</NavLink>
          {showDevLink? <NavLink href="/dev">Dev</NavLink> : null}
          {loggedIn? (
            <button
              onClick={logout}
              className="px-4 py-2.5 text- font-black tracking-[0.15em] uppercase border border-[#C41E3A] bg-[#0F0F0F] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2.5 text- font-black tracking-[0.15em] uppercase bg-[#E8E8E8] text-[#0F0F0F] hover:bg-white"
            >
              Login
            </Link>
          )}
        </nav>

        {/* MOBILE TOGGLE */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden ml-auto border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text- font-black uppercase text-[#A0A0A0]">
          {mobileOpen? "CLOSE" : "MENU"}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#2A2A2A] bg-[#1A1A1A] px-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            <NavLink href="/dashboard" primary>Command Center</NavLink>
            <NavLink href="/log">Field Log</NavLink>
            <NavLink href="/vault">Evidence Vault</NavLink>
            <NavLink href="/statement">Statement Builder</NavLink>
            <NavLink href="/badges">Badges</NavLink>
            <NavLink href="/account">Account</NavLink>
            <NavLink href="/refer">Refer</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
            <NavLink href="/feedback">Feedback</NavLink>
            {showDevLink? <NavLink href="/dev">Dev</NavLink> : null}
          </div>
          <div className="mt-4">
            {loggedIn? (
              <button onClick={logout} className="w-full border border-[#C41E3A] py-3 text- font-black uppercase text-[#C41E3A]">Logout // {email}</button>
            ) : (
              <Link href="/login" className="block w-full bg-[#E8E8E8] py-3 text-center text- font-black uppercase text-[#0F0F0F]">Login</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}