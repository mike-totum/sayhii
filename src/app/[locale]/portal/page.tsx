import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { ArrowIcon } from "@/components/icons";
import { GradeTile, NumberTile, TrendDot } from "@/components/portal/grade-tile";
import { MoversBar } from "@/components/portal/charts/bar";
import {
  scorecard,
  themes,
  vitals,
  dailyQuestion,
} from "@/lib/portal-data";

type Props = { params: Promise<{ locale: string }> };

export default async function PortalHome({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);

  const isAdmin = session.role === "admin";

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {isAdmin ? "Organization scorecard" : "Your scorecard"}
          </p>
          <h1 className="mt-2 text-4xl lg:text-5xl tracking-tight font-semibold">
            Good {timeOfDay()},{" "}
            <span className="font-serif italic text-primary">
              {session.name.split(" ")[0]}
            </span>
            .
          </h1>
          <p className="mt-2 text-muted">
            {isAdmin
              ? "Three signals moved this week. Here's where to look first."
              : "Your three-second check-in is ready."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/${locale}/portal/scorecard`}
            className="inline-flex items-center gap-2 h-11 rounded-full border border-border bg-surface px-5 text-sm font-medium hover:border-foreground/30 transition-colors"
          >
            Open scorecard
            <ArrowIcon className="size-4" />
          </Link>
        </div>
      </header>

      <DailyCheckIn />

      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-4">
          Top metrics
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
      </section>

      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="rounded-3xl border border-border bg-surface p-6 lg:p-8">
          <header className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Vitals
              </p>
              <h2 className="mt-1 text-2xl tracking-tight font-semibold">
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
          <div className="grid sm:grid-cols-3 gap-4">
            {vitals.map((v) => (
              <div
                key={v.key}
                className="rounded-2xl border border-border bg-background p-5"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {v.label}
                </p>
                <p className="mt-3 text-2xl tracking-tight font-semibold">
                  {isAdmin ? v.orgGrade : v.yourGrade}
                </p>
                <p className="mt-1 text-xs text-muted inline-flex items-center gap-1">
                  <TrendDot trend={v.trend} />
                  {v.trend === "up" && "Slight increase"}
                  {v.trend === "down" && "Slight decrease"}
                  {v.trend === "steady" && "Steady"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 lg:p-8">
          <header className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Top movers
              </p>
              <h2 className="mt-1 text-2xl tracking-tight font-semibold">
                Last 6 months
              </h2>
            </div>
          </header>
          <MoversBar
            data={scorecard.movers.map((m) => ({ theme: m.theme, delta: m.delta }))}
          />
        </div>
      </section>

      <section>
        <header className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Themes
            </p>
            <h2 className="mt-1 text-2xl tracking-tight font-semibold">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function DailyCheckIn() {
  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 lg:p-8 grid lg:grid-cols-[1fr_auto] gap-6 items-center">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Today&rsquo;s check-in · 3 seconds
        </p>
        <p className="mt-3 text-2xl lg:text-3xl tracking-tight font-medium leading-snug max-w-2xl">
          {dailyQuestion.text}
        </p>
        <div className="mt-5 flex items-center gap-3 flex-wrap">
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
          <button className="ml-auto sm:ml-0 sm:hidden text-sm text-muted hover:text-foreground transition-colors">
            Skip
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button className="text-sm text-muted underline-offset-4 hover:underline hover:text-foreground transition-colors hidden sm:inline">
          Skip
        </button>
        <p className="text-xs text-muted">
          Anonymous · aggregated at sample size 5+
        </p>
      </div>
    </section>
  );
}
