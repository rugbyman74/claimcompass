export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Frequently Asked Questions</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Answers to common questions about ClaimCompass.
      </p>

      <div className="mt-6 space-y-6 rounded-2xl border bg-white p-6 shadow-sm">

        <section>
          <h2 className="font-semibold">Is ClaimCompass affiliated with the VA?</h2>
          <p className="mt-2 text-sm text-zinc-700">
            No. ClaimCompass is an independent tool and is not affiliated with the U.S. Department of Veterans Affairs (VA).
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Does ClaimCompass provide legal or medical advice?</h2>
          <p className="mt-2 text-sm text-zinc-700">
            No. ClaimCompass provides organizational tools only. It does not provide legal advice, medical advice,
            claim representation, or guarantee outcomes.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Who can see my logs and uploaded documents?</h2>
          <p className="mt-2 text-sm text-zinc-700">
            Only you. Your data is tied to your authenticated account and protected using row-level security
            and private storage.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">What file types can I upload?</h2>
          <p className="mt-2 text-sm text-zinc-700">
            PDF, JPG, and PNG files up to 10MB each.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Can ClaimCompass submit my claim?</h2>
          <p className="mt-2 text-sm text-zinc-700">
            No. ClaimCompass helps you organize documentation and generate statements.
            Claims must be submitted through official VA channels.
          </p>
        </section>

      </div>
    </div>
  );
}
