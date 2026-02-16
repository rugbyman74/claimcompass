"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type SymptomLog = {
  id: string;
  user_id: string;
  condition: string;
  severity: number;
  affected_work: boolean;
  notes: string | null;
  logged_at: string; // YYYY-MM-DD
  created_at: string;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function LogPage() {
  const router = useRouter();

  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Create form
  const [condition, setCondition] = useState("");
  const [severity, setSeverity] = useState(5);
  const [affectedWork, setAffectedWork] = useState(false);
  const [notes, setNotes] = useState("");
  const [loggedAt, setLoggedAt] = useState(todayISO());

  // List + editing
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit form state (separate so create form doesn't get messy)
  const [editCondition, setEditCondition] = useState("");
  const [editSeverity, setEditSeverity] = useState(5);
  const [editAffectedWork, setEditAffectedWork] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editLoggedAt, setEditLoggedAt] = useState(todayISO());

  const isEditing = useMemo(() => editingId !== null, [editingId]);

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

  const loadLogs = async () => {
    setStatus("");

    const session = await requireSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("symptom_logs")
      .select("*")
      .order("logged_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) setStatus("Load error: " + error.message);
    else setLogs((data ?? []) as SymptomLog[]);
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetCreateForm = () => {
    setCondition("");
    setSeverity(5);
    setAffectedWork(false);
    setNotes("");
    setLoggedAt(todayISO());
  };

  const addLog = async () => {
    setStatus("");
    setLoading(true);

    const session = await requireSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const c = condition.trim();
    if (!c) {
      setLoading(false);
      setStatus("❌ Condition is required.");
      return;
    }

    const { error } = await supabase.from("symptom_logs").insert({
      user_id: session.user.id,
      condition: c,
      severity,
      affected_work: affectedWork,
      notes: notes.trim() ? notes.trim() : null,
      logged_at: loggedAt || todayISO(),
    });

    setLoading(false);

    if (error) return setStatus("Insert error: " + error.message);

    setStatus("✅ Saved!");
    resetCreateForm();
    await loadLogs();
  };

  const startEdit = (l: SymptomLog) => {
    setStatus("");
    setEditingId(l.id);
    setEditCondition(l.condition ?? "");
    setEditSeverity(l.severity ?? 5);
    setEditAffectedWork(!!l.affected_work);
    setEditNotes(l.notes ?? "");
    setEditLoggedAt(l.logged_at ?? todayISO());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCondition("");
    setEditSeverity(5);
    setEditAffectedWork(false);
    setEditNotes("");
    setEditLoggedAt(todayISO());
  };

  const saveEdit = async () => {
    if (!editingId) return;

    setStatus("");
    setLoading(true);

    const session = await requireSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const c = editCondition.trim();
    if (!c) {
      setLoading(false);
      setStatus("❌ Condition is required.");
      return;
    }

    const { error } = await supabase
      .from("symptom_logs")
      .update({
        condition: c,
        severity: editSeverity,
        affected_work: editAffectedWork,
        notes: editNotes.trim() ? editNotes.trim() : null,
        logged_at: editLoggedAt || todayISO(),
      })
      .eq("id", editingId);

    setLoading(false);

    if (error) return setStatus("Update error: " + error.message);

    setStatus("✅ Updated!");
    cancelEdit();
    await loadLogs();
  };

  const deleteLog = async (l: SymptomLog) => {
    setStatus("");

    const ok = window.confirm(`Delete this entry for "${l.condition}" on ${l.logged_at}?`);
    if (!ok) return;

    setLoading(true);

    const session = await requireSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("symptom_logs").delete().eq("id", l.id);

    setLoading(false);

    if (error) return setStatus("Delete error: " + error.message);

    // If they deleted the one they were editing, exit edit mode
    if (editingId === l.id) cancelEdit();

    setStatus("✅ Deleted.");
    await loadLogs();
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Daily Symptom Log</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Track symptoms consistently so you can generate stronger statements and evidence later.
        </p>
      </div>

      {/* Create new entry */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Add an entry</h2>
            <p className="mt-1 text-sm text-zinc-600">Log what happened today (or pick a date).</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">Condition</span>
            <input
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g., Migraines"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">Date</span>
            <input
              type="date"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
            />
          </label>

          <label className="grid gap-1 md:col-span-2">
            <span className="text-xs font-medium text-zinc-700">Severity (1–10): {severity}</span>
            <input
              type="range"
              min={1}
              max={10}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full"
            />
          </label>

          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={affectedWork}
              onChange={(e) => setAffectedWork(e.target.checked)}
            />
            <span className="text-sm text-zinc-700">Affected work/function today</span>
          </label>

          <label className="grid gap-1 md:col-span-2">
            <span className="text-xs font-medium text-zinc-700">Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What happened? How did it impact your day?"
              className="min-h-[110px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={addLog}
            disabled={loading || condition.trim().length === 0}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Entry"}
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

          {isEditing ? (
            <div className="text-xs text-zinc-500">
              You’re currently editing an entry below.
            </div>
          ) : null}
        </div>
      </section>

      {/* Recent entries */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Recent entries</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Edit or delete entries anytime.
            </p>
          </div>
          <button
            onClick={loadLogs}
            disabled={loading}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {logs.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-zinc-600">
              No entries yet. Add your first log above.
            </div>
          ) : (
            logs.map((l) => {
              const editingThis = editingId === l.id;

              return (
                <div key={l.id} className="rounded-xl border border-zinc-200 p-4">
                  {!editingThis ? (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold">{l.condition}</div>
                          <div className="mt-1 text-sm text-zinc-600">
                            {l.logged_at} • Severity {l.severity}/10 • Affected work:{" "}
                            {l.affected_work ? "Yes" : "No"}
                          </div>
                          {l.notes ? (
                            <div className="mt-2 text-sm text-zinc-700 whitespace-pre-wrap">
                              {l.notes}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(l)}
                            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteLog(l)}
                            disabled={loading}
                            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold">Edit entry</div>
                          <div className="mt-1 text-sm text-zinc-600">
                            Update the details and save.
                          </div>
                        </div>
                        <button
                          onClick={cancelEdit}
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <label className="grid gap-1">
                          <span className="text-xs font-medium text-zinc-700">Condition</span>
                          <input
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            value={editCondition}
                            onChange={(e) => setEditCondition(e.target.value)}
                          />
                        </label>

                        <label className="grid gap-1">
                          <span className="text-xs font-medium text-zinc-700">Date</span>
                          <input
                            type="date"
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            value={editLoggedAt}
                            onChange={(e) => setEditLoggedAt(e.target.value)}
                          />
                        </label>

                        <label className="grid gap-1 md:col-span-2">
                          <span className="text-xs font-medium text-zinc-700">
                            Severity (1–10): {editSeverity}
                          </span>
                          <input
                            type="range"
                            min={1}
                            max={10}
                            value={editSeverity}
                            onChange={(e) => setEditSeverity(Number(e.target.value))}
                            className="w-full"
                          />
                        </label>

                        <label className="flex items-center gap-2 md:col-span-2">
                          <input
                            type="checkbox"
                            checked={editAffectedWork}
                            onChange={(e) => setEditAffectedWork(e.target.checked)}
                          />
                          <span className="text-sm text-zinc-700">Affected work/function</span>
                        </label>

                        <label className="grid gap-1 md:col-span-2">
                          <span className="text-xs font-medium text-zinc-700">Notes (optional)</span>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="min-h-[110px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={loading || editCondition.trim().length === 0}
                          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                        >
                          {loading ? "Saving..." : "Save changes"}
                        </button>
                        <button
                          onClick={() => deleteLog(l)}
                          disabled={loading}
                          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete entry
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
