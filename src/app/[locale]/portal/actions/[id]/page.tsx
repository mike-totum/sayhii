import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import {
  getAction,
  STATUS_META,
  PRIORITY_META,
  TEMPLATE_KIND_META,
  actions,
} from "@/lib/portal-actions";
import { themes } from "@/lib/portal-data";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { StatusPill } from "@/components/portal/action-card";

type Props = { params: Promise<{ locale: string; id: string }> };

export function generateStaticParams() {
  return actions.flatMap((a) =>
    ["en", "es"].map((locale) => ({ locale, id: a.id })),
  );
}

export default async function ActionDetailPage({ params }: Props) {
  const { locale, id } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);

  const action = getAction(id);
  if (!action) notFound();
  const theme = themes.find((t) => t.key === action.theme);
  const tpl = TEMPLATE_KIND_META[action.template.kind];

  return (
    <div className="px-6 lg:px-10 py-7 lg:py-9 space-y-6">
      <Link
        href={`/${locale}/portal/actions`}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors rise"
      >
        <ArrowIcon className="size-4 rotate-180" />
        All actions
      </Link>

      <header className="grid lg:grid-cols-[1fr_auto] gap-6 items-start rise rise-1">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted">
            <span>Action</span>
            <span>·</span>
            <Link
              href={`/${locale}/portal/themes/${action.theme}`}
              className="hover:text-foreground transition-colors"
            >
              {theme?.name}
            </Link>
            <span>·</span>
            <span>Triggered {action.trigger.when.toLowerCase()}</span>
          </div>
          <h1 className="mt-2 text-3xl lg:text-4xl tracking-tight font-semibold leading-tight max-w-3xl">
            {action.title}
          </h1>
          <p className="mt-3 text-muted max-w-3xl leading-relaxed">
            {action.summary}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusPill action={action} />
            <span className={`text-xs font-medium ${PRIORITY_META[action.priority].tone}`}>
              {PRIORITY_META[action.priority].label} priority
            </span>
            <span className="text-xs text-muted">·</span>
            <span className="text-xs text-muted">{action.dueLabel}</span>
            <span className="text-xs text-muted">·</span>
            <span className="text-xs text-muted">{action.affects}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 h-10 rounded-full bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary-hover transition-colors">
            {tpl.verb}
            <ArrowIcon className="size-4" />
          </button>
          <button className="inline-flex items-center gap-2 h-10 rounded-full border border-border bg-surface px-4 text-sm font-medium hover:border-foreground/30 transition-colors">
            <CheckIcon className="size-4" />
            Mark done
          </button>
          <button className="inline-flex items-center gap-2 h-10 rounded-full border border-border bg-surface px-4 text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors">
            Dismiss
          </button>
        </div>
      </header>

      <section className="grid lg:grid-cols-[1.5fr_1fr] gap-5 items-start">
        <div className="space-y-5">
          {/* Trigger card */}
          <div className="rounded-3xl border border-border bg-surface p-5 lg:p-6 rise rise-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              Why this action exists
            </p>
            <h2 className="mt-1 text-xl tracking-tight font-semibold leading-tight">
              {action.trigger.description}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span
                className={`inline-flex items-center justify-center min-w-[72px] rounded-full text-xs font-mono px-2.5 py-1 border ${
                  action.trigger.delta >= 0
                    ? "bg-accent-soft text-accent border-accent/30"
                    : "bg-warm/60 text-primary border-primary/30"
                }`}
              >
                {action.trigger.delta >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(action.trigger.delta).toFixed(1)}
                {action.trigger.delta % 1 === 0 ? "" : "%"}
              </span>
              <span className="text-muted">{action.trigger.when}</span>
              <Link
                href={`/${locale}/portal/themes/${action.theme}`}
                className="ml-auto text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                Open theme
                <ArrowIcon className="size-4" />
              </Link>
            </div>
          </div>

          {/* Template card */}
          <div className="rounded-3xl border border-border bg-surface p-5 lg:p-6 rise rise-3">
            <header className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                  Template · {tpl.label}
                </p>
                <h2 className="mt-1 text-xl tracking-tight font-semibold">
                  {action.template.title}
                </h2>
              </div>
              <span className="text-xs text-muted">{action.template.duration}</span>
            </header>

            <div className="mt-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted mb-2">
                Run sheet
              </p>
              <ol className="space-y-3">
                {action.template.prompt.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="size-6 shrink-0 rounded-full bg-foreground text-background text-[11px] font-mono inline-flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-background p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted mb-2">
                Talking points · what to know
              </p>
              <ul className="space-y-2 text-sm text-foreground/85 leading-relaxed">
                {action.template.talkingPoints.map((tp, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">·</span>
                    <span>{tp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 h-9 rounded-full border border-border bg-surface px-4 text-xs font-medium hover:border-foreground/30 transition-colors">
                Send to Slack
              </button>
              <button className="inline-flex items-center gap-2 h-9 rounded-full border border-border bg-surface px-4 text-xs font-medium hover:border-foreground/30 transition-colors">
                Add to Google Calendar
              </button>
              <button className="inline-flex items-center gap-2 h-9 rounded-full border border-border bg-surface px-4 text-xs font-medium hover:border-foreground/30 transition-colors">
                Copy as note
              </button>
            </div>
          </div>

          {/* Outcome */}
          {action.outcome ? (
            <div
              className={`rounded-3xl border p-5 lg:p-6 rise rise-4 ${
                action.outcome.helped
                  ? "border-accent/30 bg-accent-soft/40"
                  : "border-border bg-surface"
              }`}
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Outcome · did it help?
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-3xl tracking-tight font-semibold">
                  {action.outcome.helped === true
                    ? "Yes"
                    : action.outcome.helped === false
                      ? "Not yet"
                      : "Pending"}
                </span>
                {typeof action.outcome.signalDelta === "number" && (
                  <span className="text-sm font-mono tabular-nums text-accent">
                    +{action.outcome.signalDelta.toFixed(1)}% on signal
                  </span>
                )}
              </div>
              {action.outcome.note && (
                <p className="mt-3 text-sm text-foreground/85 leading-relaxed">
                  {action.outcome.note}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-surface/50 p-5 lg:p-6 grid sm:grid-cols-[1fr_auto] gap-4 items-center rise rise-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                  Outcome loop
                </p>
                <p className="mt-2 font-medium">
                  We&rsquo;ll check the {theme?.name.toLowerCase()} signal 14 days after this
                  action is closed and ask you whether it helped.
                </p>
                <p className="mt-1 text-sm text-muted">
                  No survey. The data answers the question.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <aside className="space-y-5">
          <div className="rounded-3xl border border-border bg-surface p-5 lg:p-6 rise rise-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              Owner
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="size-9 rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground text-xs font-semibold inline-flex items-center justify-center">
                {action.owner.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{action.owner.name}</p>
                <p className="text-xs text-muted truncate">{action.owner.email}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 lg:p-6 rise rise-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              Timeline
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <Step label={action.createdLabel} body="Action created" />
              <Step label="Template selected" body={tpl.label} />
              {action.status === "scheduled" || action.status === "in_progress" ? (
                <Step label={action.dueLabel} body={STATUS_META[action.status].label} active />
              ) : null}
              {action.completedLabel && (
                <Step label={action.completedLabel} body={STATUS_META[action.status].label} done />
              )}
            </ul>
          </div>

          <div className="rounded-3xl border border-foreground bg-foreground text-background p-5 lg:p-6 rise rise-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-background/60">
              Why this is different
            </p>
            <p className="mt-3 text-base leading-relaxed">
              Most engagement tools stop at the chart. sayhii pairs every signal
              with a template and watches the same data afterward. The loop
              closes itself.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Step({
  label,
  body,
  active,
  done,
}: {
  label: string;
  body: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <li className="grid grid-cols-[8px_1fr] gap-3 items-baseline">
      <span
        className={`mt-1.5 size-2 rounded-full ${
          done ? "bg-accent" : active ? "bg-primary animate-pulse-soft" : "bg-border"
        }`}
      />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-medium">{body}</p>
      </div>
    </li>
  );
}
