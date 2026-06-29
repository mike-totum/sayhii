// Deterministic sparkline series for illustrative marketing visuals.
// Seeded so SSR and CSR render identically.
export function sparkSeries(seed: number, base: number, amplitude = 0.18, length = 30): number[] {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < length; i++) {
    const drift = Math.sin(i * 0.42 + seed) * amplitude;
    const wobble = Math.cos(i * 0.91 + seed * 1.7) * (amplitude * 0.6);
    v = base + drift + wobble + (i / length) * (amplitude * 0.4);
    out.push(Number(v.toFixed(3)));
  }
  return out;
}
