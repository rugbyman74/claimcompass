"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

const CATEGORIES = [
  "Medical Records",
  "DBQ / Nexus Letter",
  "C&P Exam",
  "Buddy Letter",
  "VA Decision Letter",
  "Correspondence",
  "Other",
] as const;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function safeName(name: string) {
  return name.replace(/[^\w.\-() ]+/g, "_").replace(/\s+/g, " ").trim();
}

export default function VaultPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [status, setStatus] = useState("");
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [loading, setLoading] = useState(false);

  const [isPro, setIsPro] = useState(false);
  const [proLoaded, setProLoaded] = useState(false);

  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("Medical Records");
  const [notes, setNotes] = useState("");
  const [picked, setPicked] = useState<File | null>(null);

  const acceptAttr = useMemo(() => "application/pdf,image/jpeg,image/png", []);

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

  const loadFiles = async () => {
    setStatus("");

    const session = await requireSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("evidence_files")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) setStatus("Load error: " + error.message);
    else setFiles((data ?? []) as EvidenceFile[]);
  };

  useEffect(() => {
    const init = async () => {
      await loadFiles();
      const res = await getProStatus();
      setIsPro(res.isPro);
      setProLoaded(true);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePick = (f: File | null) => {
    setStatus("");
    if (!f) {
      setPicked(null);
      return;
    }

    if (!ALLOWED_TYPES.has(f.type)) {
      setPicked(null);
      setStatus("❌ Only PDF, JPG, or PNG files are allowed.");
      return;
    }

    if (f.size > MAX_BYTES) {
      setPicked(null);
      setStatus("❌ File too large. Max is 10MB.");
      return;
    }

    setPicked(f);
  };

  const upload = async () => {
    setStatus("");

    if (!isPro) {
      setStatus("⭐ Pro required to upload to the Evidence Vault.");
      return;
    }

    if (!picked) {
      setStatus("❌ Choose a file first.");
      return;
    }

    setLoading(true);

    const session = await requireSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const userId = session.user.id;

    const clean = safeName(picked.name);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const path = `${userId}/${timestamp}-${clean}`;

    const { error: uploadError } = await supabase.storage
      .from("evidence")
      .upload(path, picked, {
        contentType: picked.type,
        upsert: false,
      });

    if (uploadError) {
      setLoading(false);
      return setStatus("❌ Upload failed: " + uploadError.message);
    }

    const { error: dbError } = await supabase.from("evidence_files").insert({
      user_id: userId,
      file_name: clean,
      file_path: path,
      file_size: picked.size,
      file_type: picked.type,
      category,
      notes: notes.trim() ? notes.trim() : null,
    });

    setLoading(false);

    if (dbError) {
      await supabase.storage.from("evidence").remove([path]);
      return setStatus("❌ Metadata save failed: " + dbError.message);
    }

    setPicked(null);
    setNotes("");
    setCategory("Medical Records");
    if (fileRef.current) fileRef.current.value = "";

    setStatus("✅ Uploaded.");
    await loadFiles();
  };

  const download = async (f: EvidenceFile) => {
    setStatus("");

    const { data, error } = await supabase.storage
      .from("evidence")
      .createSignedUrl(f.file_path, 60);

    if (error) return setStatus("❌ Download failed: " + error.message);

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const remove = async (f: EvidenceFile) => {
    setStatus("");

    const ok = window.confirm(`Delete "${f.file_name}"?`);
    if (!ok) return;

    setLoading(true);

    const { error: storageError } = await supabase.storage
      .from("evidence")
      .remove([f.file_path]);

    if (storageError) {
      setLoading(false);
      return setStatus("❌ Delete failed: " + storageError.message);
    }

    const { error: dbError } = await supabase
      .from("evidence_files")
      .delete()
      .eq("id", f.id);

    setLoading(false);

    if (dbError) return setStatus("❌ Delete metadata failed: " + dbError.message);

    setStatus("✅ Deleted.");
    await loadFiles();
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Evidence Vault</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Secure document storage (PDF/JPG/PNG, max 10MB).
          </p>
        </div>

        <div className="text-sm">
          {proLoaded ? (
            isPro ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                Pro enabled
              </span>
            ) : (
              <Link
                href="/pricing"
                className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Upgrade to Pro
              </Link>
            )
          ) : (
            <span className="text-zinc-500">Checking plan…</span>
          )}
        </div>
      </div>

      {/* Upload box */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        {!isPro ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="font-semibold">Pro required</div>
            <div className="mt-1">
              Uploading documents to the Evidence Vault is a Pro feature. You can still view, download,
              and delete your existing files.
            </div>
            <div className="mt-3">
              <Link
                href="/pricing"
                className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                View pricing
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">Category</span>
            <select
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              disabled={!isPro}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">Notes (optional)</span>
            <input
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., MRI results, 2024-09-12"
              disabled={!isPro}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="grid gap-2">
            <div className="text-xs font-medium text-zinc-700">File</div>

            <input
              ref={fileRef}
              type="file"
              accept={acceptAttr}
              onChange={(e) => handlePick(e.target.files?.[0] ?? null)}
              className="hidden"
              id="vault-file"
              disabled={!isPro}
            />

            <label
              htmlFor="vault-file"
              className={`inline-flex w-fit items-center rounded-lg border px-4 py-2 text-sm font-semibold ${
                isPro
                  ? "cursor-pointer border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
                  : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-500"
              }`}
            >
              Choose file
            </label>

            <div className="text-xs text-zinc-500">Allowed: PDF, JPG, PNG. Max 10MB.</div>

            {picked ? (
              <div className="text-sm text-zinc-700">
                Selected: <span className="font-semibold">{picked.name}</span> ({formatBytes(picked.size)})
              </div>
            ) : (
              <div className="text-sm text-zinc-500">No file selected.</div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={upload}
              disabled={loading || !picked || !isPro}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Working..." : "Upload"}
            </button>

            {status ? (
              <div
                className={`rounded-lg border px-3 py-2 text-sm ${
                  status.startsWith("❌")
                    ? "border-red-200 bg-red-50 text-red-700"
                    : status.startsWith("⭐") || status.startsWith("⚠️")
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {status}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* File list */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Your documents</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Files are private. Downloads use signed links.
          </p>
        </div>

        <div className="mt-4 grid gap-3">
          {files.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-zinc-600">
              No documents yet.
            </div>
          ) : (
            files.map((f) => (
              <div key={f.id} className="rounded-xl border border-zinc-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{f.file_name}</div>
                    <div className="mt-1 text-sm text-zinc-600">
                      {f.category} • {formatBytes(f.file_size)} •{" "}
                      {new Date(f.created_at).toLocaleString()}
                    </div>
                    {f.notes ? <div className="mt-2 text-sm text-zinc-700">{f.notes}</div> : null}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => download(f)}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => remove(f)}
                      disabled={loading}
                      className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
