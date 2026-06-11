"use client";

import { useEffect, useRef } from "react";

/* The brand surface: every answer is a dot, and every dot is a piece of
   the painting. The field drifts as noise, then assembles through a
   rotating gallery: the word "hii.", the waving figure, a rising signal
   line with a coral uptick. Chaos becoming a clear picture, on loop.

   It is alive under the visitor's hands: the cursor is a brush that
   paints heat into the field (dots flush coral and swell, then cool),
   nearby answers link into constellations, clicks ripple outward, and
   answering the hero question fires a comet-trailed dot into the field. */

type Dot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number; // current alpha (animated)
  baseA: number; // resting alpha in scatter
  coral: boolean;
  heat: number; // 0..1 painted by the cursor
  tx: number | null;
  ty: number | null;
  formCoral: boolean; // coral role within the current formation
  springAt: number; // staggered formation arrival
  phase: number; // per-dot breathing offset
  big?: boolean; // user-spawned answer dots stay prominent
  trail?: Array<[number, number]>;
};

type Target = { x: number; y: number; c?: boolean };
type Wave = { x: number; y: number; t0: number };

export type Field = {
  spawn: (clientX: number, clientY: number) => void;
  destroy: () => void;
};

export type FieldOptions = {
  /* dot color on light vs dark grounds */
  tone?: "ink" | "paper";
  /* px² of canvas per dot; higher = sparser */
  density?: number;
  /* fraction of dots drawn in coral */
  coralRatio?: number;
  /* react to the cursor */
  pointer?: boolean;
  /* cycle through the formation gallery */
  formations?: boolean;
};

const SPRING = 0.016;
const DAMPING = 0.85;
const FORMATION_ALPHA = 0.62;
const WAVE_MS = 700;
const WAVE_RADIUS = 340;
const BRUSH_RADIUS = 80;

type Phase = { kind: "scatter" | "hii" | "stat" | "trend"; duration: number };
const CYCLE: Phase[] = [
  { kind: "scatter", duration: 1800 },
  { kind: "hii", duration: 4500 },
  { kind: "scatter", duration: 1400 },
  { kind: "stat", duration: 4500 },
  { kind: "scatter", duration: 1400 },
  { kind: "trend", duration: 4500 },
];

