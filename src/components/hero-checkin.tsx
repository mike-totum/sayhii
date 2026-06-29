"use client";

import { useEffect, useRef, useState } from "react";

export type CheckinStrings = {
  prompts: string[];
  agree: string;
  disagree: string;
  skip: string;
  tryIt: string;
  thanksTitle: string;
  thanksBody: string;
  another: string;
};

// The hero demo: a real, answerable check-in. We time the visitor from
// prompt to tap and show the elapsed seconds — proof of the "3 seconds
// a day" claim instead of a claim about it.
export function HeroCheckin({ t }: { t: CheckinStrings }) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [seconds, setSeconds] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = performance.now();
  }, [promptIndex]);

  const answered = picked !== null;
  const prompt = t.prompts[promptIndex % t.prompts.length];

  function answer(i: number) {
    if (answered || startRef.current === null) return;
    const elapsed = (performance.now() - startRef.current) / 1000;
    setSeconds(elapsed >= 10 ? String(Math.round(elapsed)) : elapsed.toFixed(1));
    setPicked(i);
    setHasInteracted(true);
  }

  function next() {
    setPicked(null);
    setSeconds(null);
    setHasInteracted(true);
    setPromptIndex((i) => i + 1);
  }

  return (
    <div className="relative rounded-[28px] bg-surface border border-border shadow-[0_30px_80px_-30px_rgba(15,17,23,0.25)] p-7 lg:p-8">
      <div className="flex items-baseline justify-between gap-3">
        <span className="inline-flex items-baseline text-xl font-semibold tracking-tight">
          <span>say</span>
          <span className="font-serif italic text-primary">hii</span>
          <span
            aria-hidden
            className="ml-0.5 inline-block size-1 rounded-full bg-primary translate-y-[-2px] animate-pulse-soft"
          />
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
          <span className="size-1.5 rounded-full bg-primary animate-pulse-soft" />
          {t.tryIt}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[auto_1fr] gap-4 items-start">
        <StickFigure
          className={`w-16 sm:w-20 shrink-0 ${answered ? "checkin-cheer" : ""}`}
        />
        <SpeechBubble>
          {answered ? (
            <span role="status">{withSeconds(t.thanksTitle, seconds ?? "3")}</span>
          ) : (
            prompt
          )}
        </SpeechBubble>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{t.agree}</span>
        <div className="flex items-center gap-3 sm:gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="relative inline-flex">
              {!hasInteracted && i === 2 && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full border-2 border-primary animate-ping-soft"
                />
              )}
              <button
                onClick={() => answer(i)}
                disabled={answered}
                aria-label={
                  i === 0 ? t.agree : i === 4 ? t.disagree : `Option ${i + 1}`
                }
                className={`size-6 rounded-full border-2 transition-all ${
                  picked === i
                    ? "border-primary bg-primary shadow-[0_0_0_4px_rgba(255,107,91,0.22)] animate-pop"
                    : answered
                      ? "border-foreground/15"
                      : "border-foreground/30 hover:border-primary hover:scale-110 cursor-pointer"
                }`}
              />
            </span>
          ))}
        </div>
        <span className="text-sm font-medium text-foreground">{t.disagree}</span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 min-h-6">
        {answered ? (
          <>
            <p className="text-sm text-muted leading-snug rise">{t.thanksBody}</p>
            <button
              onClick={next}
              className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline cursor-pointer"
            >
              {t.another}
            </button>
          </>
        ) : (
          <button
            onClick={next}
            className="ml-auto text-sm text-muted underline-offset-4 hover:underline hover:text-foreground transition-colors cursor-pointer"
          >
            {t.skip}
          </button>
        )}
      </div>
    </div>
  );
}

// Renders "*{s} seconds*" templates: the seconds count gets the brand's
// serif-italic emphasis inside the coral bubble.
function withSeconds(template: string, seconds: string) {
  return template.split(/(\*[^*]+\*)/g).map((part, i) => {
    const inner =
      part.startsWith("*") && part.endsWith("*") && part.length > 2
        ? part.slice(1, -1)
        : null;
    const text = (inner ?? part).replace("{s}", seconds);
    return inner ? (
      <span key={i} className="font-serif italic">
        {text}
      </span>
    ) : (
      <span key={i}>{text}</span>
    );
  });
}

export function StickFigure({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 110"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-primary ${className}`}
      aria-hidden
    >
      <circle cx="34" cy="18" r="11" />
      <line x1="34" y1="29" x2="34" y2="68" />
      <line x1="34" y1="40" x2="20" y2="58" />
      <line x1="34" y1="40" x2="58" y2="22" />
      <g className="origin-[58px_22px] animate-pulse-soft">
        <path d="M62 16 q5 0 5 6" strokeWidth="2" />
        <path d="M67 11 q7 0 7 9" strokeWidth="2" />
      </g>
      <line x1="34" y1="68" x2="22" y2="96" />
      <line x1="34" y1="68" x2="46" y2="96" />
    </svg>
  );
}

export function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-primary text-primary-foreground rounded-[42px] px-7 py-5 sm:px-8 sm:py-6 shadow-[0_10px_30px_-12px_rgba(255,107,91,0.55)]">
      <svg
        aria-hidden
        viewBox="0 0 32 28"
        className="absolute -bottom-3 left-5 sm:left-6 w-8 h-7 text-primary"
        fill="currentColor"
      >
        <path d="M 8 0 L 30 0 L 0 26 Z" />
      </svg>
      <p className="text-base sm:text-lg font-medium leading-snug text-center">
        {children}
      </p>
    </div>
  );
}
