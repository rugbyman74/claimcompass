import LegalPage from "../components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How ClaimCompass collects, uses, and protects your information."
    >
      <section>
        <h2 className="text-lg font-semibold">Information we collect</h2>
        <p className="mt-2 text-sm text-zinc-700">
          ClaimCompass collects account information (such as email and optional name),
          symptom logs, generated statements, and documents uploaded to the Evidence Vault.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How we use your information</h2>
        <p className="mt-2 text-sm text-zinc-700">
          Your information is used to provide core features, secure your account,
          and improve the service.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Data retention</h2>
        <p className="mt-2 text-sm text-zinc-700">
          Data is retained while your account remains active. You may delete uploaded
          documents at any time. Account deletion functionality is available upon request.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">HIPAA notice</h2>
        <p className="mt-2 text-sm text-zinc-700">
          ClaimCompass is not a healthcare provider or covered entity under HIPAA.
          While HIPAA may not formally apply, we treat user data as sensitive and
          implement security controls to restrict unauthorized access.
        </p>
      </section>
    </LegalPage>
  );
}