export function createField(
  canvas: HTMLCanvasElement,
  reduced: boolean,
  {
    tone = "ink",
    density = 1100,
    coralRatio = 0.04,
    pointer: usePointer = true,
    formations = false,
  }: FieldOptions = {},
): Field {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const base = tone === "ink" ? "17,17,23" : "252,252,250";
  let w = 0;
  let h = 0;
  let dots: Dot[] = [];
  let waves: Wave[] = [];
  let raf = 0;
  let running = false;
  let inView = true;
  let phaseIndex = 0;
  let phaseStart = 0;
  let currentKind: Phase["kind"] = "scatter";
  let scrollImpulse = 0;
  let lastScrollY = window.scrollY;
  let serifFamily = "Georgia, serif";
  const pointer = { x: -9999, y: -9999 };
  const near: number[] = [];

  // next/font mangles family names; read the real one off a probe element.
  try {
    const probe = document.createElement("span");
    probe.className = "font-serif";
    document.body.appendChild(probe);
    const fam = getComputedStyle(probe).fontFamily;
    probe.remove();
    if (fam) serifFamily = fam;
  } catch {
    /* keep fallback */
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    phaseIndex = 0;
    phaseStart = performance.now();
    if (reduced) draw(performance.now());
  }

  function seed() {
    const n = Math.max(250, Math.min(1600, Math.round((w * h) / density)));
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: 1.1 + Math.random() * 1.1,
      a: 0,
      baseA: 0.16 + Math.random() * 0.16,
      coral: Math.random() < coralRatio,
      heat: 0,
      tx: null,
      ty: null,
      formCoral: false,
      springAt: 0,
      phase: Math.random() * 6.2832,
    }));
    for (const d of dots) d.a = d.baseA;
  }

  /* ---------- the gallery: formation targets ---------- */

  // The exhibits hang in the open zone of the hero (top-right on wide
  // screens, top-center on narrow), clear of the headline and the card.
  function zone() {
    const narrow = w < 760;
    return {
      cx: narrow ? w * 0.5 : w * 0.72,
      cy: narrow ? h * 0.13 : h * 0.21,
      s: narrow ? Math.min(w * 0.36, h * 0.22) : Math.min(h * 0.32, w * 0.18),
    };
  }

  function samplePixels(
    paint: (octx: CanvasRenderingContext2D) => void,
    step: number,
  ): Target[] {
    const off = document.createElement("canvas");
    off.width = Math.ceil(w);
    off.height = Math.ceil(h);
    const octx = off.getContext("2d")!;
    paint(octx);
    const img = octx.getImageData(0, 0, off.width, off.height).data;
    const pts: Target[] = [];
    for (let y = 0; y < off.height; y += step) {
      for (let x = 0; x < off.width; x += step) {
        if (img[(y * off.width + x) * 4 + 3] > 120) {
          pts.push({
            x: x + (Math.random() - 0.5) * step * 0.8,
            y: y + (Math.random() - 0.5) * step * 0.8,
          });
        }
      }
    }
    return pts;
  }

  function sampleWord(): Target[] {
    const { cx, cy, s } = zone();
    const pts = samplePixels((octx) => {
      octx.font = `italic ${s}px ${serifFamily}`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillText("hii.", cx, cy);
    }, Math.max(3, Math.round(s / 40)));
    // the dot of an i, painted coral
    for (const p of pts) {
      if (p.y < cy - s * 0.18 && p.x > cx - s * 0.1) p.c = true;
    }
    return pts;
  }

  // The proof, in dots: the adoption stat.
  function sampleStat(): Target[] {
    const { cx, cy, s } = zone();
    const size = s * 0.92;
    const pts = samplePixels((octx) => {
      octx.font = `italic ${size}px ${serifFamily}`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillText("90%", cx, cy);
    }, Math.max(3, Math.round(size / 40)));
    // the % glyph carries the signal color
    for (const p of pts) {
      if (p.x > cx + size * 0.62) p.c = true;
    }
    return pts;
  }

  // The signal: a baseline of quiet answers and a line trending up,
  // with the recent stretch in coral.
  function sampleTrend(): Target[] {
    const pts: Target[] = [];
    const n = Math.min(620, Math.round(dots.length * 0.6));
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const y =
        h * (0.84 - 0.14 * t + 0.035 * Math.sin(t * 9.5) + 0.02 * Math.sin(t * 23));
      pts.push({
        x: w * (0.04 + t * 0.92),
        y: y + (Math.random() - 0.5) * h * 0.018,
        c: t > 0.86,
      });
    }
    // faint baseline axis under the curve
    const axis = Math.min(160, Math.round(dots.length * 0.12));
    for (let i = 0; i < axis; i++) {
      pts.push({
        x: w * (0.04 + (i / axis) * 0.92),
        y: h * 0.9 + (Math.random() - 0.5) * h * 0.004,
      });
    }
    return pts;
  }

  function enterPhase(kind: Phase["kind"], now: number) {
    currentKind = kind;
    if (kind === "scatter") {
      for (const d of dots) {
        d.tx = null;
        d.ty = null;
        d.formCoral = false;
        d.vx = (Math.random() - 0.5) * 0.5;
        d.vy = (Math.random() - 0.5) * 0.5;
      }
      return;
    }
    const targets =
      kind === "hii" ? sampleWord() : kind === "stat" ? sampleStat() : sampleTrend();
    if (targets.length === 0) return;
    // shuffle dots so formation membership varies each cycle
    const order = dots.map((_, i) => i).sort(() => Math.random() - 0.5);
    for (let i = 0; i < order.length; i++) {
      const d = dots[order[i]];
      if (i < targets.length) {
        const t = targets[i % targets.length];
        d.tx = t.x;
        d.ty = t.y;
        d.formCoral = !!t.c;
        d.springAt = now + Math.random() * 700; // staggered swarm-in
      } else {
        d.tx = null;
        d.ty = null;
        d.formCoral = false;
      }
    }
  }

  /* ---------- simulation ---------- */

  function step(now: number) {
    if (formations && !reduced) {
      const phase = CYCLE[phaseIndex % CYCLE.length];
      if (now - phaseStart > phase.duration) {
        phaseIndex++;
        phaseStart = now;
        enterPhase(CYCLE[phaseIndex % CYCLE.length].kind, now);
      }
    }
    near.length = 0;
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const forming = d.tx !== null && d.ty !== null && now >= d.springAt;
      if (forming) {
        d.vx += (d.tx! - d.x) * SPRING;
        d.vy += (d.ty! - d.y) * SPRING;
        d.vx *= DAMPING;
        d.vy *= DAMPING;
        const breathe = 0.85 + 0.15 * Math.sin(now / 600 + d.phase);
        d.a += (FORMATION_ALPHA * breathe - d.a) * 0.05;
      } else {
        d.vx += (Math.random() - 0.5) * 0.02;
        d.vy += (Math.random() - 0.5) * 0.02 + scrollImpulse * 0.004;
        const speed = Math.hypot(d.vx, d.vy);
        if (speed > 0.4 && !d.big) {
          d.vx *= 0.4 / speed;
          d.vy *= 0.4 / speed;
        }
        const dim = currentKind === "scatter" ? 1 : 0.45;
        d.a += ((d.big ? 0.85 : d.baseA * dim) - d.a) * 0.03;
      }
      // the cursor is a brush: it paints heat and parts the field
      const dx = d.x - pointer.x;
      const dy = d.y - pointer.y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 19600) {
        const dist = Math.sqrt(Math.max(dist2, 0.01));
        if (dist < BRUSH_RADIUS) {
          d.heat = Math.min(1, d.heat + (1 - dist / BRUSH_RADIUS) * 0.4);
        }
        if (dist < 110) {
          const f = (1 - dist / 110) * 0.7;
          d.vx += (dx / dist) * f;
          d.vy += (dy / dist) * f;
        }
        if (near.length < 60) near.push(i);
      }
      d.heat = Math.max(0, d.heat - 0.011);
      // click shockwaves push a ring outward through the field
      for (const wv of waves) {
        const age = Math.max(0, (now - wv.t0) / WAVE_MS);
        if (age >= 1) continue;
        const front = easeOut(age) * WAVE_RADIUS;
        const wx = d.x - wv.x;
        const wy = d.y - wv.y;
        const wd = Math.hypot(wx, wy);
        if (wd > 0.01 && Math.abs(wd - front) < 36) {
          const f = (1 - age) * 1.6 * (1 - Math.abs(wd - front) / 36);
          d.vx += (wx / wd) * f;
          d.vy += (wy / wd) * f;
        }
      }
      d.x += d.vx;
      d.y += d.vy;
      if (d.big) {
        d.trail = d.trail ?? [];
        if (Math.hypot(d.vx, d.vy) > 0.8) {
          d.trail.push([d.x, d.y]);
          if (d.trail.length > 14) d.trail.shift();
        } else if (d.trail.length) {
          d.trail.shift();
        }
      }
      if (d.tx === null && !d.big) {
        if (d.x < -6) d.x = w + 6;
        if (d.x > w + 6) d.x = -6;
        if (d.y < -6) d.y = h + 6;
        if (d.y > h + 6) d.y = -6;
      }
    }
    waves = waves.filter((wv) => now - wv.t0 < WAVE_MS);
    scrollImpulse *= 0.9;
  }

  const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

  function draw(now: number) {
    ctx.clearRect(0, 0, w, h);

    // constellation: answers near your attention link up
    if (near.length > 1) {
      ctx.lineWidth = 0.7;
      for (let i = 0; i < near.length; i++) {
        const a = dots[near[i]];
        for (let j = i + 1; j < near.length; j++) {
          const b = dots[near[j]];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 4096) {
            const alpha = (1 - Math.sqrt(d2) / 64) * 0.22;
            ctx.strokeStyle = `rgba(${base},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    // shockwave rings
    for (const wv of waves) {
      const age = Math.max(0, (now - wv.t0) / WAVE_MS);
      if (age >= 1) continue;
      ctx.beginPath();
      ctx.arc(wv.x, wv.y, easeOut(age) * WAVE_RADIUS, 0, 6.2832);
      ctx.strokeStyle = `rgba(255,77,46,${(1 - age) * 0.3})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    for (const d of dots) {
      // comet trail on prominent answer dots
      if (d.trail && d.trail.length > 1) {
        for (let i = 0; i < d.trail.length; i++) {
          const [tx, ty] = d.trail[i];
          const p = i / d.trail.length;
          ctx.beginPath();
          ctx.arc(tx, ty, d.r * 0.5 * p, 0, 6.2832);
          ctx.fillStyle = `rgba(255,77,46,${p * 0.35})`;
          ctx.fill();
        }
      }
      const r = d.r * (1 + d.heat * 0.7);
      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, 6.2832);
      if (d.coral || d.formCoral) {
        ctx.fillStyle = `rgba(255,77,46,${Math.min(0.95, d.a + 0.25)})`;
      } else {
        ctx.fillStyle = `rgba(${base},${d.a})`;
      }
      ctx.fill();
      // painted heat: the brushstroke cools from coral back to ink
      if (d.heat > 0.02 && !d.coral && !d.formCoral) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, 6.2832);
        ctx.fillStyle = `rgba(255,77,46,${d.heat * 0.75})`;
        ctx.fill();
      }
    }
  }

  function frame(now: number) {
    step(now);
    draw(now);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced || !inView) return;
    running = true;
    phaseStart = performance.now();
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

  function onClick(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < -40 || x > w + 40 || y < -40 || y > h + 40) return;
    waves.push({ x, y, t0: performance.now() });
  }

  function onScroll() {
    const delta = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    scrollImpulse = Math.max(-30, Math.min(30, scrollImpulse - delta));
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver((entries) => {
    inView = entries[0]?.isIntersecting ?? true;
    if (inView) start();
    else stop();
  });
  io.observe(canvas);
  resize();
  start();
  document.addEventListener("visibilitychange", onVisibility);
  if (usePointer) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  return {
    spawn(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      // one prominent answer dot plus a small escort burst
      for (let i = 0; i < 5; i++) {
        const big = i === 0;
        const angle = Math.random() * 6.2832;
        const burst = big ? 0 : 2 + Math.random() * 3;
        dots.push({
          x: sx,
          y: sy,
          vx: Math.cos(angle) * burst - (big ? 2.5 : 0),
          vy: Math.sin(angle) * burst - (big ? 4 : 2),
          r: big ? 3 : 1.4 + Math.random(),
          a: big ? 0.95 : 0.5,
          baseA: big ? 0.85 : 0.3,
          coral: big || Math.random() < 0.5,
          heat: 0,
          tx: null,
          ty: null,
          formCoral: false,
          springAt: 0,
          phase: Math.random() * 6.2832,
          big,
        });
      }
      waves.push({ x: sx, y: sy, t0: performance.now() });
      if (reduced) draw(performance.now());
    },
    destroy() {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (usePointer) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("click", onClick);
        window.removeEventListener("scroll", onScroll);
      }
    },
  };
}

/* Decorative ambient field for sections that don't need the spawn API. */
export function DotSurface({
  className = "",
  ...opts
}: FieldOptions & { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const field = createField(canvas, reduced, { pointer: false, ...opts });
    return () => field.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
    />
  );
}
