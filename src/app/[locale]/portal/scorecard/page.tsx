import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { scorecard, themes } from "@/lib/portal-data";
import { GradeTile, NumberTile } from "@/components/portal/grade-tile";
import { MoversBar } from "@/components/portal/charts/bar";

type Props = { params: Promise<{ locale: string }> };

export default async function ScorecardPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {session.role === "admin" ? "Organizational scorecard" : "Your scorecard"}
        </p>
        <h1 className="mt-2 text-4xl tracking-tight font-semibold">
          Where the org{" "}
          <span className="font-serif italic text-primary">stands</span> right
          now.
        </h1>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NumberTile
          label="Organizational wellness"
          value={`${scorecard.wellness.toFixed(1)}%`}
          sub="Steady · last 6 months"
          tone="accent"
        />
        <NumberTile
          label="Overall engagement"
          value={`${scorecard.engagement.toFixed(1)}%`}
          sub="Steady · last 6 months"
        />
        <NumberTile
          label="Culture"
          value={`${scorecard.culture.toFixed(1)}%`}
          sub="Steady · last 6 months"
        />
      </section>

      <section className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <div className="rounded-3xl border border-border bg-surface p-6 lg:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Vitals</p>
          <h2 className="mt-1 text-2xl tracking-tight font-semibold">
            Resources, demands, balance
          </h2>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            {[
              { name: "Resources", v: scorecard.resources },
              { name: "Demands", v: scorecard.demands },
              { name: "Work-life balance", v: scorecard.balance },
            ].map((row) => (
              <div
                key={row.name}
                className="rounded-2xl border border-border bg-background p-5"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {row.name}
                </p>
                <p className="mt-3 text-3xl tracking-tight font-semibold">
                  {row.v.grade}
                </p>
                <p className="mt-1 text-sm font-mono text-muted">
                  {row.v.score.toFixed(1)}%
                </p>
                <p className="mt-2 text-xs text-muted">
                  {row.v.trend === "up" && "↑ Slight increase"}
                  {row.v.trend === "down" && "↓ Slight decrease"}
                  {row.v.trend === "steady" && "— Steady"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 lg:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Top 5 movers
          </p>
          <h2 className="mt-1 text-2xl tracking-tight font-semibold">
            Last 6 months
          </h2>
          <div className="mt-6">
            <MoversBar
              data={scorecard.movers.map((m) => ({ theme: m.theme, delta: m.delta }))}
            />
          </div>
          <p className="mt-6 text-xs text-muted">
            {scorecard.questionsAnswered.toLocaleString()} questions answered.
          </p>
        </div>
      </section>

      <section>
        <header className="flex items-baseline justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Themes
            </p>
            <h2 className="mt-1 text-2xl tracking-tight font-semibold">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
