import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import {
  orgOverview,
  registrationTimeline,
  themes,
  orgUsersSample,
  scorecard,
  sparkSeries,
} from "@/lib/portal-data";
import { MetricTile } from "@/components/portal/metric-tile";
import { InsightCard } from "@/components/portal/insight-card";
import { ThemeLineChart } from "@/components/portal/charts/line";
import { PeriodSelector } from "@/components/portal/period-selector";
import { ArrowIcon } from "@/components/icons";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminOverviewPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);
  if (session.role !== "admin") redirect(`/${locale}/portal`);

  const participationData = registrationTimeline.map((r) => ({
    date: r.week,
    answered: r.answered,
    skipped: r.skipped,
  }));

  const sortedMovers = [...themes]
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 6);

  const headlineMover = sortedMovers[0];

  return (
    <div className="px-6 lg:px-10 py-7 lg:py-9 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 rise">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            Admin · overview
          </p>
          <h1 className="mt-1 text-3xl lg:text-4xl tracking-tight font-semibold">
            <span className="font-serif italic text-primary">sayhii-demo</span>{" "}
            this week.
          </h1>
        </div>
        <div className="flex gap-2 items-center">
          <PeriodSelector defaultValue="6M" />
          <Link
            href={`/${locale}/portal/admin/comparison`}
            className="inline-flex items-center gap-2 h-10 rounded-full border border-border bg-surface px-4 text-sm font-medium hover:border-foreground/30 transition-colors"
          >
            Compare departments
            <ArrowIcon className="size-4" />
          </Link>
        </div>
      </header>

      <div className="rise rise-1">
        <InsightCard
          eyebrow="Headline · last 6 months"
          title={
            <>
              <span className="font-serif italic">{headlineMover.name}</span>{" "}
              moved {headlineMover.delta >= 0 ? "+" : ""}
              {headlineMover.delta.toFixed(1)}%
            </>
          }
          body={
            headlineMover.delta < 0
              ? "Concentrated in two groups. Open the theme to see the lowest-scoring questions and which managers should know."
              : "Trending in the right direction across both departments. Worth a callout in the next all-hands."
          }
          metric={{
            label: headlineMover.name,
            value: headlineMover.org * 20,
            format: "percent1",
            delta: headlineMover.delta,
          }}
          spark={sparkSeries(headlineMover.name.length, headlineMover.org, 0.18, 32)}
          cta={{
            label: "Open theme",
            href: `/${locale}/portal/themes/${headlineMover.key}`,
          }}
        />
      </div>

      <section className="rise rise-2">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <MetricTile
            label="Expected users"
            value={orgOverview.expectedUsers}
            spark={sparkSeries(1, 4.2, 0.04)}
            sub="Total invited"
          />
          <MetricTile
            label="Confirmed users"
            value={orgOverview.confirmedUsers}
            delta={0.0}
            spark={sparkSeries(2, 4.5, 0.06)}
            tone="accent"
          />
          <MetricTile
            label="Participation"
            value={orgOverview.participationRate}
            format="percent0"
            delta={2.1}
            spark={sparkSeries(3, 4.6, 0.08)}
            tone="primary"
          />
          <MetricTile
            label="Questions answered"
            value={orgOverview.questionsAnswered}
            delta={6.1}
            spark={sparkSeries(4, 4.2, 0.18)}
            sub="Past 12 months"
          />
          <MetricTile
            label="Skip rate"
            value={Math.round(
              (orgOverview.questionsSkipped /
                (orgOverview.questionsAnswered + orgOverview.questionsSkipped)) *
                100,
            )}
            format="percent0"
            delta={-1.4}
            deltaTone="good"
            spark={sparkSeries(5, 3.6, 0.18)}
            sub="Lower is better"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-5 lg:p-6 rise rise-3">
        <header className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              Question participation
            </p>
            <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
              Answered vs skipped, weekly
            </h2>
          </div>
          <PeriodSelector defaultValue="6M" />
        </header>
        <ThemeLineChart
          data={participationData}
          series={[
            { key: "answered", label: "Answered", color: "#ff6b5b" },
            { key: "skipped", label: "Skipped", color: "#a8c5da" },
          ]}
        />
      </section>

      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5 rise rise-4">
        <div className="rounded-3xl border border-border bg-surface p-5 lg:p-6">
          <header className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Top movers
              </p>
              <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
                Themes with the largest 6-month change
              </h2>
            </div>
            <Link
              href={`/${locale}/portal/admin/comparison`}
              className="text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              By department
              <ArrowIcon className="size-4" />
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {sortedMovers.map((t) => {
              const positive = t.delta >= 0;
              return (
                <li
                  key={t.key}
                  className="grid grid-cols-[1.5fr_120px_auto_auto] gap-4 items-center py-2.5"
                >
                  <Link
                    href={`/${locale}/portal/themes/${t.key}`}
                    className="font-medium hover:text-primary transition-colors truncate"
                  >
                    {t.name}
                  </Link>
                  <div className="hidden sm:block">
                    {/* mini per-row sparkline */}
                    <RowSpark seed={t.key.length} base={t.org} positive={positive} />
                  </div>
                  <span className="text-sm font-mono text-muted tabular-nums hidden sm:inline">
                    {t.org.toFixed(2)}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center min-w-[72px] rounded-full text-xs font-mono px-2.5 py-1 border ${
                      positive
                        ? "bg-accent-soft text-accent border-accent/30"
                        : "bg-warm/60 text-primary border-primary/30"
                    }`}
                  >
                    {positive ? "↑" : "↓"} {Math.abs(t.delta).toFixed(1)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 lg:p-6">
          <header className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                People
              </p>
              <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
                Recently joined
              </h2>
            </div>
            <Link
              href={`/${locale}/portal/admin/users`}
              className="text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              All users
              <ArrowIcon className="size-4" />
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {orgUsersSample.slice(0, 6).map((u) => {
              const initials = u.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("");
              return (
                <li key={u.email} className="flex items-center gap-3 py-2.5">
                  <span className="size-8 rounded-full bg-gradient-to-br from-warm to-warm/60 flex items-center justify-center text-xs font-semibold text-foreground/80">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted truncate">{u.email}</p>
                  </div>
                  <span className="ml-auto text-xs rounded-full bg-background border border-border px-2 py-0.5">
                    {u.role}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <p className="text-xs text-muted rise rise-5">
        {scorecard.questionsAnswered.toLocaleString()} questions answered to
        date · last refresh just now
      </p>
    </div>
  );
}

function RowSpark({ seed, base, positive }: { seed: number; base: number; positive: boolean }) {
  const data = sparkSeries(seed, base, 0.22, 24);
  const width = 100;
  const height = 22;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(0.001, max - min);
  const stepX = width / (data.length - 1);
  const path = data
    .map((v, i) => {
      const x = i * stepX;
      const y = 3 + (height - 6) - ((v - min) / range) * (height - 6);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-6">
      <path
        d={path}
        fill="none"
        stroke={positive ? "#7da88a" : "#ff6b5b"}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
