import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { ArrowIcon } from "@/components/icons";
import { MetricTile } from "@/components/portal/metric-tile";
import { InsightCard } from "@/components/portal/insight-card";
import { GradeTile, TrendDot } from "@/components/portal/grade-tile";
import { MoversBar } from "@/components/portal/charts/bar";
import { ActionCard } from "@/components/portal/action-card";
import {
  scorecard,
  themes,
  vitals,
  dailyQuestion,
  sparkSeries,
} from "@/lib/portal-data";
import { actions } from "@/lib/portal-actions";

type Props = { params: Promise<{ locale: string }> };

export default async function PortalHome({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);

  const isAdmin = session.role === "admin";
  const top = scorecard.movers
    .slice()
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
  const topTheme = themes.find((t) => t.name.startsWith(top.theme.split(" ")[0]));

  return (
    <div className="px-6 lg:px-10 py-7 lg:py-9 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 rise">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            {isAdmin ? "Organization" : "Your sayhii"}
          </p>
          <h1 className="mt-1 text-3xl lg:text-4xl tracking-tight font-semibold">
            Good {timeOfDay()},{" "}
            <span className="font-serif italic text-primary">
              {session.name.split(" ")[0]}
            </span>
            .
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/${locale}/portal/scorecard`}
            className="inline-flex items-center gap-2 h-10 rounded-full border border-border bg-surface px-4 text-sm font-medium hover:border-foreground/30 transition-colors"
          >
            Open scorecard
            <ArrowIcon className="size-4" />
          </Link>
        </div>
      </header>

      <div className="rise rise-1">
        <InsightCard
          eyebrow={`This week's signal · ${top.trend === "up" ? "Trending up" : "Needs attention"}`}
          title={
            <>
              <span className="font-serif italic">{top.theme}</span> moved{" "}
              {top.delta >= 0 ? "+" : ""}
              {top.delta.toFixed(1)}%
              <br className="hidden sm:block" />
              {top.trend === "up"
                ? " — keep doing what you're doing."
                : " — worth a 1:1 this week."}
            </>
          }
          body={
            isAdmin
              ? `Concentrated in two groups. Open the theme to see the lowest-scoring questions and which managers should know.`
              : `Your team is moving faster than the org average. The next adaptive prompt will probe where the change is coming from.`
          }
          metric={{
            label: top.theme,
            value: topTheme?.org ? topTheme.org * 20 : 80,
            format: "percent1",
            delta: top.delta,
          }}
          spark={sparkSeries(
            top.theme.length,
            topTheme?.org ?? 4.0,
            0.18,
          )}
          cta={{
            label: "Open theme",
            href: `/${locale}/portal/themes/${
              topTheme?.key ?? "recognition"
            }`,
          }}
        />
      </div>

      <DailyCheckIn className="rise rise-2" />

      <ThisWeekActions locale={locale} />

      <section className="rise rise-3">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricTile
            label="Org wellness"
            value={scorecard.wellness}
            format="percent1"
            delta={1.2}
            spark={sparkSeries(11, 4.0, 0.16)}
            sub="Steady · last 6 months"
            tone="accent"
          />
          <MetricTile
            label="Engagement"
            value={scorecard.engagement}
            format="percent1"
            delta={0.4}
            spark={sparkSeries(22, 4.2, 0.14)}
            sub="vs prior 6 months"
          />
          <MetricTile
            label="Culture"
            value={scorecard.culture}
            format="percent1"
            delta={-0.6}
            spark={sparkSeries(33, 3.6, 0.18)}
            sub="vs prior 6 months"
          />
          <MetricTile
            label="Questions answered"
            value={scorecard.questionsAnswered}
            delta={6.1}
            spark={sparkSeries(44, 4.0, 0.22)}
            sub="In the last 12 months"
          />
        </div>
      </section>

      <section className="grid lg:grid-cols-[1.3fr_1fr] gap-5 rise rise-4">
        <div className="rounded-3xl border border-border bg-surface p-5 lg:p-6">
          <header className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Vitals
              </p>
              <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
                {isAdmin ? "Organization vitals" : "Your vitals"}
              </h2>
            </div>
            <Link
              href={`/${locale}/portal/vitals`}
              className="text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              See trend
              <ArrowIcon className="size-4" />
            </Link>
          </header>
          <div className="grid sm:grid-cols-3 gap-3">
            {vitals.map((v, i) => (
              <div
                key={v.key}
                className="rounded-2xl border border-border bg-background p-4"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                  {v.label}
                </p>
                <p className="mt-2 text-2xl tracking-tight font-semibold">
                  {isAdmin ? v.orgGrade : v.yourGrade}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-[11px] text-muted inline-flex items-center gap-1">
                    <TrendDot trend={v.trend} />
                    {v.trend === "up" && "Slight increase"}
                    {v.trend === "down" && "Slight decrease"}
                    {v.trend === "steady" && "Steady"}
                  </p>
                </div>
                <div className="mt-2 -mx-1">
                  <Mini
                    seed={i + 7}
                    base={v.yourScore}
                    color={
                      v.key === "resources"
                        ? "#7da88a"
                        : v.key === "demands"
                          ? "#a8c5da"
                          : "#ff6b5b"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 lg:p-6">
          <header className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              Top movers
            </p>
            <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
              Last 6 months
            </h2>
          </header>
          <MoversBar
            data={scorecard.movers.map((m) => ({ theme: m.theme, delta: m.delta }))}
          />
        </div>
      </section>

      <section className="rise rise-5">
        <header className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              Themes
            </p>
            <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
              How each theme is doing
            </h2>
          </div>
          <Link
            href={`/${locale}/portal/themes`}
            className="text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            All themes
            <ArrowIcon className="size-4" />
          </Link>
        </header>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {themes.slice(0, 8).map((t) => (
            <Link
              key={t.key}
              href={`/${locale}/portal/themes/${t.key}`}
              className="block hover:-translate-y-0.5 transition-transform"
            >
              <GradeTile
                theme={t.name}
                grade={t.grade}
                score={t.org * 20}
                trend={t.trend}
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function ThisWeekActions({ locale }: { locale: string }) {
  const open = actions
    .filter((a) => a.status === "open" || a.status === "in_progress")
    .slice(0, 3);
  if (!open.length) return null;
  return (
    <section className="rise rise-3">
      <header className="mb-3 flex items-baseline justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            Action queue
          </p>
          <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
            What to do this week
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
        {open.map((a) => (
          <ActionCard key={a.id} action={a} href={`/${locale}/portal/actions/${a.id}`} />
        ))}
      </div>
    </section>
  );
}

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function Mini({ seed, base, color }: { seed: number; base: number; color: string }) {
  // Inline SVG sparkline to keep the home dense + lightweight
  const data = sparkSeries(seed, base, 0.22);
  const width = 200;
  const height = 26;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(0.001, max - min);
  const stepX = width / (data.length - 1);
  const path = data
    .map((v, i) => {
      const x = i * stepX;
      const y = 4 + (height - 8) - ((v - min) / range) * (height - 8);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-7">
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DailyCheckIn({ className = "" }: { className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-border bg-surface p-5 lg:p-6 grid lg:grid-cols-[1fr_auto] gap-4 items-center ${className}`}
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted inline-flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-primary animate-pulse-soft" />
          Today&rsquo;s check-in · 3 seconds
        </p>
        <p className="mt-2 text-xl lg:text-2xl tracking-tight font-medium leading-snug max-w-2xl">
          {dailyQuestion.text}
        </p>
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium">Agree</span>
          <div className="flex items-center gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <button
                key={i}
                className={`size-5 rounded-full border-2 transition-all ${
                  i === 0
                    ? "border-primary bg-primary shadow-[0_0_0_3px_rgba(255,107,91,0.18)]"
                    : "border-foreground/30 hover:border-foreground/60"
                }`}
                aria-label={
                  i === 0 ? "Agree" : i === 4 ? "Disagree" : `Option ${i + 1}`
                }
              />
            ))}
          </div>
          <span className="text-sm font-medium">Disagree</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button className="text-sm text-muted underline-offset-4 hover:underline hover:text-foreground transition-colors">
          Skip
        </button>
        <p className="text-xs text-muted">Anonymous · sample size 5+</p>
      </div>
    </section>
  );
}
