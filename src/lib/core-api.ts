import "server-only";
import type {
  CompanyDetail,
  CompanySummary,
  CustomerRecord,
  CustomerSummary,
  Participation,
} from "./customers";

// BFF client for sayhii-core (the product API). The internal key + base URL
// are server-side env (set in Vercel); the key never reaches the browser.
//   SAYHII_CORE_API_URL          e.g. https://api-dev.sayhii.io
//   SAYHII_CORE_INTERNAL_TOKEN   internal API key (org_id __internal__)
const BASE = (process.env.SAYHII_CORE_API_URL ?? "").replace(/\/$/, "");
const TOKEN = process.env.SAYHII_CORE_INTERNAL_TOKEN ?? "";

export const isCoreConfigured = Boolean(BASE && TOKEN);

// Core's internal endpoints iterate the prod User table and can be SLOW
// (10-35s+ observed on prod). Every call gets a hard timeout so a slow core
// can never hang a page render; callers treat null as "unavailable".
async function coreGet<T>(
  path: string,
  opts: { timeoutMs?: number; revalidate?: number } = {},
): Promise<T | null> {
  if (!isCoreConfigured) return null;
  const { timeoutMs = 25_000, revalidate } = opts;
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      signal: AbortSignal.timeout(timeoutMs),
      ...(revalidate !== undefined
        ? { next: { revalidate } }
        : { cache: "no-store" as const }),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const qp = (v: string) => encodeURIComponent(v);

// --- participation (separate endpoint) -------------------------------------

export async function getParticipation(email: string): Promise<Participation | null> {
  return coreGet<Participation>(`/participation?email=${qp(email)}`);
}

// --- identity + search (cross-org) -----------------------------------------

export async function searchCustomersCore(
  q: string,
  company?: string,
): Promise<CustomerSummary[] | null> {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (company) params.set("company", company);
  return coreGet<CustomerSummary[]>(`/internal/customers?${params.toString()}`);
}

export async function getCustomerCore(email: string): Promise<CustomerRecord | null> {
  const detail = await coreGet<Omit<CustomerRecord, "participation">>(
    `/internal/customers/by-email?email=${qp(email)}`,
  );
  if (!detail) return null;
  // Identity from core; participation is fetched separately and merged by the
  // page. Placeholder here reflects the cheap status until that resolves.
  return {
    ...detail,
    participation: {
      score: 0,
      status: detail.participationStatus,
      lastActiveDays: null,
      currentPhase: 1,
      totalPhases: 0,
      phaseProgressPct: null,
      overdue: false,
    },
  };
}

export async function getCompaniesCore(): Promise<CompanySummary[] | null> {
  // Org names change rarely and the endpoint is expensive on prod — cache for
  // an hour so the search page doesn't pay for it on every load.
  return coreGet<CompanySummary[]>(`/internal/companies`, { revalidate: 3600 });
}

export async function getCompanyCore(name: string): Promise<CompanyDetail | null> {
  return coreGet<CompanyDetail>(`/internal/company?name=${qp(name)}`);
}
