"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { getProStatus } from "@/lib/pro";
import CancelModal from "@/app/components/CancelModal";

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [proLoaded, setProLoaded] = useState(false);
  const [emailRemindersEnabled, setEmailRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("18:00");
  const [reminderDays, setReminderDays] = useState("daily");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const load = async () => {
    setStatus("");
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (sessionError ||!session) { router.replace("/login"); return; }
    const meta = (session.user.user_metadata?? {}) as Record<string, any>;
    const autoName = (typeof meta.full_name === "string" && meta.full_name.trim()) || (typeof meta.name === "string" && meta.name.trim()) || "";
    setEmail(session.user.email?? "");
    const pro = await getProStatus();
    setIsPro(pro.isPro); setProLoaded(true);
    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).single();
    if (profile) {
      setFullName(profile.full_name || autoName);
      setPhoneNumber(profile.phone_number || "");
      setAddress(profile.address || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setZipCode(profile.zip_code || "");
      setEmailRemindersEnabled(profile.email_reminders_enabled?? false);
      setReminderTime(profile.reminder_time?? "18:00");
      setReminderDays(profile.reminder_days?? "daily");
      setTimezone(profile.timezone?? "America/Chicago");
    } else { setFullName(autoName); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [router]);

  const saveAccountInfo = async () => {
    setStatus("");
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) { setStatus("NOT LOGGED IN"); return; }
    const { error } = await supabase.from("profiles").update({ full_name: fullName.trim() || null, phone_number: phoneNumber.trim() || null, address: address.trim() || null, city: city.trim() || null, state: state.trim() || null, zip_code: zipCode.trim() || null }).eq("user_id", sessionData.session.user.id);
    if (error) { setStatus("FAILED TO SAVE: " + error.message); } else { setStatus("ACCOUNT INFORMATION UPDATED!"); setIsEditingAccount(false); }
  };

  const saveReminderSettings = async () => {
    setStatus("");
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) { setStatus("NOT LOGGED IN"); return; }
    const { error } = await supabase.from("profiles").update({ email_reminders_enabled: emailRemindersEnabled, reminder_time: reminderTime, reminder_days: reminderDays, timezone: timezone }).eq("user_id", sessionData.session.user.id);
    if (error) { setStatus("FAILED TO SAVE SETTINGS: " + error.message); } else { setStatus("REMINDER SETTINGS SAVED!"); }
  };

  const handleCancelSubscription = async () => {
    setStatus("");
    const res = await fetch("/api/cancel-subscription", { method: "POST" });
    const data = await res.json();
    setShowCancelModal(false);
    if (!res.ok) { setStatus("" + (data.error || "Failed to cancel")); return; }
    setStatus("SUBSCRIPTION WILL CANCEL AT END OF PERIOD. PRO ACCESS REMAINS.");
    setTimeout(() => { window.location.reload(); }, 3000);
  };

  if (loading) { return <div className="mx-auto max-w-3xl"><div className="border border-[#2A2A2A] bg-[#1A1A1A] p-8"><div className="text- uppercase tracking-[0.2em] text-[#6B7280]">Loading Service Record...</div></div></div>; }

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Phoenix", label: "Arizona (no DST)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/Anchorage", label: "Alaska Time (AKT)" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  ];

  return (
    <div className="mx-auto max-w-3xl grid gap-6">
      <div className="border-b border-[#2A2A2A] pb-6">
        <div className="text- font-black tracking-[0.3em] text-[#4B5320] uppercase">Operator // Service Record // V1</div>
        <h1 className="mt-2 text-3xl font-black tracking-[0.1em] uppercase text-[#E8E8E8]">Account Settings</h1>
        <p className="mt-2 text- uppercase tracking-[0.15em] text-[#6B7280]">Manage Service Record And Loadout Preferences</p>
      </div>

      <section className="border border-[#2A2A2A] bg-[#1A1A1A] p-6">
        <div className="flex items-start justify-between gap-4 border-b border-[#2A2A2A] pb-4">
          <h2 className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Account Information // Dog Tag</h2>
          {!isEditingAccount? <button onClick={() => setIsEditingAccount(true)} className="border border-[#2A2A2A] bg-[#0F0F0F] px-4 py-1.5 text- font-black uppercase text-[#E8E8E8] hover:border-[#4B5320]">Edit</button> : null}
        </div>

        {!isEditingAccount? (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div><div className="text- uppercase tracking-[0.15em] text-[#6B7280]">Full Name</div><div className="mt-1 text-sm font-bold tracking-[0.05em] text-[#E8E8E8]">{fullName || "Not set"}</div></div>
            <div><div className="text- uppercase tracking-[0.15em] text-[#6B7280]">Email // ID</div><div className="mt-1 text-sm font-bold tracking-[0.05em] text-[#E8E8E8]">{email || "Not set"}</div></div>
            <div><div className="text- uppercase tracking-[0.15em] text-[#6B7280]">Phone Number</div><div className="mt-1 text-sm font-bold tracking-[0.05em] text-[#E8E8E8]">{phoneNumber || "Not set"}</div></div>
            <div><div className="text- uppercase tracking-[0.15em] text-[#6B7280]">Address</div><div className="mt-1 text-sm font-bold tracking-[0.05em] text-[#E8E8E8]">{address || "Not set"}</div></div>
            <div><div className="text- uppercase tracking-[0.15em] text-[#6B7280]">City</div><div className="mt-1 text-sm font-bold tracking-[0.05em] text-[#E8E8E8]">{city || "Not set"}</div></div>
            <div><div className="text- uppercase tracking-[0.15em] text-[#6B7280]">State</div><div className="mt-1 text-sm font-bold tracking-[0.05em] text-[#E8E8E8]">{state || "Not set"}</div></div>
            <div><div className="text- uppercase tracking-[0.15em] text-[#6B7280]">ZIP Code</div><div className="mt-1 text-sm font-bold tracking-[0.05em] text-[#E8E8E8]">{zipCode || "Not set"}</div></div>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5"><label className="text- font-black uppercase tracking-[0.15em] text-[#A0A0A0]">Full Name</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2.5 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" placeholder="JOHN DOE" /></div>
              <div className="grid gap-1.5"><label className="text- font-black uppercase tracking-[0.15em] text-[#A0A0A0]">Email</label><input type="email" value={email} disabled className="w-full border border-[#2A2A2A] bg-[#0F0F0F]/50 px-3 py-2.5 text-sm text-[#6B7280]" /><div className="text- uppercase text-[#555]">Email cannot be changed</div></div>
              <div className="grid gap-1.5"><label className="text- font-black uppercase tracking-[0.15em] text-[#A0A0A0]">Phone Number</label><input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2.5 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" placeholder="555-123-4567" /></div>
              <div className="grid gap-1.5 md:col-span-2"><label className="text- font-black uppercase tracking-[0.15em] text-[#A0A0A0]">Street Address</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2.5 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" placeholder="123 MAIN ST" /></div>
              <div className="grid gap-1.5"><label className="text- font-black uppercase tracking-[0.15em] text-[#A0A0A0]">City</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2.5 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" placeholder="ANNISTON" /></div>
              <div className="grid gap-1.5"><label className="text- font-black uppercase tracking-[0.15em] text-[#A0A0A0]">State</label><input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2.5 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" placeholder="AL" /></div>
              <div className="grid gap-1.5"><label className="text- font-black uppercase tracking-[0.15em] text-[#A0A0A0]">ZIP Code</label><input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2.5 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" placeholder="36206" /></div>
            </div>
            <div className="mt-6 flex items-center gap-3"><button onClick={saveAccountInfo} className="bg-[#4B5320] px-5 py-2.5 text- font-black uppercase tracking-[0.15em] text-white hover:bg-[#5A6330]">Save Changes // Execute</button><button onClick={() => { setIsEditingAccount(false); load(); }} className="border border-[#2A2A2A] bg-[#0F0F0F] px-5 py-2.5 text- font-black uppercase tracking-[0.15em] text-[#A0A0A0] hover:text-[#E8E8E8]">Cancel</button></div>
          </>
        )}
      </section>

      <section className="border border-[#2A2A2A] bg-[#1A1A1A] p-6">
        <h2 className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Subscription // Loadout Status</h2>
        <div className="mt-4">
          {proLoaded? (
            isPro? (
              <div className="border border-[#4B5320] bg-[#0F0F0F] p-4 flex items-center justify-between gap-4">
                <div><div className="text-sm font-black uppercase tracking-[0.1em] text-[#E8E8E8]">ClaimCompass Pro // Active</div><div className="mt-1 text- uppercase tracking-[0.1em] text-[#4B5320]">Active Subscription // Operator Tier</div></div>
                <button onClick={() => setShowCancelModal(true)} className="border border-red-900/40 bg-[#1A0F0F] px-4 py-2 text- font-black uppercase tracking-[0.1em] text-red-400 hover:bg-red-900/20">Cancel Subscription</button>
              </div>
            ) : (
              <div className="border border-[#2A2A2A] bg-[#0F0F0F] p-4 flex items-center justify-between gap-4">
                <div><div className="text-sm font-black uppercase tracking-[0.1em] text-[#E8E8E8]">Free Plan // Basic Loadout</div><div className="mt-1 text- uppercase tracking-[0.1em] text-[#6B7280]">Basic Features Included</div></div>
                <button onClick={() => router.push("/pricing")} className="bg-[#E8E8E8] px-4 py-2 text- font-black uppercase tracking-[0.1em] text-[#0F0F0F] hover:bg-white">Upgrade To Pro</button>
              </div>
            )
          ) : (<div className="text- uppercase tracking-[0.15em] text-[#6B7280]">Loading Subscription...</div>)}
        </div>
      </section>

      <section className="border border-[#2A2A2A] bg-[#1A1A1A] p-6">
        <h2 className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Email Reminders // Comms Check</h2>
        <p className="mt-1 text- uppercase tracking-[0.1em] text-[#6B7280]">Get Daily Email Reminders To Log Symptoms</p>
        <div className="mt-4 grid gap-4">
          <label className="flex items-center gap-3"><input type="checkbox" checked={emailRemindersEnabled} onChange={(e) => setEmailRemindersEnabled(e.target.checked)} className="h-4 w-4 border-[#2A2A2A] bg-[#0F0F0F] accent-[#4B5320]" /><span className="text- font-black uppercase tracking-[0.1em] text-[#E8E8E8]">Enable Email Reminders</span></label>
          {emailRemindersEnabled && (
            <>
              <div className="grid gap-1.5"><label className="text- font-black uppercase tracking-[0.15em] text-[#A0A0A0]">Your Time Zone</label><select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2.5 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]">{timezones.map((tz) => (<option key={tz.value} value={tz.value}>{tz.label}</option>))}</select></div>
              <div className="grid gap-1.5"><label className="text- font-black uppercase tracking-[0.15em] text-[#A0A0A0]">Reminder Time (Local)</label><input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2.5 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" /></div>
              <div className="grid gap-1.5"><label className="text- font-black uppercase tracking-[0.15em] text-[#A0A0A0]">Frequency</label><select value={reminderDays} onChange={(e) => setReminderDays(e.target.value)} className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2.5 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]"><option value="daily">Every day</option><option value="weekdays">Weekdays only</option><option value="weekends">Weekends only</option></select></div>
            </>
          )}
        </div>
        <div className="mt-4 flex items-center gap-3"><button onClick={saveReminderSettings} className="bg-[#E8E8E8] px-5 py-2.5 text- font-black uppercase tracking-[0.15em] text-[#0F0F0F] hover:bg-white">Save Reminder Settings</button></div>
        {emailRemindersEnabled && <div className="mt-4 border border-[#2A2A2A] bg-[#0F0F0F] p-3 text- uppercase tracking-[0.05em] text-[#A0A0A0]"><strong className="text-[#4B5320]">Note:</strong> Email reminders will be sent to {email}. Check spam if not seen.</div>}
      </section>

      {status && <div className="border border-[#2A2A2A] bg-[#0F0F0F] px-4 py-3 text- font-black uppercase tracking-[0.1em] text-[#E8C87A]">{status}</div>}
      <CancelModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} onConfirmCancel={handleCancelSubscription} />
    </div>
  );
}