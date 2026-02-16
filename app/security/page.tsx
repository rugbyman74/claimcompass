import LegalPage from "../components/LegalPage";

export default function SecurityPage() {
  return (
    <LegalPage
      title="Security"
      description="How ClaimCompass protects your data."
    >
      <section>
        <h2 className="text-lg font-semibold">Access controls</h2>
        <p className="mt-2 text-sm text-zinc-700">
          Authentication and row-level security ensure users can only access their own data.
          The Evidence Vault uses private storage and signed URLs.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Encryption</h2>
        <p className="mt-2 text-sm text-zinc-700">
          Data is encrypted in transit using HTTPS and stored using secure cloud infrastructure.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">User responsibility</h2>
        <p className="mt-2 text-sm text-zinc-700">
          Use a strong password and keep your device secure. Only upload information you
          are comfortable storing digitally.
        </p>
      </section>
    </LegalPage>
  );
}
