import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getPortalAccess } from "@/lib/team-data";
import { NotesPanel } from "@/components/admin/notes-panel";
import { SuppressionNote } from "@/components/admin/suppression-note";
import {
  getCompany,
  type AccountStatus,
  type ParticipationStatus,
} from "@/lib/customers";
import { getCompanyCore } from "@/lib/core-api";
import { listNotes } from "@/lib/notes-data";

type Props = { params: Promise<{ locale: string; company: string }> };

export default async function CompanyDetailPage({ params }: Props) {
  const { locale, company: raw } = await params;
  if (!isLocale(locale)) notFound();

  const access = await getPortalAccess();
  if (!access.nav.customers) notFound();

  const company = decodeURIComponent(raw);
  const detail = (await getCompanyCore(company)) ?? (await getCompany(company));
  if (!detail) {
    return (
      <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12">
        <BackLink locale={locale} />
        <p className="mt-8 text-muted">
          No company found for <span className="text-foreground">{company}</span>.
        </p>
      </div>
    );
  }

  const notes = await listNotes("company", detail.name);
  const path = `/${locale}/admin/companies/${encodeURIComponent(detail.name)}`;

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12 space-y-6">
      <BackLink locale={locale} />

      <header className="rounded-md border border-border bg-surface p-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
          Company
        </p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight">{detail.name}</h1>
        <div className="mt-5 grid grid-cols-3 gap-4">
          <Metric label="Roster" value={String(detail.roster)} />
          <Metric
            label="Participating"
            value={detail.participatingPct === null ? "—" : `${detail.participatingPct}%`}
          />
          <Metric
            label="Avg score"
            value={detail.avgScore === null ? "—" : String(detail.avgScore)}
          />
        </div>
        {detail.suppressed && <SuppressionNote roster={detail.roster} />}
      </header>

      <section className="rounded-md border border-border bg-surface">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">
            People <span className="text-muted font-normal">({detail.members.length})</span>
          </h2>
        </div>
        <ul className="divide-y divide-border">
          {detail.members.map((m) => (
            <li key={m.email}>
              <Link
                href={`/${locale}/admin/customers/${encodeURIComponent(m.email)}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-background transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <p className="text-xs text-muted truncate">
                    {m.email}
                    {m.department ? ` · ${m.department}` : ""}
                  </p>
                </div>
                <StatusBadge status={m.status} />
                <ParticipationDot status={m.participationStatus} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <NotesPanel
        title="Account notes"
        scope="company"
        subject={detail.name}
        organization={detail.name}
        path={path}
        notes={notes}
      />
    </div>
  );
}

function BackLink({ locale }: { locale: string }) {
  return (
    <Link
      href={`/${locale}/admin/companies`}
      className="text-sm text-muted hover:text-foreground transition-colors"
    >
      ← All companies
    </Link>
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
