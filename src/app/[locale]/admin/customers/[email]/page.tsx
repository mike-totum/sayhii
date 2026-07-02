import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getPortalAccess } from "@/lib/team-data";
import { NotesPanel } from "@/components/admin/notes-panel";
import {
  getCustomer,
  type AccountStatus,
  type Participation,
} from "@/lib/customers";
import { listNotes } from "@/lib/notes-data";
import { getParticipation, getCustomerCore } from "@/lib/core-api";
import { getActivationStatus, type ActivationMonth } from "@/lib/activation-api";

type Props = { params: Promise<{ locale: string; email: string }> };

export default async function CustomerRecordPage({ params }: Props) {
  const { locale, email: raw } = await params;
  if (!isLocale(locale)) notFound();

  const access = await getPortalAccess();
  if (!access.nav.customers) notFound();

  const email = decodeURIComponent(raw);
  const c = (await getCustomerCore(email)) ?? (await getCustomer(email));

  if (!c) {
    return (
      <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12">
        <BackLink locale={locale} />
        <p className="mt-8 text-muted">
          No record found for <span className="text-foreground">{email}</span>.
        </p>
      </div>
    );
  }

  const path = `/${locale}/admin/customers/${encodeURIComponent(c.email)}`;
  const [userNotes, companyNotes, liveParticipation, activation] =
    await Promise.all([
      listNotes("user", c.email),
      listNotes("company", c.company),
      getParticipation(c.email),
      getActivationStatus(c.email),
    ]);
  // Real participation from sayhii-core when available; stub otherwise.
  const participation = liveParticipation ?? c.participation;

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12 space-y-6">
      <BackLink locale={locale} />

      {/* Zone 1 — Identity */}
      <header className="rounded-md border border-border bg-surface p-6">
        <div className="flex items-start gap-4">
          <span className="size-12 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground text-sm font-semibold flex items-center justify-center">
            {initials(c.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-2xl tracking-tight">{c.name}</h1>
              <StatusBadge status={c.status} />
            </div>
            <p className="mt-1 text-sm text-muted">{c.email}</p>
            <p className="mt-1 text-sm text-muted">
              <Link
                href={`/${locale}/admin/companies/${encodeURIComponent(c.company)}`}
                className="text-foreground hover:text-primary transition-colors"
              >
                {c.company}
              </Link>
              {c.department ? ` › ${c.department}` : ""}
              {c.managerEmail ? ` › reports to ${c.managerEmail}` : ""}
            </p>
          </div>
        </div>
      </header>

      {/* Zone 2 — Account */}
      <section className="rounded-md border border-border bg-surface p-6">
        <SectionTitle>Account</SectionTitle>
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
          <Field label="Company" value={c.company} />
          <Field label="Role" value={c.role} />
          <Field label="Department" value={c.department ?? "—"} />
          <Field label="Joined" value={c.joined ?? "—"} />
          <Field
            label="Source"
            value={c.source === "hris" ? `HRIS (${c.hrisProvider ?? "—"})` : "Manual"}
          />
          <Field label="Synced" value={c.lastSyncedLabel ?? "—"} />
        </dl>
      </section>

      {/* Zone 3 — Engagement (participation only) */}
      <section className="rounded-md border border-border bg-surface p-6">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle>Engagement</SectionTitle>
          <span className="text-[11px] text-muted">
            participation only — no answer content
          </span>
        </div>
        <Engagement p={participation} />
      </section>

      {/* Zone 3.5 — Monthly activation (answered vs expected, from Snowflake) */}
      {activation && activation.length > 0 && (
        <section className="rounded-md border border-border bg-surface p-6">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle>Monthly activation</SectionTitle>
            <span className="text-[11px] text-muted">
              sent status · answered vs expected
            </span>
          </div>
          <ActivationHistory months={activation} />
        </section>
      )}

      {/* Zone 4 — Notes */}
      <NotesPanel
        title="Notes"
        scope="user"
        subject={c.email}
        organization={c.company}
        path={path}
        notes={userNotes}
      />
      <NotesPanel
        title={`Account notes · ${c.company}`}
        scope="company"
        subject={c.company}
        organization={c.company}
        path={path}
        notes={companyNotes}
      />
    </div>
  );
}

function Engagement({ p }: { p: Participation }) {
  const statusLabel =
    p.status === "engaged" ? "🟢 Engaged" : p.status === "dormant" ? "🟠 Dormant" : "⚪ New";
  return (
    <div className="mt-4 grid sm:grid-cols-[auto_1fr] gap-6 items-center">
      <div className="flex items-center gap-4">
        <ScoreRing score={p.score} />
        <div>
          <p className="text-sm font-medium">{statusLabel}</p>
          <p className="text-xs text-muted">participation score</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
        <Field
          label="Last active"
          value={p.lastActiveDays === null ? "never" : `${p.lastActiveDays}d ago`}
        />
        <Field label="Phase" value={`${p.currentPhase} of ${p.totalPhases}`} />
        <Field
          label="Phase progress"
          value={p.phaseProgressPct === null ? "—" : `${p.phaseProgressPct}%`}
        />
        <Field
          label="Overdue"
          value={p.overdue ? "⚠ yes" : "no"}
        />
      </dl>
    </div>
  );
}

function ActivationHistory({ months }: { months: ActivationMonth[] }) {
  return (
    <div className="mt-4 space-y-2">
      {months.map((m) => {
        const pct = m.expected > 0 ? Math.round((m.answered / m.expected) * 100) : null;
        return (
          <div
            key={m.monthId}
            className="grid grid-cols-[5.5rem_auto_1fr] items-center gap-3 text-sm"
          >
            <span className="text-muted">{formatMonthId(m.monthId)}</span>
            <span className="tabular-nums">
              <span className="font-medium">{m.answered}</span>
              <span className="text-muted"> / {m.expected}</span>
              {pct !== null && (
                <span className="ml-1.5 text-xs text-muted">{pct}%</span>
              )}
              <span
                className={`ml-1.5 text-[11px] ${m.eligible ? "text-muted" : "text-amber-700"}`}
              >
                {m.eligible ? "· eligible" : "· below 80%"}
              </span>
            </span>
            <SendBadge month={m} />
          </div>
        );
      })}
      <p className="pt-1 text-[11px] text-muted">
        <strong className="font-medium text-foreground">Sent</strong> = the
        activation was delivered. Eligible = answered ≥ 80% of expected
        (weekdays in the window), which is what qualifies a user to be sent one.
      </p>
    </div>
  );
}

// The answer to "did they get it." Sent is the headline; other statuses
// explain why an eligible user didn't receive one (blocked, rejected, still
// in review, or a delivery failure).
function SendBadge({ month }: { month: ActivationMonth }) {
  const base =
    "inline-flex items-center justify-self-end text-[11px] rounded-full border px-2.5 py-0.5";
  if (month.sent) {
    return (
      <span className={`${base} bg-accent-soft/70 text-foreground border-accent/40`}>
        Sent{month.sentAt ? ` · ${formatSentAt(month.sentAt)}` : ""}
      </span>
    );
  }
  const map: Record<string, { label: string; cls: string }> = {
    FAILED: { label: "Send failed", cls: "bg-rose-100 text-foreground border-rose-200" },
    QA_BLOCKED: { label: "QA blocked", cls: "bg-amber-100 text-foreground border-amber-200" },
    REJECTED: { label: "Rejected", cls: "bg-amber-100 text-foreground border-amber-200" },
    PENDING_APPROVAL: { label: "In review", cls: "bg-surface text-muted border-border" },
    APPROVED: { label: "Approved, not yet sent", cls: "bg-surface text-muted border-border" },
  };
  const v = month.sentStatus ? map[month.sentStatus] : undefined;
  const { label, cls } = v ?? {
    label: "Not sent",
    cls: "bg-surface text-muted border-border",
  };
  return <span className={`${base} ${cls}`}>{label}</span>;
}

// "2025-12-03T..." -> "Dec 3"
function formatSentAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// "202606" -> "Jun 2026"
function formatMonthId(monthId: string): string {
  const m = /^(\d{4})(\d{2})$/.exec(monthId);
  if (!m) return monthId;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function ScoreRing({ score }: { score: number }) {
  const tone =
    score >= 70 ? "text-accent" : score >= 40 ? "text-primary" : "text-muted";
  return (
    <span
      className={`size-14 shrink-0 rounded-full border-4 border-border flex items-center justify-center font-semibold tabular-nums ${tone}`}
      aria-label={`Participation score ${score} of 100`}
    >
      {score}
    </span>
  );
}

function BackLink({ locale }: { locale: string }) {
  return (
    <Link
      href={`/${locale}/admin/customers`}
      className="text-sm text-muted hover:text-foreground transition-colors"
    >
      ← Back to search
    </Link>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted">
      {children}
    </h2>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
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
      className={`inline-flex text-[11px] capitalize rounded-full border px-2.5 py-0.5 ${map[status]}`}
    >
      {status}
    </span>
  );
}
