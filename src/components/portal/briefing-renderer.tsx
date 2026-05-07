import Link from "next/link";
import {
  themes,
  themeSeries,
  subThemesByTheme,
  scoreCellTone,
  type ThemeKey,
} from "@/lib/portal-data";
import { ThemeLineChart } from "@/components/portal/charts/line";
import { SubThemeRadar } from "@/components/portal/charts/radar";
import { MoversBar } from "@/components/portal/charts/bar";
import { GradeTile } from "@/components/portal/grade-tile";
import { ArrowIcon } from "@/components/icons";
import { ActionCard } from "@/components/portal/action-card";
import { actions, getAction } from "@/lib/portal-actions";
import type { Block, Section } from "@/lib/portal-briefings";

export function BriefingSection({
  section,
  basePath,
  livePath,
}: {
  section: Section;
  basePath: string;
  livePath: string; // path back to the portal for "Open live data"
}) {
  return (
    <section id={section.id} className="space-y-4 scroll-mt-24">
      <h2 className="text-2xl lg:text-3xl tracking-tight font-semibold">
        {section.heading}
      </h2>
      <div className="space-y-5">
        {section.blocks.map((b, i) => (
          <BlockView key={i} block={b} basePath={basePath} livePath={livePath} />
        ))}
      </div>
    </section>
  );
}

