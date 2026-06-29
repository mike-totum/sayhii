"use client";

import { useEffect, useRef, useState } from "react";

export type NumberFormat = "int" | "percent1" | "percent0" | "decimal2";

function fmt(n: number, kind: NumberFormat): string {
  switch (kind) {
    case "percent1":
      return `${n.toFixed(1)}%`;
    case "percent0":
      return `${n.toFixed(0)}%`;
    case "decimal2":
      return n.toFixed(2);
    case "int":
    default:
      return Math.round(n).toLocaleString();
  }
}

type Props = {
  value: number;
  duration?: number;
  format?: NumberFormat;
  className?: string;
};

export function AnimatedNumber({
  value,
  duration = 1100,
  format = "int",
  className = "",
}: Props) {
  // SSR renders the final value so crawlers and no-JS users see real numbers;
  // the count-up only runs client-side once the element scrolls into view.
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLSpanElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const startTime = performance.now();
      const from = 0;
      const to = value;
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setShown(from + (to - from) * eased);
        if (t < 1) requestAnimationFrame(tick);
        else setShown(to);
      };
      requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      start();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            start();
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {fmt(shown, format)}
    </span>
  );
}
