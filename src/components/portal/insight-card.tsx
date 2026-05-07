import { Sparkline } from "./sparkline";
import { AnimatedNumber, type NumberFormat } from "./animated-number";
import { ArrowIcon } from "@/components/icons";
import Link from "next/link";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  metric?: { label: string; value: number; format?: NumberFormat; delta?: number };
  spark?: number[];
  cta?: { label: string; href: string };
  tone?: "primary" | "dark";
};

export function InsightCard({
  eyebrow,
  title,
  body,
  metric,
  spark,
  cta,
  tone = "dark",
}: Props) {
  const dark = tone === "dark";
  return (
    <section
      className={`relative overflow-hidden rounded-3xl border ${
        dark
          ? "border-foreground bg-foreground text-background"
          : "border-primary/30 bg-primary/5"
      }`}
    >
      <div
        aria-hidden
        className={`absolute -top-20 -right-16 size-[360px] rounded-full blur-3xl ${
          dark ? "bg-primary/30" : "bg-primary/15"
        }`}
      />
      <div
        aria-hidden
        className={`absolute -bottom-24 -left-10 size-[300px] rounded-full blur-3xl ${
          dark ? "bg-accent/15" : "bg-accent/15"
        }`}
      />
      <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-6 p-6 lg:p-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full animate-pulse-soft ${
                dark ? "bg-primary" : "bg-primary"
              }`}
            />
            <p
              className={`text-[11px] uppercase tracking-[0.22em] ${
                dark ? "text-background/60" : "text-primary"
              }`}
            >
              {eyebrow}
            </p>
          </div>
          <h2 className="mt-3 text-3xl lg:text-4xl tracking-tight font-semibold leading-[1.1]">
            {title}
          </h2>
          <p
            className={`mt-3 text-base leading-relaxed max-w-xl ${
              dark ? "text-background/75" : "text-foreground/80"
            }`}
          >
            {body}
          </p>
          {cta && (
            <Link
              href={cta.href}
              className={`mt-5 inline-flex items-center gap-2 h-10 rounded-full px-4 text-sm font-medium transition-colors ${
                dark
                  ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                  : "bg-foreground text-background hover:bg-foreground/85"
              }`}
            >
              {cta.label}
              <ArrowIcon className="size-4" />
            </Link>
          )}
        </div>

        {(metric || spark) && (
          <div
            className={`relative rounded-2xl p-5 flex flex-col justify-between min-h-[180px] ${
              dark ? "bg-background/5 border border-background/10" : "bg-surface border border-border"
            }`}
          >
            {metric && (
              <div>
                <p
                  className={`text-[11px] uppercase tracking-[0.18em] ${
                    dark ? "text-background/60" : "text-muted"
                  }`}
                >
                  {metric.label}
                </p>
                <div className="mt-2 flex items-baseline gap-3">
                  <span
                    className={`text-4xl lg:text-5xl tracking-tight font-semibold tabular-nums ${
                      dark ? "text-background" : "text-foreground"
                    }`}
                  >
                    <AnimatedNumber value={metric.value} format={metric.format ?? "int"} />
                  </span>
                  {typeof metric.delta === "number" && (
                    <span
                      className={`font-mono text-sm tabular-nums ${
                        metric.delta >= 0 ? "text-accent" : "text-primary"
                      }`}
                    >
                      {metric.delta >= 0 ? "+" : ""}
                      {metric.delta.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            )}
            {spark && spark.length > 1 && (
              <div className="mt-4 -mx-1">
                <Sparkline
                  data={spark}
                  color={dark ? "#ff8675" : "#ff6b5b"}
                  width={400}
                  height={56}
                  strokeWidth={2}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
