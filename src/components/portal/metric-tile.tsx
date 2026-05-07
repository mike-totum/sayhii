import { Sparkline } from "./sparkline";
import { AnimatedNumber, type NumberFormat } from "./animated-number";

type Tone = "default" | "primary" | "accent" | "warm";

const toneClasses: Record<Tone, string> = {
  default: "bg-surface border-border",
  primary: "bg-foreground text-background border-foreground",
  accent: "bg-accent-soft border-accent/30",
  warm: "bg-warm/60 border-warm",
};

const sparkColor: Record<Tone, string> = {
  default: "#ff6b5b",
  primary: "#ff8675",
  accent: "#7da88a",
  warm: "#e84f3d",
};

const labelColor: Record<Tone, string> = {
  default: "text-muted",
  primary: "text-background/60",
  accent: "text-foreground/65",
  warm: "text-foreground/65",
};

const valueColor: Record<Tone, string> = {
  default: "text-foreground",
  primary: "text-background",
  accent: "text-foreground",
  warm: "text-foreground",
};

const subColor: Record<Tone, string> = {
  default: "text-muted",
  primary: "text-background/70",
  accent: "text-foreground/65",
  warm: "text-foreground/65",
};

type Props = {
  label: string;
  value: number;
  format?: NumberFormat;
  delta?: number;
  deltaTone?: "good" | "bad" | "neutral";
  spark?: number[];
  sub?: string;
  tone?: Tone;
};

export function MetricTile({
  label,
  value,
  format = "int",
  delta,
  deltaTone = "neutral",
  spark,
  sub,
  tone = "default",
}: Props) {
  return (
    <article
      className={`group relative rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${toneClasses[tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[11px] uppercase tracking-[0.18em] ${labelColor[tone]}`}>
          {label}
        </p>
        {typeof delta === "number" && (
          <DeltaPill delta={delta} tone={deltaTone} darkBg={tone === "primary"} />
        )}
      </div>

      <div className={`mt-3 text-3xl lg:text-4xl tracking-tight font-semibold tabular-nums ${valueColor[tone]}`}>
        <AnimatedNumber value={value} format={format} />
      </div>

      {sub && <p className={`mt-1 text-[12px] ${subColor[tone]}`}>{sub}</p>}

      {spark && spark.length > 1 && (
        <div className="mt-4 -mx-1">
          <Sparkline data={spark} color={sparkColor[tone]} width={240} height={36} />
        </div>
      )}
    </article>
  );
}

export function DeltaPill({
  delta,
  tone = "neutral",
  darkBg = false,
}: {
  delta: number;
  tone?: "good" | "bad" | "neutral";
  darkBg?: boolean;
}) {
  const positive = delta >= 0;
  const auto = tone === "neutral" ? (positive ? "good" : "bad") : tone;
  const color =
    auto === "good" ? "text-accent" : "text-primary";
  const bg = darkBg
    ? auto === "good"
      ? "bg-accent/10 border-accent/30"
      : "bg-primary/10 border-primary/30"
    : auto === "good"
      ? "bg-accent-soft border-accent/30"
      : "bg-warm/60 border-primary/30";
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[11px] font-mono tabular-nums ${color} ${bg}`}
    >
      {positive ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%
    </span>
  );
}
