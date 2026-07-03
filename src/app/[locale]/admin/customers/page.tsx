import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getPortalAccess } from "@/lib/team-data";
import {
  searchCustomers,
  listCompanies,
  type AccountStatus,
  type ParticipationStatus,
} from "@/lib/customers";
import {
  searchCustomersCore,
  getCompaniesCore,
  isCoreConfigured,
} from "@/lib/core-api";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; company?: string }>;
};

// Core's search iterates the prod User table — give it room, but never let a
// slow call kill the render (coreGet timeboxes each call).
export const maxDuration = 60;

export default async function CustomersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const access = await getPortalAccess();
  if (!access.nav.customers) notFound();

  const { q = "", company = "" } = await searchParams;
  // Search only when asked: an empty query would scan the entire prod User
  // table (30s+). The landing state is a prompt, not a full listing.
  const hasQuery = Boolean(q.trim() || company);

  const companies =
    (await getCompaniesCore())?.map((c) => c.name) ??
    (isCoreConfigured ? [] : await listCompanies());

  // With core configured, never fall back to stub data — showing plausible
  // fake customers against prod is worse than an honest failure.
  let results: Awaited<ReturnType<typeof searchCustomers>> = [];
  let searchFailed = false;
  if (hasQuery) {
    if (isCoreConfigured) {
      const r = await searchCustomersCore(q, company || undefined);
      if (r === null) searchFailed = true;
      else results = r;
    } else {
      results = await searchCustomers(q, company || undefined);
    }
  }

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
        Search by email or name, or filter by company. Email is the fastest path
        — it&apos;s the exact key on every record.
      </p>

      <form className="mt-8 flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="email or name…"
          aria-label="Search customers"
          className="flex-1 h-11 rounded-[4px] border border-border bg-surface px-4 text-sm placeholder:text-muted/70 focus:border-foreground/40 focus:outline-none transition-colors"
        />
        <select
          name="company"
          defaultValue={company}
          aria-label="Filter by company"
          className="h-11 rounded-[4px] border border-border bg-surface px-4 text-sm focus:border-foreground/40 focus:outline-none transition-colors"
        >
          <option value="">All companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-11 inline-flex items-center justify-center rounded-[4px] bg-foreground text-background px-5 text-sm font-medium hover:bg-primary transition-colors"
        >
          Search
        </button>
      </form>

      {!hasQuery ? (
        <div className="mt-8 rounded-2xl glass px-6 py-12 text-center">
          <p className="text-sm font-medium">Search to get started</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted">
            Type a name or email above — the exact email is the fastest path.
            Or pick a company to browse its people.
          </p>
        </div>
      ) : searchFailed ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 px-6 py-8 text-center">
          <p className="text-sm font-medium">Search took too long</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted">
            The customer directory didn&apos;t respond in time. Try again, or narrow
            the search — a full email address is fastest.
          </p>
        </div>
      ) : (
      <div className="mt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-muted mb-3">
          {results.length} {results.length === 1 ? "result" : "results"}
        </p>
        <ul className="divide-y divide-white/50 rounded-2xl glass overflow-hidden">
          {results.map((r) => (
            <li key={r.email}>
              <Link
                href={`/${locale}/admin/customers/${encodeURIComponent(r.email)}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/50 transition-colors"
              >
                <span className="size-9 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground text-xs font-semibold flex items-center justify-center">
                  {initials(r.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-xs text-muted truncate">
                    {r.email} · {r.company}
                    {r.department ? ` · ${r.department}` : ""}
                  </p>
                </div>
                <StatusBadge status={r.status} />
                <ParticipationDot status={r.participationStatus} />
              </Link>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-5 py-8 text-sm text-muted text-center">
              No matches. Try the full email address.
            </li>
          )}
        </ul>
      </div>
      )}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const map: Record<AccountStatus, string> = {
    active: "bg-accent-soft/70 text-foreground border-accent/40",
    unconfirmed: "bg-amber-100 text-foreground border-amber-200",
    disabled: "bg-rose-100 text-foreground border-rose-200",
  };
  return (
    <span
      className={`hidden sm:inline-flex shrink-0 text-[11px] capitalize rounded-full border px-2.5 py-0.5 ${map[status]}`}
    >
      {status}
    </span>
  );
}

function ParticipationDot({ status }: { status: ParticipationStatus }) {
  const map: Record<ParticipationStatus, string> = {
    engaged: "bg-accent",
    dormant: "bg-primary",
    new: "bg-muted",
  };
  return (
    <span
      aria-label={`Participation: ${status}`}
      className={`shrink-0 size-2 rounded-full ${map[status]}`}
    />
  );
}
