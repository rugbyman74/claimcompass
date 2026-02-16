import LegalPage from "../components/LegalPage";
import Link from "next/link";

export default function DataDeletionPage() {
  return (
    <LegalPage
      title="Data Deletion"
      description="How to remove your documents or request account deletion."
    >
      <section>
        <h2 className="text-lg font-semibold">Delete documents</h2>
        <p className="mt-2 text-sm text-zinc-700">
          Documents can be deleted directly from the Evidence Vault.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Delete your account</h2>
        <p className="mt-2 text-sm text-zinc-700">
          To request full account deletion, use the Contact page and include your account email.
        </p>
        <div className="mt-4">
          <Link
            href="/contact"
            className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </LegalPage>
  );
}
