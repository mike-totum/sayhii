import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import {
  orgOverview,
  registrationTimeline,
  themes,
  orgUsersSample,
} from "@/lib/portal-data";
import { NumberTile } from "@/components/portal/grade-tile";
import { ThemeLineChart } from "@/components/portal/charts/line";
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

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Admin · overview
        </p>
        <h1 className="mt-2 text-4xl lg:text-5xl tracking-tight font-semibold">
          <span className="font-serif italic text-primary">sayhii-demo</span>{" "}
          at a glance.
        </h1>
        <p className="mt-3 text-muted max-w-2xl leading-relaxed">
          A live read of the whole organization. Adoption, participation,
          and the themes moving most.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <NumberTile label="Expected users" value={String(orgOverview.expectedUsers)} />
        <NumberTile
          label="Confirmed users"
          value={String(orgOverview.confirmedUsers)}
          tone="accent"
        />
        <NumberTile
          label="Participation"
          value={`${orgOverview.participationRate}%`}
          tone="primary"
        />
        <NumberTile
          label="Questions answered"
          value={`${(orgOverview.questionsAnswered / 1000).toFixed(0)}K`}
          sub="Across the last 12 months"
        />
        <NumberTile
          label="Questions skipped"
          value={`${(orgOverview.questionsSkipped / 1000).toFixed(0)}K`}
          sub="Skip rate informs adaptive prompts"
        />
      </section>

      <section className="rounded-3xl border border-border bg-surface p-6 lg:p-8">
        <header className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Question participation
            </p>
            <h2 className="mt-1 text-2xl tracking-tight font-semibold">
              Answered vs skipped, weekly
            </h2>
          </div>
        </header>
        <ThemeLineChart
          data={participationData}
          series={[
            { key: "answered", label: "Answered", color: "#ff6b5b" },
            { key: "skipped", label: "Skipped", color: "#a8c5da" },
          ]}
        />
      </section>

      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="rounded-3xl border border-border bg-surface p-6 lg:p-8">
          <header className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Themes
              </p>
              <h2 className="mt-1 text-2xl tracking-tight font-semibold">
                Top movers, last 6 months
              </h2>
            </div>
            <Link
              href={`/${locale}/portal/admin/comparison`}
              className="text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              Compare departments
              <ArrowIcon className="size-4" />
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {[...themes]
              .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
              .slice(0, 6)
              .map((t) => {
                const positive = t.delta >= 0;
                return (
                  <li
                    key={t.key}
                    className="grid grid-cols-[1fr_auto_auto] gap-6 items-center py-3"
                  >
                    <span className="font-medium">{t.name}</span>
                    <span className="text-sm font-mono text-muted tabular-nums">
                      {t.org.toFixed(2)}
                    </span>
                    <span
                      className={`inline-flex items-center justify-center min-w-[72px] rounded-full text-xs font-mono px-2.5 py-1 ${
                        positive
                          ? "bg-accent-soft text-accent border border-accent/30"
                          : "bg-warm/60 text-primary border border-primary/30"
                      }`}
                    >
                      {positive ? "↑" : "↓"} {Math.abs(t.delta).toFixed(1)}%
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 lg:p-8">
          <header className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Users
              </p>
              <h2 className="mt-1 text-2xl tracking-tight font-semibold">
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
                <li key={u.email} className="flex items-center gap-3 py-3">
                  <span className="size-8 rounded-full bg-warm flex items-center justify-center text-xs font-semibold text-foreground/80">
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
    </div>
  );
}
