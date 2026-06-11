"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const INK = "#111117";
const CORAL = "#ff4d2e";

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

/* ------------------------------------------------------------------ */
/* Dot field engine: each answer is a dot; thousands of them drift     */
/* behind the hero. Answering the question fires a coral dot from the  */
/* tapped control into the field, where it stays.                      */
/* ------------------------------------------------------------------ */

type Dot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  coral: boolean;
  fly?: { sx: number; sy: number; tx: number; ty: number; t0: number; dur: number };
};

type Field = {
  spawn: (clientX: number, clientY: number) => void;
  destroy: () => void;
};

function createField(canvas: HTMLCanvasElement, reduced: boolean): Field {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0;
  let h = 0;
  let dots: Dot[] = [];
  let raf = 0;
  let running = false;
  const pointer = { x: -9999, y: -9999 };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (reduced) draw(performance.now());
  }

  function seed() {
    const n = Math.max(350, Math.min(1500, Math.round((w * h) / 1500)));
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.14,
      vy: (Math.random() - 0.5) * 0.14,
      r: 0.8 + Math.random() * 1.1,
      a: 0.07 + Math.random() * 0.13,
      coral: Math.random() < 0.015,
    }));
  }

  const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

  function draw(now: number) {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      if (d.fly) {
        const p = Math.min(1, (now - d.fly.t0) / d.fly.dur);
        const e = easeOutCubic(p);
        d.x = d.fly.sx + (d.fly.tx - d.fly.sx) * e;
        // slight arc so the flight reads as a toss, not a slide
        d.y = d.fly.sy + (d.fly.ty - d.fly.sy) * e - Math.sin(p * Math.PI) * 60;
        if (p >= 1) {
          d.fly = undefined;
          d.r = 1.8;
          d.a = 0.85;
        }
      } else if (!reduced) {
        d.x += d.vx;
        d.y += d.vy;
        const dx = d.x - pointer.x;
        const dy = d.y - pointer.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 8100 && dist2 > 0.01) {
          const dist = Math.sqrt(dist2);
          const f = (1 - dist / 90) * 0.5;
          d.x += (dx / dist) * f;
          d.y += (dy / dist) * f;
        }
        if (d.x < -4) d.x = w + 4;
        if (d.x > w + 4) d.x = -4;
        if (d.y < -4) d.y = h + 4;
        if (d.y > h + 4) d.y = -4;
      }
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, 6.2832);
      ctx.fillStyle = d.coral
        ? `rgba(255,77,46,${d.fly ? 0.95 : Math.max(0.5, d.a)})`
        : `rgba(17,17,23,${d.a})`;
      ctx.fill();
    }
  }

  function frame(now: number) {
    draw(now);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }

  function onPointerMove(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  start();
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  return {
    spawn(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const tx = w * 0.08 + Math.random() * w * 0.84;
      const ty = h * 0.12 + Math.random() * h * 0.64;
      dots.push({
        x: sx,
        y: sy,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        r: 2.6,
        a: 0.95,
        coral: true,
        fly: reduced
          ? undefined
          : { sx, sy, tx, ty, t0: performance.now(), dur: 1300 },
      });
      if (reduced) {
        const d = dots[dots.length - 1];
        d.x = tx;
        d.y = ty;
        d.r = 1.8;
        draw(performance.now());
      }
    },
    destroy() {
      stop();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
    },
  };
}

/* ------------------------------------------------------------------ */

const COUNTER_BASE = 49217;

