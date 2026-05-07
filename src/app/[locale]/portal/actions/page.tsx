import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { actions, STATUS_META, type ActionStatus } from "@/lib/portal-actions";
import { ActionCard } from "@/components/portal/action-card";
import { ArrowIcon } from "@/components/icons";

type Props = { params: Promise<{ locale: string }> };

const FILTERS: { key: ActionStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "scheduled", label: "Scheduled" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
  { key: "dismissed", label: "Dismissed" },
];

export default async function ActionsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);

  const counts: Record<ActionStatus | "all", number> = {
    all: actions.length,
    open: actions.filter((a) => a.status === "open").length,
    scheduled: actions.filter((a) => a.status === "scheduled").length,
    in_progress: actions.filter((a) => a.status === "in_progress").length,
    done: actions.filter((a) => a.status === "done").length,
    dismissed: actions.filter((a) => a.status === "dismissed").length,
  };

  // Sort: open + high priority first, then by status order
  const order: Record<ActionStatus, number> = {
    open: 0,
    in_progress: 1,
    scheduled: 2,
    done: 3,
    dismissed: 4,
  };
  const sorted = [...actions].sort((a, b) => {
    const s = order[a.status] - order[b.status];
    if (s !== 0) return s;
    const p =
      (a.priority === "high" ? 0 : a.priority === "medium" ? 1 : 2) -
      (b.priority === "high" ? 0 : b.priority === "medium" ? 1 : 2);
    return p;
  });

  const groupedHero = {
    thisWeek: sorted.filter(
      (a) => a.status === "open" || a.status === "in_progress",
    ),
    soon: sorted.filter((a) => a.status === "scheduled"),
    closed: sorted.filter(
      (a) => a.status === "done" || a.status === "dismissed",
    ),
  };

  return (
    <div className="px-6 lg:px-10 py-7 lg:py-9 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 rise">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            Actions
          </p>
          <h1 className="mt-1 text-3xl lg:text-4xl tracking-tight font-semibold">
            From signal to{" "}
            <span className="font-serif italic text-primary">action</span>.
          </h1>
          <p className="mt-2 text-muted max-w-2xl leading-relaxed text-sm">
            Every action is generated from a moving signal, paired with a template
            you can use this week, and tracked against the same data afterwards
            to see if it worked.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 h-10 rounded-full bg-foreground text-background px-4 text-sm font-medium hover:bg-foreground/85 transition-colors">
          New action
          <ArrowIcon className="size-4" />
        </button>
      </header>

      {/* Summary tiles */}
      <section className="grid sm:grid-cols-3 gap-3 rise rise-1">
        <Tile
          label="Open this week"
          value={counts.open + counts.in_progress}
          tone="primary"
          sub={`${counts.open} new · ${counts.in_progress} in progress`}
        />
        <Tile
          label="Scheduled"
          value={counts.scheduled}
          sub="Pilots and meetings already on the calendar"
        />
        <Tile
          label="Closed"
          value={counts.done + counts.dismissed}
          tone="accent"
          sub={`${counts.done} done · ${counts.dismissed} dismissed`}
        />
      </section>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 rise rise-2">
        {FILTERS.map((f, i) => (
          <button
            key={f.key}
            className={`inline-flex items-center gap-1.5 h-8 rounded-full border px-3 text-xs font-medium transition-colors ${
              i === 0
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-surface text-muted hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {f.label}
            <span className="text-[10px] font-mono text-muted/70">
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* This week */}
      {groupedHero.thisWeek.length > 0 && (
        <section className="rise rise-3">
          <header className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl tracking-tight font-semibold">
              This week
              <span className="ml-2 text-sm font-mono text-muted">
                {groupedHero.thisWeek.length}
              </span>
            </h2>
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groupedHero.thisWeek.map((a) => (
              <ActionCard
                key={a.id}
                action={a}
                href={`/${locale}/portal/actions/${a.id}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Scheduled */}
      {groupedHero.soon.length > 0 && (
        <section className="rise rise-4">
          <header className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl tracking-tight font-semibold">
              Scheduled
              <span className="ml-2 text-sm font-mono text-muted">
                {groupedHero.soon.length}
              </span>
            </h2>
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groupedHero.soon.map((a) => (
              <ActionCard
                key={a.id}
                action={a}
                href={`/${locale}/portal/actions/${a.id}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Closed */}
      {groupedHero.closed.length > 0 && (
        <section className="rise rise-5">
          <header className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl tracking-tight font-semibold text-muted">
              Closed
              <span className="ml-2 text-sm font-mono text-muted">
                {groupedHero.closed.length}
              </span>
            </h2>
            <Link
              href={`/${locale}/portal/scorecard`}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              See outcomes →
            </Link>
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groupedHero.closed.map((a) => (
              <ActionCard
                key={a.id}
                action={a}
                href={`/${locale}/portal/actions/${a.id}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: "default" | "primary" | "accent";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-foreground text-background border-foreground"
      : tone === "accent"
        ? "bg-accent-soft border-accent/30"
        : "bg-surface border-border";
  const labelClass = tone === "primary" ? "text-background/60" : "text-muted";
  const subClass = tone === "primary" ? "text-background/70" : "text-muted";
  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className={`text-[11px] uppercase tracking-[0.18em] ${labelClass}`}>
        {label}
      </p>
      <p className="mt-2 text-3xl tracking-tight font-semibold tabular-nums">
        {value}
      </p>
      {sub && <p className={`mt-1 text-xs ${subClass}`}>{sub}</p>}
    </div>
  );
}
