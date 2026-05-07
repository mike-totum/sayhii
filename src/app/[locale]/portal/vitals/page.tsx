import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { vitals, sparkSeries } from "@/lib/portal-data";
import { VitalsAreaChart } from "@/components/portal/charts/line";
import { InsightCard } from "@/components/portal/insight-card";
import { Sparkline } from "@/components/portal/sparkline";
import { AnimatedNumber } from "@/components/portal/animated-number";
import { PeriodSelector } from "@/components/portal/period-selector";

type Props = { params: Promise<{ locale: string }> };

const months = [
  "Jul 25", "Aug 25", "Sep 25", "Oct 25", "Nov 25", "Dec 25",
  "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26",
];
const series = months.map((m, i) => ({
  month: m,
  resources: 4.4 + Math.sin(i / 3) * 0.15,
  demands: 3.0 + Math.sin(i / 2.4) * 0.5 + (i > 7 ? 0.6 : 0),
  balance: 3.5 - Math.cos(i / 4) * 0.4 + (i > 4 ? -0.1 : 0.2),
}));

const COLORS: Record<string, string> = {
  resources: "#7da88a",
  demands: "#a8c5da",
  balance: "#ff6b5b",
};

export default async function VitalsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);

  // Find the vital that's diverging most from org as the headline
  const diverging = [...vitals].sort(
    (a, b) => Math.abs(b.yourScore - b.orgScore) - Math.abs(a.yourScore - a.orgScore),
  )[0];

  return (
    <div className="px-6 lg:px-10 py-7 lg:py-9 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 rise">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            Your vitals
          </p>
          <h1 className="mt-1 text-3xl lg:text-4xl tracking-tight font-semibold">
            Three things you{" "}
            <span className="font-serif italic text-primary">can&rsquo;t fake</span>.
          </h1>
          <p className="mt-2 text-muted max-w-2xl leading-relaxed text-sm">
            Vitals impact your ability to perform over time. Stress, bandwidth,
            and balance are interconnected — measuring all three keeps the
            picture honest.
          </p>
        </div>
      </header>

      <div className="rise rise-1">
        <InsightCard
          tone="dark"
          eyebrow="This week's signal"
          title={
            <>
              Your{" "}
              <span className="font-serif italic">
                {diverging.label.toLowerCase()}
              </span>{" "}
              is {diverging.yourScore > diverging.orgScore ? "above" : "below"}{" "}
              the org by{" "}
              {Math.abs(diverging.yourScore - diverging.orgScore).toFixed(1)} pts.
            </>
          }
          body={
            diverging.yourScore < diverging.orgScore
              ? "Most teams in sayhii-demo report similar pressure this quarter. The system has surfaced two next-step prompts to help isolate the cause."
              : "You're doing better than average — keep an eye on the team around you and share what's working."
          }
          metric={{
            label: diverging.label,
            value: diverging.yourScore,
            format: "decimal2",
            delta: ((diverging.yourScore - diverging.orgScore) / diverging.orgScore) * 100,
          }}
          spark={sparkSeries(diverging.label.length, diverging.yourScore, 0.32)}
        />
      </div>

      <section className="rise rise-2 grid md:grid-cols-3 gap-4">
        {vitals.map((v, i) => {
          const accent = COLORS[v.key] ?? "#ff6b5b";
          return (
            <article
              key={v.key}
              className="rounded-3xl border border-border bg-surface p-5 lg:p-6 flex flex-col gap-4"
            >
              <header>
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                  {v.label}
                </p>
                <p className="mt-2 text-sm text-muted leading-relaxed">{v.blurb}</p>
              </header>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                    You
                  </p>
                  <p
                    className="mt-2 text-2xl tracking-tight font-semibold"
                    style={{ color: accent }}
                  >
                    {v.yourGrade}
                  </p>
                  <p className="mt-1 text-xs font-mono tabular-nums text-muted">
                    <AnimatedNumber value={v.yourScore} format="decimal2" />
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                    Org
                  </p>
                  <p className="mt-2 text-2xl tracking-tight font-semibold text-foreground/80">
                    {v.orgGrade}
                  </p>
                  <p className="mt-1 text-xs font-mono tabular-nums text-muted">
                    <AnimatedNumber value={v.orgScore} format="decimal2" />
                  </p>
                </div>
              </div>

              <div className="-mx-1">
                <Sparkline
                  data={sparkSeries(i + 21, v.yourScore, 0.28, 30)}
                  color={accent}
                  width={400}
                  height={44}
                />
              </div>

              <p className="text-[11px] text-muted inline-flex items-center gap-1">
                <span
                  className={
                    v.trend === "up"
                      ? "text-accent"
                      : v.trend === "down"
                        ? "text-primary"
                        : "text-muted"
                  }
                >
                  {v.trend === "up" ? "↑" : v.trend === "down" ? "↓" : "—"}
                </span>
                {v.trend === "up" && "Slight increase"}
                {v.trend === "down" && "Slight decrease"}
                {v.trend === "steady" && "Steady"} · last 6 months
              </p>
            </article>
          );
        })}
      </section>

      <section className="rise rise-3 rounded-3xl border border-border bg-surface p-5 lg:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              Your vitals over time
            </p>
            <h2 className="mt-0.5 text-xl tracking-tight font-semibold">
              The last twelve months
            </h2>
          </div>
          <PeriodSelector defaultValue="1Y" />
        </header>
        <VitalsAreaChart data={series} />
      </section>
    </div>
  );
}
