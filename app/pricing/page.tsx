import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl grid gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">ClaimCompass Pro</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Upgrade to unlock premium features. Payments will be enabled at launch.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-zinc-900">Free</div>
          <div className="mt-2 text-3xl font-semibold">$0</div>
          <ul className="mt-4 space-y-2 text-sm text-zinc-700">
            <li>✅ Symptom logging</li>
            <li>✅ Edit & delete entries</li>
            <li>✅ Statement builder preview</li>
            <li>✅ Referral link</li>
          </ul>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-zinc-900">Pro</div>
          <div className="mt-2 text-3xl font-semibold">$12<span className="text-base font-semibold text-zinc-500">/mo</span></div>
          <p className="mt-2 text-sm text-zinc-600">
            (Stripe checkout will be added right before launch.)
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-700">
            <li>⭐ PDF export for statements</li>
            <li>⭐ Evidence Vault uploads & storage</li>
            <li>⭐ Future: claim package builder</li>
          </ul>

          <div className="mt-6 text-xs text-zinc-500">
            Want early access? For now, Pro access can be granted manually during testing.
          </div>

          <div className="mt-4">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Request Pro (testing)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
