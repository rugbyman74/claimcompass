"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { getProStatus } from "@/lib/pro";

type EvidenceFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: string;
  notes: string | null;
  created_at: string;
};

const MAX_BYTES = 10 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf","image/jpeg","image/png","image/jpg",
  "application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","text/plain",
]);

const CATEGORIES = ["Medical Records","DBQ / Nexus Letter","C&P Exam","Buddy Letter","VA Decision Letter","Correspondence","Other"] as const;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb/1024).toFixed(1)} MB`;
}
function safeName(name: string) { return name.replace(/[^\w.\-() ]+/g, "_").replace(/\s+/g, " ").trim(); }

export default function VaultPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState("");
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [proLoaded, setProLoaded] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Medical Records");
  const [notes, setNotes] = useState("");
  const [picked, setPicked] = useState<File | null>(null);

  const requireSession = async () => {
    const { data: sessionData, error } = await supabase.auth.getSession();
    if (error) { setStatus("Session error: " + error.message); return null; }
    if (!sessionData.session) { router.replace("/login"); return null; }
    return sessionData.session;
  };

  const loadFiles = async () => {
    setStatus("");
    const session = await requireSession(); if (!session) return;
    const { data, error } = await supabase.from("evidence_files").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) setStatus("Load error: " + error.message);
    else setFiles((data?? []) as EvidenceFile[]);
  };

  useEffect(() => {
    const init = async () => { await loadFiles(); const res = await getProStatus(); setIsPro(res.isPro); setProLoaded(true); };
    init();
  }, []);

  const handlePick = (f: File | null) => {
    setStatus(""); if (!f) { setPicked(null); return; }
    const ext = f.name.split(".").pop()?.toLowerCase();
    const allowedExts = new Set(["pdf","jpg","jpeg","png","doc","docx","txt"]);
    if (!ALLOWED_TYPES.has(f.type) &&!allowedExts.has(ext?? "")) { setPicked(null); setStatus("Only PDF, JPG, PNG, DOC, DOCX, or TXT allowed."); return; }
    if (f.size > MAX_BYTES) { setPicked(null); setStatus("File too large. Max 10MB."); return; }
    setPicked(f);
  };

  const upload = async () => {
    setStatus("");
    if (!isPro) { setStatus("Pro required to upload."); return; }
    if (!picked) { setStatus("Choose a file first."); return; }
    setLoading(true);
    const session = await requireSession(); if (!session) { setLoading(false); return; }
    const userId = session.user.id;
    const clean = safeName(picked.name);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const path = `${userId}/${timestamp}-${clean}`;
    const { error: uploadError } = await supabase.storage.from("evidence").upload(path, picked, { contentType: picked.type, upsert: false });
    if (uploadError) { setLoading(false); return setStatus("Upload failed: " + uploadError.message); }
    const { error: dbError } = await supabase.from("evidence_files").insert({
      user_id: userId, file_name: clean, file_path: path, file_size: picked.size, file_type: picked.type, category, notes: notes.trim()? notes.trim() : null,
    });
    setLoading(false);
    if (dbError) { await supabase.storage.from("evidence").remove([path]); return setStatus("Metadata save failed: " + dbError.message); }
    setPicked(null); setNotes(""); setCategory("Medical Records"); if (fileRef.current) fileRef.current.value = "";
    setStatus("UPLOADED TO VAULT"); await loadFiles();
  };

  const download = async (f: EvidenceFile) => {
    setStatus("");
    const { data, error } = await supabase.storage.from("evidence").createSignedUrl(f.file_path, 60);
    if (error) return setStatus("Download failed: " + error.message);
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const remove = async (f: EvidenceFile) => {
    setStatus(""); const ok = window.confirm(`Delete "${f.file_name}"?`); if (!ok) return;
    setLoading(true);
    const { error: storageError } = await supabase.storage.from("evidence").remove([f.file_path]);
    if (storageError) { setLoading(false); return setStatus("Delete failed: " + storageError.message); }
    const { error: dbError } = await supabase.from("evidence_files").delete().eq("id", f.id);
    setLoading(false);
    if (dbError) return setStatus("Delete metadata failed: " + dbError.message);
    setStatus("DELETED"); await loadFiles();
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <div className="text- font-black tracking-[0.3em] text-[#4B5320] uppercase mb-2">Storage // Vault V1 // Encrypted</div>
          <h1 className="text-3xl font-black tracking-[0.1em] uppercase text-[#E8E8E8]">Evidence Vault</h1>
          <p className="mt-2 text-xs tracking-[0.1em] uppercase text-[#6B7280]">Secure document storage // PDF, JPG, PNG, DOC, TXT — Max 10MB</p>
        </div>
        <div className="text-sm">
          {proLoaded? isPro? <span className="border border-[#4B5320] bg-[#1A1A1A] px-3 py-1 text- font-black tracking-[0.15em] uppercase text-[#4B5320]">Pro Enabled // Active</span> : <Link href="/pricing" className="border border-[#E8E8E8] bg-[#E8E8E8] px-3 py-1 text- font-black uppercase text-[#0F0F0F]">Upgrade to Pro</Link> : <span className="text-[#6B7280] text-xs">Checking plan…</span>}
        </div>
      </div>

      <section className="border border-[#2A2A2A] bg-[#1A1A1A] p-6">
        {!isPro? (
          <div className="border border-[#5A4A1A] bg-[#1A160F] p-4 text-sm">
            <div className="text- font-black tracking-[0.2em] uppercase text-[#E8C87A]">Pro Required // Vault Locked</div>
            <div className="mt-2 text- text-[#A0A0A0]">Uploading documents is a Pro feature. You can still view, download, delete existing files.</div>
            <div className="mt-3"><Link href="/pricing" className="inline-flex border border-[#4B5320] bg-[#4B5320] px-4 py-2 text- font-black uppercase tracking-[0.15em] text-white">View Pricing</Link></div>
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2"><span className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Category</span><select className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" value={category} onChange={(e) => setCategory(e.target.value as any)} disabled={!isPro}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
          <label className="grid gap-2"><span className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">Notes // Optional</span><input className="w-full border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 text-sm text-[#E8E8E8] outline-none focus:border-[#4B5320]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="MRI RESULTS, 2024-09-12" disabled={!isPro} /></label>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="text- font-black tracking-[0.2em] uppercase text-[#A0A0A0]">File // Secure Upload</div>
          <input ref={fileRef} type="file" onChange={(e) => handlePick(e.target.files?.[0]?? null)} className="hidden" id="vault-file" disabled={!isPro} />
          <label htmlFor="vault-file" className={`inline-flex w-fit border px-4 py-3 text- font-black tracking-[0.15em] uppercase ${isPro? "cursor-pointer border-[#2A2A2A] bg-[#0F0F0F] text-[#E8E8E8] hover:border-[#4B5320]" : "border-[#2A2A2A] bg-[#121212] text-[#555] cursor-not-allowed"}`}>Choose File</label>
          <div className="text- tracking-[0.1em] uppercase text-[#6B7280]">Allowed: PDF, JPG, PNG, DOC, DOCX, TXT. Max 10MB.</div>
          {picked? <div className="text- text-[#E8E8E8]">Selected: <span className="font-black text-[#4B5320]">{picked.name}</span> ({formatBytes(picked.size)})</div> : <div className="text- text-[#6B7280] uppercase">No file selected</div>}
          <div className="flex gap-3">
            <button onClick={upload} disabled={loading ||!picked ||!isPro} className="bg-[#4B5320] px-6 py-3 text- font-black tracking-[0.15em] uppercase text-white hover:bg-[#5A6330] disabled:opacity-50">{loading? "Working..." : "Upload To Vault"}</button>
            {status? <div className="border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text- font-black uppercase text-[#4B5320]">{status}</div> : null}
          </div>
        </div>
      </section>

      <section className="border border-[#2A2A2A] bg-[#1A1A1A]">
        <div className="border-b border-[#2A2A2A] p-6">
          <h2 className="text- font-black tracking-[0.2em] uppercase text-[#E8E8E8]">Your Documents</h2>
          <p className="mt-1 text- tracking-[0.15em] uppercase text-[#6B7280]">Files are private // Downloads use signed links</p>
        </div>
        <div className="divide-y divide-[#2A2A2A]">
          {files.length === 0? <div className="p-6 text- text-[#6B7280]">No documents yet.</div> : files.map((f) => (
            <div key={f.id} className="p-6 bg-[#121212] flex flex-wrap justify-between gap-3">
              <div>
                <div className="text- font-black tracking-[0.1em] uppercase text-[#E8E8E8]">{f.file_name}</div>
                <div className="mt-1 text- tracking-[0.1em] text-[#6B7280]">{f.category} • {formatBytes(f.file_size)} • {new Date(f.created_at).toLocaleString()}</div>
                {f.notes? <div className="mt-2 text- text-[#A0A0A0]">{f.notes}</div> : null}
              </div>
              <div className="flex gap-2 h-fit">
                <button onClick={() => download(f)} className="border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text- font-black uppercase text-[#E8E8E8] hover:border-[#4B5320]">Download</button>
                <button onClick={() => remove(f)} disabled={loading} className="border border-[#5A1A1A] bg-[#0F0F0F] px-3 py-2 text- font-black uppercase text-[#E06B6B]">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}