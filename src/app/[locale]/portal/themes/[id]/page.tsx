import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import {
  themes,
  themeSeries,
  subThemesByTheme,
  lowestQuestionsByTheme,
  type ThemeKey,
} from "@/lib/portal-data";
import { ThemeLineChart } from "@/components/portal/charts/line";
import { SubThemeRadar } from "@/components/portal/charts/radar";
import { ArrowIcon } from "@/components/icons";

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

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 space-y-8">
      <Link
        href={`/${locale}/portal/themes`}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowIcon className="size-4 rotate-180" />
        All themes
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Theme detail
          </p>
          <h1 className="mt-2 text-4xl lg:text-5xl tracking-tight font-semibold">
            <span className="font-serif italic text-primary">{theme.name}</span>
          </h1>
          <p className="mt-3 text-muted max-w-2xl leading-relaxed">
            How {theme.name.toLowerCase()} is trending across the org, your
            group, and what is moving the score.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Stat label="Org" value={theme.org.toFixed(2)} />
          <Stat label={session.role === "admin" ? "Best group" : "Your group"} value={theme.group.toFixed(2)} highlighted />
          <Stat
            label="6-month change"
            value={`${theme.delta >= 0 ? "+" : ""}${theme.delta.toFixed(1)}%`}
            tone={theme.delta >= 0 ? "good" : "bad"}
          />
        </div>
      </header>

      <section className="rounded-3xl border border-border bg-surface p-6 lg:p-8">
        <header className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Trend
            </p>
            <h2 className="mt-1 text-2xl tracking-tight font-semibold">
              7-day moving average
            </h2>
          </div>
        </header>
        <ThemeLineChart
          data={series}
          series={[
            { key: "you", label: "Your group", color: "#ff6b5b" },
            { key: "org", label: "Organization", color: "#0f1117", dashed: true },
          ]}
        />
      </section>

      <section className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <div className="rounded-3xl border border-border bg-surface p-6 lg:p-8">
          <header className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Lowest scoring questions
            </p>
            <h2 className="mt-1 text-2xl tracking-tight font-semibold">
              Where to look first
            </h2>
          </header>
          {questions.length ? (
            <ul className="divide-y divide-border">
              {questions.map((q) => (
                <li
                  key={q.q}
                  className="grid grid-cols-[1fr_auto] gap-4 py-3 items-center"
                >
                  <p className="text-sm leading-snug">{q.q}</p>
                  <span
                    className={`text-sm font-mono ${
                      q.avg < 3
                        ? "text-primary"
                        : q.avg < 3.5
                          ? "text-amber-700"
                          : "text-muted"
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

        <div className="rounded-3xl border border-border bg-surface p-6 lg:p-8">
          <header className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Sub-theme comparison
            </p>
            <h2 className="mt-1 text-2xl tracking-tight font-semibold">
              You vs the org
            </h2>
          </header>
          <SubThemeRadar data={subs} />
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  highlighted,
  tone,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
  tone?: "good" | "bad";
}) {
  const valueClass = tone === "good"
    ? "text-accent"
    : tone === "bad"
      ? "text-primary"
      : highlighted
        ? "text-primary"
        : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-3 min-w-[100px]">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className={`mt-1 text-2xl tracking-tight font-semibold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}
