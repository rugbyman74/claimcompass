import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function LegalPage({ title, description, children }: Props) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-3 text-sm text-zinc-600 max-w-2xl">{description}</p>
        )}
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm space-y-8">
        {children}
      </div>

      <div className="mt-10 border-t pt-6 text-xs text-zinc-500 flex flex-wrap gap-4">
        <Link href="/privacy" className="hover:text-zinc-900">Privacy</Link>
        <Link href="/terms" className="hover:text-zinc-900">Terms</Link>
        <Link href="/security" className="hover:text-zinc-900">Security</Link>
        <Link href="/data-deletion" className="hover:text-zinc-900">Data Deletion</Link>
        <Link href="/faq" className="hover:text-zinc-900">FAQ</Link>
      </div>
    </div>
  );
}
