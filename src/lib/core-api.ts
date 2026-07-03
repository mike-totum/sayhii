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
  const started = Date.now();
  const route = path.split("?")[0];
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      signal: AbortSignal.timeout(timeoutMs),
      ...(revalidate !== undefined
        ? { next: { revalidate } }
        : { cache: "no-store" as const }),
    });
    if (!res.ok) {
      console.error(`[core-api] ${route} -> ${res.status} in ${Date.now() - started}ms`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(
      `[core-api] ${route} -> ${err instanceof Error ? err.name : "error"} in ${Date.now() - started}ms`,
    );
    return null;
  }
}

// Bounded-concurrency map: fanning out one request per company must not hit
// core with everything at once — it's already the slow party.
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
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

// --- roster snapshot (search corpus) ----------------------------------------

export type Roster = {
  members: CustomerSummary[];
  // False when any company failed to load — callers must not trust an
  // incomplete snapshot to declare "no matches".
  complete: boolean;
};

// Full cross-org roster assembled from per-company queries. Each org lookup
// hits core's OrganizationAndIdIndex, so this never triggers the full
// User-table scan behind /internal/customers?q= (10-35s on prod). Every
// company fetch is cached for 5 minutes, so after the first assembly the
// roster serves from cache in milliseconds — fast enough to filter per
// keystroke. Rosters only change on HRIS sync; 5 minutes of staleness is fine
// for search, and the record card always fetches live by email.
export async function getRosterCore(): Promise<Roster | null> {
  const companies = await getCompaniesCore();
  if (!companies || companies.length === 0) return null;
  // Short per-company timeout: a healthy indexed query answers fast, and an
  // incomplete roster falls back to direct search anyway — don't sit through
  // the full 25s for each straggler.
  const details = await mapLimit(companies, 6, (c) =>
    coreGet<CompanyDetail>(`/internal/company?name=${qp(c.name)}`, {
      revalidate: 300,
      timeoutMs: 10_000,
    }),
  );
  const loaded = details.filter((d): d is CompanyDetail => d !== null);
  if (loaded.length < details.length) {
    console.error(
      `[core-api] roster incomplete: ${details.length - loaded.length}/${details.length} companies failed`,
    );
  }
  return {
    members: loaded.flatMap((d) => d.members),
    complete: loaded.length === details.length,
  };
}
