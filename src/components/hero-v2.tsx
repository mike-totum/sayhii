"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createField, type Field } from "./dot-field";

export type HeroV2Strings = {
  eyebrow: string;
  title: string;
  sub: string;
  questionLabel: string;
  timeLabel: string;
  counterLabel: string;
  joined: string;
  ctaPrimary: string;
  ctaSecondary: string;
  prompts: string[];
  agree: string;
  disagree: string;
  skip: string;
  another: string;
  thanksTitle: string;
};

const COUNTER_BASE = 49217;

/* The hero: a field of answers behind the page, and a question you can
   actually answer. Your tap becomes a coral dot that joins the field. */
export function HeroV2({
  t,
  locale,
  contactHref,
}: {
  t: HeroV2Strings;
  locale: string;
  contactHref: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fieldRef = useRef<Field | null>(null);
  const startRef = useRef<number | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [seconds, setSeconds] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [count, setCount] = useState(COUNTER_BASE);
  const [bumped, setBumped] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    fieldRef.current = createField(canvas, reduced, { formations: true });
    return () => fieldRef.current?.destroy();
  }, []);

  // The field is alive: other people's answers keep arriving.
  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => c + 1 + Math.floor(Math.random() * 2));
    }, 2600 + Math.random() * 1800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    startRef.current = performance.now();
  }, [promptIndex]);

  const answered = picked !== null;
  const prompt = t.prompts[promptIndex % t.prompts.length];

  function answer(i: number, e: React.MouseEvent<HTMLButtonElement>) {
    if (answered || startRef.current === null) return;
    const elapsed = (performance.now() - startRef.current) / 1000;
    setSeconds(elapsed >= 10 ? String(Math.round(elapsed)) : elapsed.toFixed(1));
    setPicked(i);
    setHasInteracted(true);
    setCount((c) => c + 1);
    setBumped(true);
    setTimeout(() => setBumped(false), 1200);
    const r = e.currentTarget.getBoundingClientRect();
    fieldRef.current?.spawn(r.left + r.width / 2, r.top + r.height / 2);
  }

  function next() {
    setPicked(null);
    setSeconds(null);
    setHasInteracted(true);
    setPromptIndex((i) => i + 1);
  }

  const titleLines = t.title.split("\n");

  return (
    <section className="relative overflow-hidden bg-background text-foreground">
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 size-full"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex items-center justify-between gap-4 border-b border-border py-4 text-[11px] uppercase tracking-[0.25em] text-muted">
          <span>01 · {t.eyebrow}</span>
          <span className="hidden sm:inline-flex items-center gap-2 tabular-nums normal-case tracking-normal text-xs">
            <span className="size-1.5 rounded-full bg-primary animate-pulse-soft" />
            {count.toLocaleString(locale)} {t.counterLabel}
          </span>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-20 items-center py-16 lg:py-24">
          <div>
            <h1 className="font-serif font-normal text-[clamp(3.1rem,6.5vw,6.25rem)] leading-[1.02] tracking-[-0.02em]">
              {titleLines.map((line, i) => {
                const italic = line.startsWith("*") && line.endsWith("*");
                return (
                  <span key={i} className={`block ${italic ? "italic" : ""}`}>
                    {italic ? line.slice(1, -1) : line}
                  </span>
                );
              })}
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
              {t.sub}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href={contactHref}
                className="inline-flex h-12 items-center rounded-[4px] bg-primary px-7 font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                {t.ctaPrimary}
              </Link>
              <Link
                href="#how"
                className="inline-flex h-12 items-center rounded-[4px] border border-foreground/25 px-7 font-medium transition-colors hover:border-foreground/60"
              >
                {t.ctaSecondary}
              </Link>
            </div>
          </div>

          <div>
            <div className="border border-border bg-surface rounded-md">
              <div className="flex items-center justify-between border-b border-border px-6 py-3">
                <span className="text-[11px] uppercase tracking-[0.25em] text-muted">
                  {t.questionLabel}
                </span>
                <span className="font-mono text-[11px] text-muted/80">
                  ~ {t.timeLabel}
                </span>
              </div>

              <div className="px-6 py-8 min-h-32 flex items-center">
                {answered ? (
                  <div role="status">
                    <p className="font-serif italic text-2xl leading-snug">
                      {withSeconds(t.thanksTitle, seconds ?? "3")}
                    </p>
                    <p className="mt-2 text-sm text-muted">{t.joined}</p>
                  </div>
                ) : (
                  <p className="font-serif text-2xl leading-snug">{prompt}</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-5">
                <span className="text-[10px] uppercase tracking-[0.22em] text-muted">
                  {t.agree}
                </span>
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
                        onClick={(e) => answer(i, e)}
                        disabled={answered}
                        aria-label={
                          i === 0 ? t.agree : i === 4 ? t.disagree : `Option ${i + 1}`
                        }
                        className={`size-6 rounded-full border-[1.5px] transition-all ${
                          picked === i
                            ? "bg-primary border-primary animate-pop"
                            : answered
                              ? "border-foreground/15"
                              : "border-foreground/35 hover:border-primary hover:scale-110 cursor-pointer"
                        }`}
                      />
                    </span>
                  ))}
                </div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-muted">
                  {t.disagree}
                </span>
              </div>

              <div className="flex items-center justify-end border-t border-border px-6 py-3">
                <button
                  onClick={next}
                  className={`text-sm font-medium underline-offset-4 hover:underline cursor-pointer ${
                    answered ? "text-primary" : ""
                  }`}
                >
                  {answered ? t.another : t.skip}
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm tabular-nums text-muted">
              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary animate-pulse-soft" />
                {count.toLocaleString(locale)} {t.counterLabel}
              </span>
              <span
                aria-hidden
                className={`font-medium text-primary transition-opacity duration-700 ${
                  bumped ? "opacity-100" : "opacity-0"
                }`}
              >
                +1
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border" />
      </div>
    </section>
  );
}

// "That's it. *{s} seconds*." with the seconds count in coral.
function withSeconds(template: string, seconds: string) {
  return template.split(/(\*[^*]+\*)/g).map((part, i) => {
    const inner =
      part.startsWith("*") && part.endsWith("*") && part.length > 2
        ? part.slice(1, -1)
        : null;
    const text = (inner ?? part).replace("{s}", seconds);
    return inner ? (
      <span key={i} className="text-primary">
        {text}
      </span>
    ) : (
      <span key={i}>{text}</span>
    );
  });
}
