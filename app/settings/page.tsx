"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type ProfileSettings = {
  email_reminders_enabled: boolean;
  reminder_time: string;
  reminder_days: string;
};

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const [email, setEmail] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("18:00");
  const [reminderDays, setReminderDays] = useState("daily");

  const requireSession = async () => {
    const { data: sessionData, error } = await supabase.auth.getSession();
    if (error) {
      setStatus("Session error: " + error.message);
      return null;
    }
    if (!sessionData.session) {
      router.replace("/login");
      return null;
    }
    return sessionData.session;
  };

  const loadSettings = async () => {
    setStatus("");
    setLoading(true);

    const session = await requireSession();
    if (!session) {
      setLoading(false);
      return;
    }

    setEmail(session.user.email ?? "");

    const { data, error } = await supabase
      .from("profiles")
      .select("email_reminders_enabled, reminder_time, reminder_days")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error) {
      setStatus("❌ Load error: " + error.message);
      setLoading(false);
      return;
    }

    if (data) {
      const settings = data as ProfileSettings;
      setRemindersEnabled(settings.email_reminders_enabled ?? false);
      setReminderTime(settings.reminder_time ?? "18:00");
      setReminderDays(settings.reminder_days ?? "daily");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSettings = async () => {
    setStatus("");
    setSaving(true);

    const session = await requireSession();
    if (!session) {
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        email_reminders_enabled: remindersEnabled,
        reminder_time: reminderTime,
        reminder_days: reminderDays,
      })
      .eq("user_id", session.user.id);

    setSaving(false);

    if (error) {
      setStatus("❌ Save failed: " + error.message);
      return;
    }

    setStatus("✅ Settings saved!");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-sm text-zinc-600">Loading settings…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Manage your account preferences and email reminders.
        </p>
      </div>

      {/* Account info */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">Account</h2>
        <div className="mt-4 grid gap-2 text-sm">
          <div>
            <span className="text-zinc-500">Email: </span>
            <span className="font-medium">{email}</span>
          </div>
        </div>
      </section>

      {/* Email reminders */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">Email Reminders</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Get daily reminders to log your symptoms and stay consistent.
        </p>

        <div className="mt-6 grid gap-6">
          {/* Enable/disable toggle */}
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-sm text-zinc-900">
                Send me daily email reminders
              </div>
              <div className="mt-1 text-sm text-zinc-600">
                We'll send a friendly reminder to {email} to help you stay on track.
              </div>
            </div>
          </label>

          {/* Time picker */}
          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">Reminder time</span>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              disabled={!remindersEnabled}
              className="w-full max-w-xs rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-500"
            />
            <div className="text-xs text-zinc-500">
              What time should we send the reminder? (Your local time)
            </div>
          </label>

          {/* Frequency picker */}
          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">Frequency</span>
            <select
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
              disabled={!remindersEnabled}
              className="w-full max-w-xs rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-500"
            >
              <option value="daily">Every day</option>
              <option value="weekdays">Weekdays only (Mon-Fri)</option>
              <option value="weekends">Weekends only (Sat-Sun)</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save settings"}
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
        </div>

        {remindersEnabled ? (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <div className="font-semibold">✉️ Reminder scheduled</div>
            <div className="mt-1">
              You'll receive an email at {reminderTime} {reminderDays === "daily" ? "every day" : reminderDays === "weekdays" ? "on weekdays" : "on weekends"}.
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
            Email reminders are currently disabled. Enable them above to get daily notifications.
          </div>
        )}
      </section>

      {/* Info box */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="font-semibold">Note about email reminders</div>
        <div className="mt-1">
          Email reminders are currently in development. Once enabled, the reminder system will be activated when ClaimCompass launches. You can update these settings anytime.
        </div>
      </div>
    </div>
  );
}