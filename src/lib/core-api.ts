import "server-only";
import type { Participation } from "./customers";

// BFF client for sayhii-core (the product API). The internal key + base URL
// are server-side env (set in Vercel); the key never reaches the browser.
//   SAYHII_CORE_API_URL          e.g. https://api-dev.sayhii.io
//   SAYHII_CORE_INTERNAL_TOKEN   internal API key (org_id __internal__)
const BASE = (process.env.SAYHII_CORE_API_URL ?? "").replace(/\/$/, "");
const TOKEN = process.env.SAYHII_CORE_INTERNAL_TOKEN ?? "";

export const isCoreConfigured = Boolean(BASE && TOKEN);

type CoreParticipation = {
  score: number;
  status: "engaged" | "dormant" | "new";
  lastActiveDays: number | null;
  currentPhase: number;
  totalPhases: number;
  phaseProgressPct: number | null;
  overdue: boolean;
};

// Real participation for a user by email. Returns null when core isn't
// configured or the user/endpoint isn't reachable — callers fall back to stub.
export async function getParticipation(email: string): Promise<Participation | null> {
  if (!isCoreConfigured) return null;
  try {
    const res = await fetch(
      `${BASE}/participation?email=${encodeURIComponent(email)}`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const p = (await res.json()) as CoreParticipation;
    return {
      score: p.score,
      status: p.status,
      lastActiveDays: p.lastActiveDays,
      currentPhase: p.currentPhase,
      totalPhases: p.totalPhases,
      phaseProgressPct: p.phaseProgressPct,
      overdue: p.overdue,
    };
  } catch {
    return null;
  }
}
