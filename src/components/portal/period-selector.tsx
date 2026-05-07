"use client";

import { useState } from "react";

const PERIODS = ["1W", "1M", "6M", "1Y", "All"] as const;
type Period = (typeof PERIODS)[number];

export function PeriodSelector({
  defaultValue = "6M",
  onChange,
}: {
  defaultValue?: Period;
  onChange?: (p: Period) => void;
}) {
  const [active, setActive] = useState<Period>(defaultValue);
  return (
    <div
      role="tablist"
      aria-label="Time range"
      className="inline-flex items-center rounded-full border border-border bg-surface p-0.5 text-xs font-medium"
    >
      {PERIODS.map((p) => (
        <button
          key={p}
          role="tab"
          aria-selected={active === p}
          onClick={() => {
            setActive(p);
            onChange?.(p);
          }}
          className={`px-3 h-7 rounded-full transition-all ${
            active === p
              ? "bg-foreground text-background shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
