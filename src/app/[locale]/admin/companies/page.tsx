import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getStaff, hasModule } from "@/lib/admin-auth";
import { getCompanies } from "@/lib/customers";
import { getCompaniesCore } from "@/lib/core-api";
import { SuppressionNote } from "@/components/admin/suppression-note";

type Props = { params: Promise<{ locale: string }> };

export default async function CompaniesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const staff = await getStaff();
  if (!hasModule(staff, "customer-lookup")) notFound();

  const companies = (await getCompaniesCore()) ?? (await getCompanies());

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-10 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            Customer Lookup
          </p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight">Companies</h1>
        </div>
        <Link
          href={`/${locale}/admin/customers`}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          Search people →
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {companies.map((c) => (
          <Link
            key={c.name}
            href={`/${locale}/admin/companies/${encodeURIComponent(c.name)}`}
            className="group rounded-md border border-border bg-surface p-6 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(17,17,23,0.4)] transition-all"
          >
            <h2 className="font-serif text-2xl tracking-tight">{c.name}</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Metric label="Roster" value={String(c.roster)} />
              <Metric
                label="Participating"
                value={c.participatingPct === null ? "—" : `${c.participatingPct}%`}
              />
              <Metric
                label="Avg score"
                value={c.avgScore === null ? "—" : String(c.avgScore)}
              />
            </div>
            {c.suppressed && <SuppressionNote roster={c.roster} />}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-serif text-2xl tabular-nums">{value}</p>
    </div>
  );
}