export function HeroV2({
  t,
  locale,
  serifClass,
  contactHref,
}: {
  t: HeroV2Strings;
  locale: string;
  serifClass: string;
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
    fieldRef.current = createField(canvas, reduced);
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
    <section
      className="relative overflow-hidden"
      style={{ background: "#fcfcfa", color: INK }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 size-full"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex items-center justify-between gap-4 border-b border-[#111117]/10 py-4 text-[11px] uppercase tracking-[0.25em] text-[#111117]/55">
          <span>01 · {t.eyebrow}</span>
          <span className="hidden sm:inline-flex items-center gap-2 tabular-nums normal-case tracking-normal text-xs">
            <span className="size-1.5 rounded-full animate-pulse-soft" style={{ background: CORAL }} />
            {count.toLocaleString(locale)} {t.counterLabel}
          </span>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-20 items-center py-16 lg:py-24">
          <div>
            <h1
              className={`${serifClass} font-normal text-[clamp(3.1rem,6.5vw,6.25rem)] leading-[1.02] tracking-[-0.02em]`}
            >
              {titleLines.map((line, i) => {
                const italic = line.startsWith("*") && line.endsWith("*");
                return (
                  <span key={i} className={`block ${italic ? "italic" : ""}`}>
                    {italic ? line.slice(1, -1) : line}
                  </span>
                );
              })}
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#111117]/65">
              {t.sub}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href={contactHref}
                className="inline-flex h-12 items-center rounded-[4px] px-7 font-medium text-white transition-colors"
                style={{ background: CORAL }}
              >
                {t.ctaPrimary}
              </Link>
              <Link
                href="#how"
                className="inline-flex h-12 items-center rounded-[4px] border border-[#111117]/25 px-7 font-medium transition-colors hover:border-[#111117]/60"
              >
                {t.ctaSecondary}
              </Link>
            </div>
          </div>

          <div>
            <div className="border border-[#111117]/15 bg-white rounded-md">
              <div className="flex items-center justify-between border-b border-[#111117]/10 px-6 py-3">
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#111117]/55">
                  {t.questionLabel}
                </span>
                <span className="font-mono text-[11px] text-[#111117]/45">
                  ~ {t.timeLabel}
                </span>
              </div>

              <div className="px-6 py-8 min-h-32 flex items-center">
                {answered ? (
                  <div role="status">
                    <p className={`${serifClass} italic text-2xl leading-snug`}>
                      {withSeconds(t.thanksTitle, seconds ?? "3")}
                    </p>
                    <p className="mt-2 text-sm text-[#111117]/60">{t.joined}</p>
                  </div>
                ) : (
                  <p className={`${serifClass} text-2xl leading-snug`}>{prompt}</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[#111117]/10 px-6 py-5">
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#111117]/55">
                  {t.agree}
                </span>
                <div className="flex items-center gap-3 sm:gap-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className="relative inline-flex">
                      {!hasInteracted && i === 2 && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-full border-2 animate-ping-soft"
                          style={{ borderColor: CORAL }}
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
                            ? "animate-pop"
                            : answered
                              ? "border-[#111117]/15"
                              : "border-[#111117]/35 hover:scale-110 cursor-pointer"
                        }`}
                        style={
                          picked === i
                            ? { background: CORAL, borderColor: CORAL }
                            : undefined
                        }
                      />
                    </span>
                  ))}
                </div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#111117]/55">
                  {t.disagree}
                </span>
              </div>

              <div className="flex items-center justify-end border-t border-[#111117]/10 px-6 py-3">
                <button
                  onClick={next}
                  className="text-sm font-medium underline-offset-4 hover:underline cursor-pointer"
                  style={{ color: answered ? CORAL : undefined }}
                >
                  {answered ? t.another : t.skip}
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm tabular-nums text-[#111117]/65">
              <span className="inline-flex items-center gap-2">
                <span
                  className="size-1.5 rounded-full animate-pulse-soft"
                  style={{ background: CORAL }}
                />
                {count.toLocaleString(locale)} {t.counterLabel}
              </span>
              <span
                aria-hidden
                className={`font-medium transition-opacity duration-700 ${bumped ? "opacity-100" : "opacity-0"}`}
                style={{ color: CORAL }}
              >
                +1
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#111117]/10" />
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
      <span key={i} style={{ color: CORAL }}>
        {text}
      </span>
    ) : (
      <span key={i}>{text}</span>
    );
  });
}
