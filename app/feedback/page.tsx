"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState("general");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const submitFeedback = async () => {
    if (!message.trim()) {
      setStatus("❌ Please enter your feedback");
      return;
    }

    setLoading(true);
    setStatus("");

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id || null;
    const userEmail = sessionData.session?.user?.email || null;

    const { error } = await supabase.from("feedback").insert({
      user_id: userId,
      user_email: userEmail,
      feedback_type: feedbackType,
      message: message.trim(),
    });

    if (error) {
      setLoading(false);
      setStatus("❌ Failed to submit feedback: " + error.message);
      return;
    }

    // Send email notification
    try {
      await fetch("/api/send-feedback-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackType,
          message: message.trim(),
          userEmail,
        }),
      });
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    setLoading(false);
    setStatus("✅ Thank you for your feedback! We read every submission.");
    setMessage("");
    setFeedbackType("general");
  };

  return (
    <div className="mx-auto max-w-2xl grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Send Feedback</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Help us improve ClaimCompass. We read every piece of feedback.
        </p>
      </div>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4">
          <div className="grid gap-1">
            <label className="text-sm font-medium text-zinc-700">Feedback Type</label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            >
              <option value="general">General Feedback</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="improvement">Improvement Suggestion</option>
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium text-zinc-700">Your Feedback</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think, report a bug, or suggest a feature..."
              className="min-h-[200px] w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
            <div className="text-xs text-zinc-500">
              Be as detailed as possible. Screenshots or examples are helpful!
            </div>
          </div>

          <button
            onClick={submitFeedback}
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>

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
        </div>
      </section>

      <section className="rounded-2xl border-2 border-blue-600 bg-blue-50 p-6">
        <h2 className="text-lg font-bold text-blue-900">Why Your Feedback Matters</h2>
        <div className="mt-4 space-y-2 text-sm text-blue-800">
          <p>
            <strong>Built by a veteran, for veterans.</strong> Your feedback directly shapes 
            the future of ClaimCompass.
          </p>
          <p>
            Every suggestion is reviewed, and many features you see today came from 
            veteran feedback just like yours.
          </p>
        </div>
      </section>
    </div>
  );
}