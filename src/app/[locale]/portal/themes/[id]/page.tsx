import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import {
  themes,
  themeSeries,
  subThemesByTheme,
  lowestQuestionsByTheme,
  scoreCellTone,
  type ThemeKey,
} from "@/lib/portal-data";
import { ThemeLineChart } from "@/components/portal/charts/line";
import { SubThemeRadar } from "@/components/portal/charts/radar";
import { PeriodSelector } from "@/components/portal/period-selector";
import { ThemeSwitcher } from "@/components/portal/theme-switcher";
import { InsightCard } from "@/components/portal/insight-card";
import { ActionCard } from "@/components/portal/action-card";
import { ArrowIcon } from "@/components/icons";
import { actionsForTheme } from "@/lib/portal-actions";

type Props = { params: Promise<{ locale: string; id: string }> };

export function generateStaticParams() {
  return themes.flatMap((t) =>
    ["en", "es"].map((locale) => ({ locale, id: t.key })),
  );
}

export default async function ThemeDetailPage({ params }: Props) {
  const { locale, id } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);

  const theme = themes.find((t) => t.key === id);
  if (!theme) notFound();
  const key = theme.key as ThemeKey;
  const series = themeSeries(key);
  const subs = subThemesByTheme[key] ?? [];
  const questions = lowestQuestionsByTheme[key] ?? [];
  const trendLabel =
    theme.trend === "up"
      ? "Slight increase"
      : theme.trend === "down"
        ? "Slight decrease"
        : "Steady";

  return (
    <div className="px-6 lg:px-10 py-7 lg:py-9 space-y-6">
      <Link
        href={`/${locale}/portal/themes`}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors rise"
      >
        <ArrowIcon className="size-4 rotate-180" />
        All themes
      </Link>

      <header className="grid lg:grid-cols-[1fr_auto] gap-6 items-end rise rise-1">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            Theme detail
          </p>
          <h1 className="mt-1 text-3xl lg:text-4xl tracking-tight font-semibold">
            <span className="font-serif italic text-primary">{theme.name}</span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs">
              <span className="size-1.5 rounded-full bg-accent animate-pulse-soft" />
              Six-month trend · {trendLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs">
              Your group · {session.team}
            </span>
          </div>
        </div>
        <div className="w-full sm:w-72">
          <ThemeSwitcher
            current={key}
            items={themes.map((t) => ({ key: t.key, name: t.name }))}
            basePath={`/${locale}/portal/themes`}
          />
        </div>
      </header>

      <div className="rise rise-2">
        <InsightCard
          tone="dark"
          eyebrow={`Headline · ${theme.delta >= 0 ? "Up" : "Down"} ${Math.abs(theme.delta).toFixed(1)}%`}
          title={
            <>
              Your group is{" "}
              <span className="font-serif italic">
                {theme.group > theme.org ? "ahead of" : "behind"}
              </span>{" "}
              the org by {Math.abs(theme.group - theme.org).toFixed(2)} pts.
            </>
          }
          body={
            theme.delta < 0
              ? "We've isolated the questions driving the dip below. The model will surface a related prompt to your group this week."
              : "Trending in the right direction. Keep an eye on the lowest-scoring questions to make sure the gain holds."
          }
          metric={{
            label: theme.name,
            value: theme.group,
            format: "decimal2",
            delta: ((theme.group - theme.org) / theme.org) * 100,
          }}
          spark={series.slice(-32).map((s) => s.you)}
        />
      </div>

      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5 rise rise-3">
        <div className="rounded-3xl border border-border bg-surface p-5 lg:p-6">
          <header className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Trend
              </p>
              <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
                7-day moving average
              </h2>
            </div>
            <PeriodSelector defaultValue="6M" />
          </header>
          <ThemeLineChart
            data={series}
            series={[
              { key: "you", label: "Your group", color: "#ff6b5b" },
              { key: "org", label: "Organization", color: "#0f1117", dashed: true },
            ]}
          />
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 lg:p-6">
          <header className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              All themes
            </p>
            <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
              Org vs your group
            </h2>
          </header>
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1.5 text-xs">
            <div />
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted text-right">
              Org
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted text-right">
              Group
            </p>
            {themes.map((t) => {
              const isCurrent = t.key === key;
              return (
                <div key={t.key} className="contents">
                  <Link
                    href={`/${locale}/portal/themes/${t.key}`}
                    className={`truncate text-sm py-1 hover:text-primary transition-colors ${
                      isCurrent ? "font-semibold text-foreground" : "text-foreground/80"
                    }`}
                  >
                    {isCurrent && (
                      <span aria-hidden className="text-primary mr-1">
                        ›
                      </span>
                    )}
                    {t.name}
                  </Link>
                  <span
                    className={`text-[11px] font-mono tabular-nums px-2 py-1 rounded text-center justify-self-end min-w-[44px] ${scoreCellTone(t.org)}`}
                  >
                    {t.org.toFixed(2)}
                  </span>
                  <span
                    className={`text-[11px] font-mono tabular-nums px-2 py-1 rounded text-center justify-self-end min-w-[44px] ${scoreCellTone(t.group)}`}
                  >
                    {t.group.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ThemeActionsSection locale={locale} themeKey={key} themeName={theme.name} />

      <section className="grid lg:grid-cols-[1.2fr_1fr] gap-5 rise rise-4">
        <div className="rounded-3xl border border-border bg-surface p-5 lg:p-6">
          <header className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              Lowest scoring questions
            </p>
            <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
              Where to look first
            </h2>
          </header>
          {questions.length ? (
            <ul className="divide-y divide-border">
              {questions.map((q) => (
                <li
                  key={q.q}
                  className="grid grid-cols-[1fr_auto] gap-4 py-2.5 items-center"
                >
                  <p className="text-sm leading-snug">{q.q}</p>
                  <span
                    className={`text-xs font-mono tabular-nums px-2 py-1 rounded ${
                      q.avg < 3
                        ? "bg-rose-100 text-foreground"
                        : q.avg < 3.5
                          ? "bg-amber-100 text-foreground"
                          : "bg-warm/60 text-foreground"
                    }`}
                  >
                    {q.avg.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              No notable low-scoring questions in this theme.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 lg:p-6">
          <header className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              Sub-theme comparison
            </p>
            <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
              You vs the org
            </h2>
          </header>
          <SubThemeRadar data={subs} />
        </div>
      </section>
    </div>
  );
}

function ThemeActionsSection({
  locale,
  themeKey,
  themeName,
}: {
  locale: string;
  themeKey: ThemeKey;
  themeName: string;
}) {
  const items = actionsForTheme(themeKey);
  if (!items.length) return null;
  return (
    <section className="rise rise-4">
      <header className="mb-3 flex items-baseline justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            From signal to action
          </p>
          <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
            What we&rsquo;re doing about {themeName.toLowerCase()}
          </h2>
        </div>
        <Link
          href={`/${locale}/portal/actions`}
          className="text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          All actions
          <ArrowIcon className="size-4" />
        </Link>
      </header>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.slice(0, 3).map((a) => (
          <ActionCard key={a.id} action={a} href={`/${locale}/portal/actions/${a.id}`} />
        ))}
      </div>
    </section>
  );
}
