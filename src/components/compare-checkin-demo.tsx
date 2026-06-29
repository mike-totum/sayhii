"use client";

import { useEffect, useRef, useState } from "react";
import { StickFigure } from "@/components/hero-checkin";
import { CheckIcon } from "@/components/icons";

// The "sayhii, everyday" card's mini-demo: instead of a static mock, it
// plays the real thing on a loop — the check-in question is asked, an
// answer is tapped, and "Done. Three seconds." lands. Proof of the claim
// rather than a claim about it. Only runs while on-screen, and the shared
// reduced-motion rules in globals.css quiet every animation it uses.
type Phase = "asking" | "answered" | "done";

// Which point on the 0–4 scale gets tapped in the loop.
const PICKED = 1;

export function CompareCheckinDemo({
  prompt,
  done,
}: {
  prompt: string;
  done: string;
}) {
  const [phase, setPhase] = useState<Phase>("asking");
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Play only while the card is in view — no off-screen timers churning.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    function run() {
      if (cancelled) return;
      setPhase("asking");
      at(1100, () => setPhase("answered")); // a dot gets tapped
      at(1650, () => setPhase("done")); // confirmation lands
      at(4400, run); // hold, then replay
    }
    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [active]);

  const answered = phase === "answered" || phase === "done";
  const showDone = phase === "done";

  return (
    <div
      ref={ref}
      className="relative mt-6 flex h-[8.5rem] flex-col justify-center gap-3 rounded-md border border-background/15 bg-background/5 p-4"
    >
      <div className="grid grid-cols-[auto_1fr] items-start gap-3">
        <StickFigure
          className={`w-11 shrink-0 ${showDone ? "checkin-cheer" : ""}`}
        />
        <span className="relative self-start rounded-2xl rounded-bl-sm bg-primary px-4 py-2.5 text-sm font-medium leading-snug text-primary-foreground">
          {prompt}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 pl-1">
          {[0, 1, 2, 3, 4].map((d) => (
            <span key={d} className="relative inline-flex">
              {!answered && d === PICKED && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full border-2 border-primary animate-ping-soft"
                />
              )}
              <span
                // Re-mount on phase change so the fill pops each loop.
                key={`${phase}-${d}`}
                className={`size-3 rounded-full border-2 ${
                  answered && d === PICKED
                    ? "border-primary bg-primary animate-pop"
                    : "border-background/30"
                }`}
              />
            </span>
          ))}
        </span>

        {/* Always present so the row never reflows — just fades up on done. */}
        <span
          className={`inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-3 py-1.5 text-xs font-medium transition-all duration-500 ${
            showDone ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          }`}
        >
          <span className="inline-flex size-4 items-center justify-center rounded-full bg-accent text-white">
            <CheckIcon className="size-2.5" />
          </span>
          {done}
        </span>
      </div>
    </div>
  );
}
