import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { scorecard, themes, sparkSeries } from "@/lib/portal-data";
import { GradeTile } from "@/components/portal/grade-tile";
import { MoversBar } from "@/components/portal/charts/bar";
import { MetricTile } from "@/components/portal/metric-tile";
import { InsightCard } from "@/components/portal/insight-card";
import { Sparkline } from "@/components/portal/sparkline";
import { AnimatedNumber } from "@/components/portal/animated-number";

type Props = { params: Promise<{ locale: string }> };

export default async function ScorecardPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);

  const isAdmin = session.role === "admin";
  const top = scorecard.movers
    .slice()
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];

  return (
    <div className="px-6 lg:px-10 py-7 lg:py-9 space-y-6">
      <header className="rise">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
          {isAdmin ? "Organizational scorecard" : "Your scorecard"}
        </p>
        <h1 className="mt-1 text-3xl lg:text-4xl tracking-tight font-semibold">
          Where the org{" "}
          <span className="font-serif italic text-primary">stands</span> right
          now.
        </h1>
      </header>

      <div className="rise rise-1">
        <InsightCard
          tone="dark"
          eyebrow="The story · last 6 months"
          title={
            <>
              Wellness held steady at{" "}
              <span className="font-serif italic">
                {scorecard.wellness.toFixed(1)}%
              </span>{" "}
              while {top.theme.toLowerCase()} moved{" "}
              {top.delta >= 0 ? "+" : ""}
              {top.delta.toFixed(1)}%.
            </>
          }
          body={
            top.delta < 0
              ? "The dip is concentrated in two groups. The next adaptive prompt will probe the underlying questions to confirm where to focus."
              : "The lift is broad-based. Worth a callout in the next all-hands."
          }
          metric={{
            label: "Wellness",
            value: scorecard.wellness,
            format: "percent1",
            delta: 1.2,
          }}
          spark={sparkSeries(99, 4.0, 0.16, 32)}
        />
      </div>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 rise rise-2">
        <MetricTile
          label="Organizational wellness"
          value={scorecard.wellness}
          format="percent1"
          delta={1.2}
          spark={sparkSeries(11, 4.0, 0.16)}
          tone="accent"
        />
        <MetricTile
          label="Overall engagement"
          value={scorecard.engagement}
          format="percent1"
          delta={0.4}
          spark={sparkSeries(22, 4.2, 0.14)}
        />
        <MetricTile
          label="Culture"
          value={scorecard.culture}
          format="percent1"
          delta={-0.6}
          spark={sparkSeries(33, 3.6, 0.18)}
        />
      </section>

      <section className="grid lg:grid-cols-[1.2fr_1fr] gap-5 rise rise-3">
        <div className="rounded-3xl border border-border bg-surface p-5 lg:p-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            Vitals
          </p>
          <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
            Resources, demands, balance
          </h2>
          <div className="mt-5 grid sm:grid-cols-3 gap-3">
            {[
              { name: "Resources", v: scorecard.resources, color: "#7da88a", seed: 1 },
              { name: "Demands", v: scorecard.demands, color: "#a8c5da", seed: 2 },
              { name: "Work-life balance", v: scorecard.balance, color: "#ff6b5b", seed: 3 },
            ].map((row) => (
              <div
                key={row.name}
                className="rounded-2xl border border-border bg-background p-4 flex flex-col gap-3"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                  {row.name}
                </p>
                <p className="text-2xl tracking-tight font-semibold">
                  {row.v.grade}
                </p>
                <p className="text-xs font-mono tabular-nums text-muted">
                  <AnimatedNumber value={row.v.score} format="percent1" />
                </p>
                <Sparkline
                  data={sparkSeries(row.seed + 50, 4.0, 0.18)}
                  color={row.color}
                  width={220}
                  height={28}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 lg:p-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            Top 5 movers
          </p>
          <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
            Last 6 months
          </h2>
          <div className="mt-5">
            <MoversBar
              data={scorecard.movers.map((m) => ({ theme: m.theme, delta: m.delta }))}
            />
          </div>
          <p className="mt-5 text-xs text-muted">
            {scorecard.questionsAnswered.toLocaleString()} questions answered.
          </p>
        </div>
      </section>

      <section className="rise rise-4">
        <header className="flex items-baseline justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              Themes
            </p>
            <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
              All thirteen themes
            </h2>
          </div>
          <Link
            href={`/${locale}/portal/themes`}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Browse all
          </Link>
        </header>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {themes.map((t) => (
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
