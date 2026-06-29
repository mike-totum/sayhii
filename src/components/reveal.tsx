"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

// SSR-safe scroll reveal: content is fully visible in server HTML (no-JS,
// crawlers, and slow connections see everything). After hydration, only
// elements still below the viewport are hidden and animated in on scroll.
type Phase = "static" | "hidden" | "shown";

export function Reveal({ children, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<Phase>("static");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      return; // already on screen — don't blink it out
    }
    setPhase("hidden");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setPhase("shown");
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const phaseClass =
    phase === "hidden" ? "reveal" : phase === "shown" ? "reveal reveal-in" : "";

  return (
    <div
      ref={ref}
      className={`${phaseClass} ${className}`}
      style={delay && phase !== "static" ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
