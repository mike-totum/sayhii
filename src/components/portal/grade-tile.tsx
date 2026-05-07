import { gradeColor } from "@/lib/portal-data";

export function GradeTile({
  theme,
  grade,
  score,
  trend,
}: {
  theme: string;
  grade: string;
  score: number;
  trend: "up" | "down" | "steady";
}) {
  return (
    <div className={`rounded-2xl border p-5 ${gradeColor(grade)}`}>
      <p className="text-xs font-medium">{theme}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight">{grade}</span>
        <span className="text-sm font-mono text-foreground/70">
          {score.toFixed(1)}%
        </span>
      </div>
      <p className="mt-2 text-xs text-foreground/70 inline-flex items-center gap-1">
        <TrendDot trend={trend} />
        {trend === "up" && "Slight increase"}
        {trend === "down" && "Slight decrease"}
        {trend === "steady" && "Steady"}
      </p>
    </div>
  );
}

export function TrendDot({ trend }: { trend: "up" | "down" | "steady" }) {
  if (trend === "up") return <span className="text-accent">↑</span>;
  if (trend === "down") return <span className="text-primary">↓</span>;
  return <span className="text-muted">—</span>;
}

export function NumberTile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "primary" | "accent";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-foreground text-background"
      : tone === "accent"
        ? "bg-accent-soft border-accent/30"
        : "bg-surface border-border";
  const labelClass =
    tone === "primary" ? "text-background/60" : "text-muted";
  const subClass =
    tone === "primary" ? "text-background/70" : "text-muted";
  return (
    <div className={`rounded-3xl border p-6 ${toneClass}`}>
      <p className={`text-xs uppercase tracking-[0.2em] ${labelClass}`}>{label}</p>
      <p className="mt-3 text-4xl lg:text-5xl tracking-tight font-semibold">
        {value}
      </p>
      {sub && <p className={`mt-2 text-sm ${subClass}`}>{sub}</p>}
    </div>
  );
}
