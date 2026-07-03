import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getPortalAccess } from "@/lib/team-data";
import { listCompanies } from "@/lib/customers";
import { getCompaniesCore, isCoreConfigured } from "@/lib/core-api";
import { searchRoster } from "@/lib/customer-search";
import CustomerSearch from "./search";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; company?: string }>;
};

// Warm requests answer from the roster cache in milliseconds, but a cold
// roster assembly fans out one core query per company — give it room.
export const maxDuration = 60;

export default async function CustomersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const access = await getPortalAccess();
  if (!access.nav.customers) notFound();

  const { q = "", company = "" } = await searchParams;
  const hasQuery = Boolean(q.trim() || company);

  const companies =
    (await getCompaniesCore())?.map((c) => c.name) ??
    (isCoreConfigured ? [] : await listCompanies());

  // Render initial results on the server so a shared /customers?q=… link
  // arrives populated; from there the client island filters as you type.
  const initial = hasQuery ? await searchRoster(q, company || undefined) : null;

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-10 py-12">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
          Customer Lookup
        </p>
        <Link
          href={`/${locale}/admin/companies`}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          Browse companies →
        </Link>
      </div>
      <h1 className="mt-2 font-serif text-3xl tracking-tight">Find a customer</h1>
      <p className="mt-3 text-muted max-w-xl leading-relaxed">
        Search by email or name, or filter by company — results update as you
        type. Email is the fastest path; it&apos;s the exact key on every
        record.
      </p>

      <CustomerSearch
        locale={locale}
        companies={companies}
        initialQ={q}
        initialCompany={company}
        initial={initial}
      />
    </div>
  );
}