function BlockView({
  block,
  basePath,
  livePath,
}: {
  block: Block;
  basePath: string;
  livePath: string;
}) {
  switch (block.kind) {
    case "h2":
      return <h2 className="text-2xl tracking-tight font-semibold">{block.text}</h2>;
    case "h3":
      return <h3 className="text-xl tracking-tight font-semibold mt-4">{block.text}</h3>;
    case "p":
      return (
        <p className="text-base leading-relaxed text-foreground/85">{block.text}</p>
      );
    case "lead":
      return (
        <p className="text-xl tracking-tight leading-snug text-foreground font-medium">
          {block.text}
        </p>
      );
    case "callout": {
      const toneMap: Record<string, string> = {
        primary: "bg-primary/5 border-primary/30 text-foreground",
        accent: "bg-accent-soft border-accent/30 text-foreground",
        warm: "bg-warm/60 border-primary/30 text-foreground",
      };
      return (
        <aside
          className={`rounded-2xl border-l-4 border-primary px-5 py-4 ${toneMap[block.tone] ?? toneMap.primary}`}
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            {block.eyebrow}
          </p>
          <p className="mt-1 text-base font-medium leading-snug">{block.body}</p>
        </aside>
      );
    }
    case "quote":
      return (
        <blockquote className="rounded-2xl border border-border bg-surface p-5 lg:p-6">
          <p className="text-xl font-serif italic leading-snug">
            &ldquo;{block.body}&rdquo;
          </p>
          {block.author && (
            <p className="mt-3 text-sm text-muted">— {block.author}</p>
          )}
        </blockquote>
      );
    case "list":
      return (
        <ul className="space-y-2 text-base text-foreground/85 leading-relaxed list-disc pl-6">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case "stat-row":
      return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {block.stats.map((s, i) => {
            const tone =
              s.tone === "accent"
                ? "bg-accent-soft border-accent/30"
                : s.tone === "primary"
                  ? "bg-foreground text-background border-foreground"
                  : "bg-surface border-border";
            const labelClass =
              s.tone === "primary" ? "text-background/60" : "text-muted";
            const subClass =
              s.tone === "primary" ? "text-background/70" : "text-muted";
            return (
              <div key={i} className={`rounded-2xl border p-5 ${tone}`}>
                <p
                  className={`text-[11px] uppercase tracking-[0.18em] ${labelClass}`}
                >
                  {s.label}
                </p>
                <p className="mt-2 text-3xl tracking-tight font-semibold tabular-nums">
                  {s.value}
                </p>
                {s.sub && <p className={`mt-1 text-xs ${subClass}`}>{s.sub}</p>}
              </div>
            );
          })}
        </div>
      );
    case "scorecard-tiles":
      return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {block.tiles.map((t) => (
            <GradeTile
              key={t.label}
              theme={t.label}
              grade={t.grade}
              score={t.score}
              trend={t.trend}
            />
          ))}
        </div>
      );
    case "theme-trend": {
      const series = themeSeries(block.theme);
      const theme = themes.find((t) => t.key === block.theme);
      return (
        <figure className="rounded-3xl border border-border bg-surface p-5 lg:p-6">
          <header className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Live · {theme?.name}
              </p>
              <h4 className="mt-0.5 text-lg tracking-tight font-semibold">
                7-day moving average
              </h4>
            </div>
            <Link
              href={`${livePath}/themes/${block.theme}`}
              className="text-xs font-medium text-muted hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              Open live
              <ArrowIcon className="size-3.5" />
            </Link>
          </header>
          <ThemeLineChart
            data={series}
            series={[
              { key: "you", label: "Your group", color: "#ff6b5b" },
              { key: "org", label: "Organization", color: "#0f1117", dashed: true },
            ]}
          />
          {block.caption && (
            <figcaption className="mt-3 text-xs text-muted">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }
    case "sub-theme-radar": {
      const subs = subThemesByTheme[block.theme] ?? [];
      const theme = themes.find((t) => t.key === block.theme);
      return (
        <figure className="rounded-3xl border border-border bg-surface p-5 lg:p-6">
          <header className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Live · {theme?.name} sub-themes
              </p>
              <h4 className="mt-0.5 text-lg tracking-tight font-semibold">
                You vs the org
              </h4>
            </div>
            <Link
              href={`${livePath}/themes/${block.theme}`}
              className="text-xs font-medium text-muted hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              Open live
              <ArrowIcon className="size-3.5" />
            </Link>
          </header>
          <SubThemeRadar data={subs} />
          {block.caption && (
            <figcaption className="mt-3 text-xs text-muted">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }
    case "movers":
      return (
        <figure className="rounded-3xl border border-border bg-surface p-5 lg:p-6">
          <header className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Live · top movers
              </p>
              <h4 className="mt-0.5 text-lg tracking-tight font-semibold">
                The themes that moved most
              </h4>
            </div>
          </header>
          <MoversBar data={block.data} />
        </figure>
      );
    case "heatmap":
      return (
        <figure className="rounded-3xl border border-border bg-surface p-5 lg:p-6 overflow-x-auto">
          <header className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
              Live · department comparison
            </p>
          </header>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-muted border-b border-border">
                <th className="px-3 py-2 font-medium">Group</th>
                {block.cols.map((c) => (
                  <th key={c} className="px-3 py-2 font-medium whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={row} className="border-b border-border last:border-0">
                  <td className="px-3 py-3 font-medium">{row}</td>
                  {block.values[r].map((v, c) => (
                    <td key={c} className="px-3 py-3">
                      <span
                        className={`inline-flex items-center justify-center min-w-[52px] rounded-lg px-2.5 py-1 font-mono text-xs ${scoreCellTone(v)}`}
                      >
                        {v.toFixed(2)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      );
    case "actions-recap": {
      const items = block.ids.map((id) => getAction(id)).filter(Boolean) as NonNullable<
        ReturnType<typeof getAction>
      >[];
      if (!items.length) return null;
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((a) => (
            <ActionCard
              key={a.id}
              action={a}
              href={`${livePath}/actions/${a.id}`}
            />
          ))}
        </div>
      );
    }
    case "next-step":
      return (
        <aside className="relative overflow-hidden rounded-3xl bg-foreground text-background p-6 lg:p-8">
          <div
            aria-hidden
            className="absolute -top-16 -right-12 size-[260px] rounded-full bg-primary/30 blur-3xl"
          />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.22em] text-background/60">
              Next step
            </p>
            <h3 className="mt-2 text-2xl tracking-tight font-semibold">
              {block.title}
            </h3>
            <p className="mt-3 text-background/75 leading-relaxed max-w-xl">
              {block.body}
            </p>
            <Link
              href={livePath}
              className="mt-5 inline-flex items-center gap-2 h-10 rounded-full bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Open the live portal
              <ArrowIcon className="size-4" />
            </Link>
          </div>
        </aside>
      );
  }
}

void actions;
