export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Questions or support requests.
      </p>

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <p className="text-sm text-zinc-700">
          ClaimCompass is currently in active development.
        </p>

        <p className="text-sm text-zinc-700">
          Support contact details will be published before public launch.
        </p>

        <p className="text-sm text-zinc-700">
          For security concerns, please refer to the Security page.
        </p>

        <p className="text-xs text-zinc-500">
          ClaimCompass is not affiliated with the VA and does not provide legal or medical advice.
        </p>
      </div>
    </div>
  );
}
