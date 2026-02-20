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

  // Account info
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("");

  // Edit mode
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  const [isPro, setIsPro] = useState(false);
  const [proLoaded, setProLoaded] = useState(false);

  // Email reminder settings
  const [emailRemindersEnabled, setEmailRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("18:00");
  const [reminderDays, setReminderDays] = useState("daily");

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);

  const load = async () => {
    setStatus("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (sessionError || !session) {
      router.replace("/login");
      return;
    }

    const meta = (session.user.user_metadata ?? {}) as Record<string, any>;
    const autoName =
      (typeof meta.full_name === "string" && meta.full_name.trim()) ||
      (typeof meta.name === "string" && meta.name.trim()) ||
      "";

    setEmail(session.user.email ?? "");

    // Get Pro status
    const pro = await getProStatus();
    setIsPro(pro.isPro);
    setProLoaded(true);

    // Get profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (profile) {
      setFullName(profile.full_name || autoName);
      setPhoneNumber(profile.phone_number || "");
      setAddress(profile.address || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setZipCode(profile.zip_code || "");
      setEmailRemindersEnabled(profile.email_reminders_enabled ?? false);
      setReminderTime(profile.reminder_time ?? "18:00");
      setReminderDays(profile.reminder_days ?? "daily");
    } else {
      setFullName(autoName);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const saveAccountInfo = async () => {
    setStatus("");

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setStatus("❌ Not logged in");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        phone_number: phoneNumber.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        zip_code: zipCode.trim() || null,
      })
      .eq("user_id", sessionData.session.user.id);

    if (error) {
      setStatus("❌ Failed to save: " + error.message);
    } else {
      setStatus("✅ Account information updated!");
      setIsEditingAccount(false);
    }
  };

  const saveReminderSettings = async () => {
    setStatus("");

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setStatus("❌ Not logged in");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        email_reminders_enabled: emailRemindersEnabled,
        reminder_time: reminderTime,
        reminder_days: reminderDays,
      })
      .eq("user_id", sessionData.session.user.id);

    if (error) {
      setStatus("❌ Failed to save settings: " + error.message);
    } else {
      setStatus("✅ Reminder settings saved!");
    }
  };

  const handleCancelSubscription = async () => {
    setStatus("");

    // TODO: Add Stripe cancellation API call here
    // For now, just show a message
    setShowCancelModal(false);
    setStatus("❌ Subscription cancellation coming soon. Please contact support.");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-sm text-zinc-600">Loading account…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl grid gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Account Settings</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Manage your account, subscription, and preferences.
        </p>
      </div>

      {/* Account Info */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Account Information</h2>
          {!isEditingAccount ? (
            <button
              onClick={() => setIsEditingAccount(true)}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Edit
            </button>
          ) : null}
        </div>

        {!isEditingAccount ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-zinc-700">Full Name</div>
              <div className="mt-1 text-sm text-zinc-900">{fullName || "Not set"}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-700">Email</div>
              <div className="mt-1 text-sm text-zinc-900">{email || "Not set"}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-700">Phone Number</div>
              <div className="mt-1 text-sm text-zinc-900">{phoneNumber || "Not set"}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-700">Address</div>
              <div className="mt-1 text-sm text-zinc-900">{address || "Not set"}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-700">City</div>
              <div className="mt-1 text-sm text-zinc-900">{city || "Not set"}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-700">State</div>
              <div className="mt-1 text-sm text-zinc-900">{state || "Not set"}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-700">ZIP Code</div>
              <div className="mt-1 text-sm text-zinc-900">{zipCode || "Not set"}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="grid gap-1">
                <label className="text-xs font-medium text-zinc-700">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-medium text-zinc-700">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 outline-none"
                />
                <div className="text-xs text-zinc-500">Email cannot be changed</div>
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-medium text-zinc-700">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="grid gap-1 md:col-span-2">
                <label className="text-xs font-medium text-zinc-700">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-medium text-zinc-700">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                  placeholder="New York"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-medium text-zinc-700">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                  placeholder="NY"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-medium text-zinc-700">ZIP Code</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                  placeholder="10001"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={saveAccountInfo}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditingAccount(false);
                  load();
                }}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </section>

      {/* Subscription */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">Subscription</h2>
        
        <div className="mt-4">
          {proLoaded ? (
            isPro ? (
              <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-emerald-900">ClaimCompass Pro</div>
                    <div className="mt-1 text-sm text-emerald-800">
                      $12/month • Active
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-zinc-900">Free Plan</div>
                    <div className="mt-1 text-sm text-zinc-600">
                      Basic features included
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/pricing")}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="text-sm text-zinc-500">Loading subscription…</div>
          )}
        </div>
      </section>

      {/* Email Reminders */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">Email Reminders</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Get daily email reminders to log your symptoms.
        </p>

        <div className="mt-4 grid gap-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={emailRemindersEnabled}
              onChange={(e) => setEmailRemindersEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <span className="text-sm font-medium text-zinc-900">
              Enable email reminders
            </span>
          </label>

          {emailRemindersEnabled && (
            <>
              <div className="grid gap-1">
                <label className="text-xs font-medium text-zinc-700">
                  Reminder time (your local time)
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-medium text-zinc-700">
                  Frequency
                </label>
                <select
                  value={reminderDays}
                  onChange={(e) => setReminderDays(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                >
                  <option value="daily">Every day</option>
                  <option value="weekdays">Weekdays only</option>
                  <option value="weekends">Weekends only</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={saveReminderSettings}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Save Reminder Settings
          </button>
        </div>

        {emailRemindersEnabled && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            <strong>Note:</strong> Email reminders will be sent to {email}. Make sure to check your
            spam folder if you don't see them in your inbox.
          </div>
        )}
      </section>

      {status && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            status.startsWith("❌")
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {status}
        </div>
      )}

      {/* Cancel Modal */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirmCancel={handleCancelSubscription}
      />
    </div>
  );
}