"use client";

import { useEffect, useRef } from "react";

/* The brand surface: every answer is a dot. A field of drifting ink (or
   paper, on dark grounds) dots with sparse coral signals among them. */

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
};

export function createField(
  canvas: HTMLCanvasElement,
  reduced: boolean,
  {
    tone = "ink",
    density = 1500,
    coralRatio = 0.015,
    pointer: usePointer = true,
  }: FieldOptions = {},
): Field {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const base = tone === "ink" ? "17,17,23" : "252,252,250";
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
    const n = Math.max(120, Math.min(1500, Math.round((w * h) / density)));
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.14,
      vy: (Math.random() - 0.5) * 0.14,
      r: 0.8 + Math.random() * 1.1,
      a: 0.07 + Math.random() * 0.13,
      coral: Math.random() < coralRatio,
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
        : `rgba(${base},${d.a})`;
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
  if (usePointer) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
  }

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
      if (usePointer) window.removeEventListener("pointermove", onPointerMove);
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
