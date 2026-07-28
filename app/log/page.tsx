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
  logged_at: string;
  created_at: string;
  mood_level: number | null;
  mood_notes: string | null;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const MOOD_LABELS: Record<number, { label: string }> = {
  1: { label: "TERRIBLE" },
  2: { label: "VERY BAD" },
  3: { label: "BAD" },
  4: { label: "POOR" },
  5: { label: "NEUTRAL" },
  6: { label: "OKAY" },
  7: { label: "GOOD" },
  8: { label: "VERY GOOD" },
  9: { label: "GREAT" },
  10: { label: "EXCELLENT" },
};

export default function LogPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [condition, setCondition] = useState("");
  const [severity, setSeverity] = useState(5);
  const [affectedWork, setAffectedWork] = useState(false);
  const [notes, setNotes] = useState("");
  const [loggedAt, setLoggedAt] = useState(todayISO());
  const [moodLevel, setMoodLevel] = useState<number | null>(5);
  const [moodNotes, setMoodNotes] = useState("");
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCondition, setEditCondition] = useState("");
  const [editSeverity, setEditSeverity] = useState(5);
  const [editAffectedWork, setEditAffectedWork] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editLoggedAt, setEditLoggedAt] = useState(todayISO());
  const [editMoodLevel, setEditMoodLevel] = useState<number | null>(5);
  const [editMoodNotes, setEditMoodNotes] = useState("");
  const isEditing = useMemo(() => editingId!== null, [editingId]);

  const requireSession = async () => {
    const { data: sessionData, error } = await supabase.auth.getSession();
    if (error) { setStatus("Session error: " + error.message); return null; }
    if (!sessionData.session) { router.replace("/login"); return null; }
    return sessionData.session;
  };

  const loadLogs = async () => {
    setStatus("");
    const session = await requireSession();
    if (!session) return;
    const { data, error } = await supabase.from("symptom_logs").select("*").order("logged_at", { ascending: false }).order("created_at", { ascending: false }).limit(50);
    if (error) setStatus("Load error: " + error.message);
    else setLogs((data?? []) as SymptomLog[]);
  };

  useEffect(() => { loadLogs(); }, []);

  const resetCreateForm = () => {
    setCondition(""); setSeverity(5); setAffectedWork(false); setNotes(""); setLoggedAt(todayISO()); setMoodLevel(5); setMoodNotes("");
  };

  const addLog = async () => {
    setStatus(""); setLoading(true);
    const session = await requireSession(); if (!session) { setLoading(false); return; }
    const c = condition.trim(); if (!c) { setLoading(false); setStatus("Condition is required."); return; }
    const { error } = await supabase.from("symptom_logs").insert({
      user_id: session.user.id, condition: c, severity, affected_work: affectedWork,
      notes: notes.trim()? notes.trim() : null, logged_at: loggedAt || todayISO(),
      mood_level: moodLevel, mood_notes: moodNotes.trim()? moodNotes.trim() : null,
    });
    setLoading(false);
    if (error) return setStatus("Insert error: " + error.message);
    setStatus("SAVED TO LOCKER"); resetCreateForm(); await loadLogs();
  };

  const startEdit = (l: SymptomLog) => {
    setStatus(""); setEditingId(l.id); setEditCondition(l.condition?? ""); setEditSeverity(l.severity?? 5);
    setEditAffectedWork(!!l.affected_work); setEditNotes(l.notes?? ""); setEditLoggedAt(l.logged_at?? todayISO());
    setEditMoodLevel(l.mood_level); setEditMoodNotes(l.mood_notes?? "");
  };
  const cancelEdit = () => { setEditingId(null); setEditCondition(""); setEditSeverity(5); setEditAffectedWork(false); setEditNotes(""); setEditLoggedAt(todayISO()); setEditMoodLevel(5); setEditMoodNotes(""); };
  const saveEdit = async () => {
    if (!editingId) return; setStatus(""); setLoading(true);
    const session = await requireSession(); if (!session) { setLoading(false); return; }
    const c = editCondition.trim(); if (!c) { setLoading(false); setStatus("Condition is required."); return; }
    const { error } = await supabase.from("symptom_logs").update({
      condition: c, severity: editSeverity, affected_work: editAffectedWork,
      notes: editNotes.trim()? editNotes.trim() : null, logged_at: editLoggedAt || todayISO(),
      mood_level: editMoodLevel, mood_notes: editMoodNotes.trim()? editMoodNotes.trim() : null,
    }).eq("id", editingId);
    setLoading(false); if (error) return setStatus("Update error: " + error.message);
    setStatus("UPDATED"); cancelEdit(); await loadLogs();
  };
  const deleteLog = async (l: SymptomLog) => {
    setStatus(""); const ok = window.confirm(`Delete entry for "${l.condition}" on ${l.logged_at}?`); if (!ok) return;
    setLoading(true); const session = await requireSession(); if (!session) { setLoading(false); return; }
    const { error } = await supabase.from("symptom_logs").delete().eq("id", l.id);
    setLoading(false); if (error) return setStatus("Delete error: " + error.message);
    if (editingId === l.id) cancelEdit(); setStatus("DELETED"); await loadLogs();
  };

  const getMoodDisplay = (level: number | null) => {
    if (!level) return "NOT SET";
    return MOOD_LABELS[level]?.label?? `LEVEL ${level}`;
  };

  return (
    <div className="grid gap-6">
      <div className="border-b border-[#2A2A2A] pb-6">
        <div className="text- font-black tracking-[0.3em] text-[#4B5320] uppercase mb-2">Field Operations // Daily Log</div>
        <h1 className="text-3xl font-black tracking-[0.1em] uppercase text-[#E8E8E8]">Field Log</h1>
        <p className="mt-2 text-xs tracking-[0.1em] uppercase text-[#6B7280]">Log symptoms consistently to build stronger evidence.</p>
      </div>

      {/* CREATE */}
      <section className="border border-[#2A2A2A] bg-[#1A1A1A] p-6">
        <div className="flex justify-between">
          <div>
            <h2 className="text- font-black tracking-[0.2em] uppercase text-[#E8E8E8]">New Field Entry</h2>
            <p className="text- tracking-[0.15em] uppercase text-[#6B7280] mt-1">Log what happened today</p>
          </div>
          <div className="text- tracking-[0.15em] text-[#4B5320] border border-[#4B5320] px-2 py-1 h-fit">SECURE // ENCRYPTED</div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Condition // Required</span>
            <input className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="MIGRAINE, LOWER BACK..." />
          </label>
          <label className="grid gap-2">
            <span className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Date</span>
            <input type="date" className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" value={loggedAt} onChange={(e) => setLoggedAt(e.target.value)} />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Severity // {severity}/10</span>
            <input type="range" min={1} max={10} value={severity} onChange={(e) => setSeverity(Number(e.target.value))} className="w-full accent-[#4B5320]" />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Mood Level // {moodLevel? getMoodDisplay(moodLevel) : "NOT SET"}</span>
            <input type="range" min={1} max={10} value={moodLevel?? 5} onChange={(e) => setMoodLevel(Number(e.target.value))} className="w-full accent-[#4B5320]" />
          </label>

          <label className="flex items-center gap-3 md:col-span-2 border border-[#2A2A2A] bg-[#0F0F0F] p-3">
            <input type="checkbox" checked={affectedWork} onChange={(e) => setAffectedWork(e.target.checked)} className="accent-[#4B5320]" />
            <span className="text- font-black tracking-[0.15em] uppercase text-[#A0A0A0]">Affected Work / Function Today</span>
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Symptom Notes // Optional</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What happened? Impact?" className="min-h- w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Mood Notes // Optional</span>
            <textarea value={moodNotes} onChange={(e) => setMoodNotes(e.target.value)} placeholder="Triggers, positive moments..." className="min-h- w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={addLog} disabled={loading || condition.trim().length === 0} className="bg-[#4B5320] px-6 py-3 text- font-black tracking-[0.15em] uppercase text-white hover:bg-[#5A6330] disabled:opacity-50">
            {loading? "SAVING..." : "Save Entry"}
          </button>
          {status? <div className="border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text- font-black tracking-[0.1em] uppercase text-[#4B5320]">{status}</div> : null}
        </div>
      </section>

      {/* LIST */}
      <section className="border border-[#2A2A2A] bg-[#1A1A1A]">
        <div className="flex items-end justify-between gap-4 border-b border-[#2A2A2A] p-6">
          <div>
            <h2 className="text- font-black tracking-[0.2em] uppercase text-[#E8E8E8]">Recent Entries</h2>
            <p className="mt-1 text- tracking-[0.15em] uppercase text-[#6B7280]">Edit or delete anytime</p>
          </div>
          <button onClick={loadLogs} disabled={loading} className="border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text- font-black tracking-[0.15em] uppercase text-[#A0A0A0] hover:text-[#E8E8E8]">Refresh</button>
        </div>

        <div className="divide-y divide-[#2A2A2A]">
          {logs.length === 0? (
            <div className="p-6 text- text-[#6B7280]">No entries yet. Add your first log above.</div>
          ) : (
            logs.map((l) => {
              const editingThis = editingId === l.id;
              return (
                <div key={l.id} className="p-6 bg-[#121212]">
                  {!editingThis? (
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text- font-black tracking-[0.1em] uppercase text-[#E8E8E8]">{l.condition}</div>
                        <div className="mt-1 text- tracking-[0.1em] text-[#6B7280]">{l.logged_at} • SEV {l.severity}/10 • WORK: {l.affected_work? "YES" : "NO"} {l.mood_level? `• MOOD: ${getMoodDisplay(l.mood_level)}` : ""}</div>
                        {l.notes? <div className="mt-2 text- text-[#A0A0A0] whitespace-pre-wrap">{l.notes}</div> : null}
                        {l.mood_notes? <div className="mt-2 text- text-[#6B7280] whitespace-pre-wrap">MOOD: {l.mood_notes}</div> : null}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(l)} className="border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text- font-black tracking-[0.15em] uppercase text-[#A0A0A0] hover:text-white">Edit</button>
                        <button onClick={() => deleteLog(l)} disabled={loading} className="border border-[#5A1A1A] bg-[#0F0F0F] px-3 py-2 text- font-black tracking-[0.15em] uppercase text-[#E06B6B] hover:bg-[#1A0F0F]">Delete</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between"><div className="text- font-black tracking-[0.15em] uppercase text-[#E8E8E8]">Edit Entry</div><button onClick={cancelEdit} className="border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-1 text- uppercase text-[#A0A0A0]">Cancel</button></div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <label className="grid gap-2"><span className="text- uppercase text-[#A0A0A0]">Condition</span><input className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text-sm text-white" value={editCondition} onChange={(e) => setEditCondition(e.target.value)} /></label>
                        <label className="grid gap-2"><span className="text- uppercase text-[#A0A0A0]">Date</span><input type="date" className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text-sm text-white" value={editLoggedAt} onChange={(e) => setEditLoggedAt(e.target.value)} /></label>
                        <label className="grid gap-2 md:col-span-2"><span className="text- uppercase text-[#A0A0A0]">Severity: {editSeverity}</span><input type="range" min={1} max={10} value={editSeverity} onChange={(e) => setEditSeverity(Number(e.target.value))} className="w-full accent-[#4B5320]" /></label>
                        <label className="grid gap-2 md:col-span-2"><span className="text- uppercase text-[#A0A0A0]">Mood: {editMoodLevel? getMoodDisplay(editMoodLevel) : "NOT SET"}</span><input type="range" min={1} max={10} value={editMoodLevel?? 5} onChange={(e) => setEditMoodLevel(Number(e.target.value))} className="w-full accent-[#4B5320]" /></label>
                        <label className="flex items-center gap-2 md:col-span-2"><input type="checkbox" checked={editAffectedWork} onChange={(e) => setEditAffectedWork(e.target.checked)} /><span className="text-xs text-[#A0A0A0]">Affected work</span></label>
                        <label className="grid gap-2 md:col-span-2"><span className="text- uppercase text-[#A0A0A0]">Notes</span><textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="min-h- w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text-sm text-white" /></label>
                        <label className="grid gap-2 md:col-span-2"><span className="text- uppercase text-[#A0A0A0]">Mood notes</span><textarea value={editMoodNotes} onChange={(e) => setEditMoodNotes(e.target.value)} className="min-h- w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text-sm text-white" /></label>
                      </div>
                      <div className="mt-4 flex gap-2"><button onClick={saveEdit} disabled={loading} className="bg-[#4B5320] px-4 py-2 text-xs font-black uppercase text-white">Save Changes</button><button onClick={() => deleteLog(l)} className="border border-[#5A1A1A] px-4 py-2 text-xs uppercase text-[#E06B6B]">Delete</button></div>
                    </div>
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