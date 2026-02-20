"use client";

import { useState } from "react";

type CancelModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
};

export default function CancelModal({ isOpen, onClose, onConfirmCancel }: CancelModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleCancel = async () => {
    setIsLoading(true);
    await onConfirmCancel();
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-2xl w-full rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">Before you go...</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Here's what you'll lose by canceling ClaimCompass Pro
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-zinc-100"
            disabled={isLoading}
          >
            <svg
              className="h-5 w-5 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Benefits Grid */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {/* Benefit 1 */}
          <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📄</div>
              <div>
                <div className="font-semibold text-blue-900">PDF & Word Exports</div>
                <div className="mt-1 text-sm text-blue-800">
                  Generate professional statements for your VA claim in seconds
                </div>
              </div>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🗂️</div>
              <div>
                <div className="font-semibold text-green-900">Evidence Vault</div>
                <div className="mt-1 text-sm text-green-800">
                  Unlimited document storage for medical records and evidence
                </div>
              </div>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚖️</div>
              <div>
                <div className="font-semibold text-purple-900">Ongoing Legal Updates</div>
                <div className="mt-1 text-sm text-purple-800">
                  Stay informed about VA policy changes that affect your claim
                </div>
              </div>
            </div>
          </div>

          {/* Benefit 4 */}
          <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🤝</div>
              <div>
                <div className="font-semibold text-orange-900">Claims Support</div>
                <div className="mt-1 text-sm text-orange-800">
                  Help with appeals, increases, and new condition claims
                </div>
              </div>
            </div>
          </div>

          {/* Benefit 5 */}
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔔</div>
              <div>
                <div className="font-semibold text-red-900">SMS Reminders</div>
                <div className="mt-1 text-sm text-red-800">
                  Daily text reminders to log symptoms and stay consistent
                </div>
              </div>
            </div>
          </div>

          {/* Benefit 6 */}
          <div className="rounded-xl border-2 border-teal-200 bg-teal-50 p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📊</div>
              <div>
                <div className="font-semibold text-teal-900">Post-Approval Tracking</div>
                <div className="mt-1 text-sm text-teal-800">
                  Monitor new conditions, re-evaluations, and benefit changes
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Special Offer */}
        <div className="mt-6 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🎁</div>
            <div className="flex-1">
              <div className="font-bold text-emerald-900">Special Offer: Stay for 50% Off</div>
              <div className="mt-1 text-sm text-emerald-800">
                Keep your Pro subscription for just <strong>$6/month</strong> for the next 3 months.
                That's half price!
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            {isLoading ? "Canceling..." : "Cancel Anyway"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Keep My Pro Access
          </button>
        </div>

        {/* Small print */}
        <div className="mt-4 text-center text-xs text-zinc-500">
          You can cancel anytime. No questions asked.
        </div>
      </div>
    </div>
  );
}