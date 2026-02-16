export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-zinc-600">Effective date: {new Date().toISOString().slice(0, 10)}</p>

      <div className="mt-6 space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Acceptance of terms</h2>
          <p className="text-sm text-zinc-700">
            By accessing or using ClaimCompass, you agree to these Terms of Service. If you do not agree, do not use the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Not legal or medical advice</h2>
          <p className="text-sm text-zinc-700">
            ClaimCompass provides organizational tools only. It does not provide legal advice, medical advice, or representation.
            ClaimCompass is not affiliated with the VA.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3) Your responsibilities</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
            <li>You are responsible for the accuracy of what you enter and upload.</li>
            <li>You must keep your login credentials secure.</li>
            <li>You must not upload illegal content, malware, or content that violates someone else’s rights.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4) Service availability</h2>
          <p className="text-sm text-zinc-700">
            We aim for reliable access, but the service may be interrupted for maintenance, updates, or outages.
            We may modify or discontinue features.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">5) Accounts and termination</h2>
          <p className="text-sm text-zinc-700">
            We may suspend or terminate accounts that violate these terms or pose security risks.
            You may stop using the service at any time.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">6) Limitation of liability</h2>
          <p className="text-sm text-zinc-700">
            To the fullest extent permitted by law, ClaimCompass is provided “as is” without warranties of any kind.
            ClaimCompass is not liable for indirect, incidental, special, or consequential damages, or for loss of data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">7) Changes to these terms</h2>
          <p className="text-sm text-zinc-700">
            We may update these terms from time to time. Continued use of the service after changes means you accept the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}
