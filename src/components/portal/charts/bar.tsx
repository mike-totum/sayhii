"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function GroupedBar({
  data,
  bars,
}: {
  data: Record<string, string | number>[];
  bars: { key: string; label: string; color: string }[];
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#ebe4da" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5a5751" }} stroke="#ebe4da" />
          <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "#5a5751" }} stroke="#ebe4da" width={28} />
          <Tooltip
            cursor={{ fill: "#ebe4da", opacity: 0.4 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #ebe4da",
              background: "#ffffff",
              fontSize: 12,
            }}
          />
          {bars.map((b) => (
            <Bar key={b.key} dataKey={b.key} name={b.label} fill={b.color} radius={[8, 8, 0, 0]} isAnimationActive={false} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MoversBar({
  data,
}: {
  data: { theme: string; delta: number }[];
}) {
  const max = Math.max(...data.map((d) => Math.abs(d.delta)));
  return (
    <ul className="space-y-3">
      {data.map((d) => {
        const positive = d.delta >= 0;
        const pct = Math.abs(d.delta) / max;
        return (
          <li key={d.theme} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
            <div className="flex items-center gap-3 min-w-0">
              <span className="truncate font-medium">{d.theme}</span>
              <div className="flex-1 h-1.5 rounded-full bg-border/60 relative overflow-hidden">
                <span
                  className={`absolute top-0 h-full rounded-full ${
                    positive ? "bg-accent" : "bg-primary"
                  }`}
                  style={{
                    left: positive ? "50%" : `${50 - pct * 50}%`,
                    width: `${pct * 50}%`,
                  }}
                />
                <span className="absolute top-0 left-1/2 h-full w-px bg-foreground/20" />
              </div>
            </div>
            <span className={`font-mono text-sm ${positive ? "text-accent" : "text-primary"}`}>
              {positive ? "+" : "−"}
              {Math.abs(d.delta).toFixed(1)}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}
