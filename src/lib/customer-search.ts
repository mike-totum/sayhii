import "server-only";
import { searchCustomers, type CustomerSummary } from "./customers";
import {
  getCustomerCore,
  getRosterCore,
  isCoreConfigured,
  searchCustomersCore,
} from "./core-api";

// Mirror core's SEARCH_LIMIT — the UI is a lookup tool, not a directory dump.
const LIMIT = 50;

export type SearchOutcome = {
  results: CustomerSummary[];
  failed: boolean;
  // True when results came from an incomplete roster snapshot — matches from
  // companies that haven't loaded yet may be missing.
  partial?: boolean;
};

function filterRoster(
  roster: CustomerSummary[],
  ql: string,
  company?: string,
): CustomerSummary[] {
  return roster
    .filter((u) => {
      if (company && u.company !== company) return false;
      if (!ql) return true;
      return (
        u.email.toLowerCase().includes(ql) ||
        u.name.toLowerCase().includes(ql) ||
        u.company.toLowerCase().includes(ql)
      );
    })
    .slice(0, LIMIT);
}

// Customer search over the cached roster snapshot. Same match semantics as
// core's /internal/customers (substring on email, name, company) but filtered
// here against getRosterCore() instead of calling the endpoint, whose
// free-text path scans the entire prod User table.
//
// Degradation order when the snapshot is incomplete: show what the snapshot
// has (flagged partial) → exact-email primary-key lookup → direct core
// search → honest failure. Never silently return nothing while claiming
// success.
export async function searchRoster(
  q: string,
  company?: string,
): Promise<SearchOutcome> {
  if (!isCoreConfigured) {
    const results = (await searchCustomers(q, company)).slice(0, LIMIT);
    return { results, failed: false };
  }

  const ql = q.trim().toLowerCase();
  const roster = await getRosterCore();
  const hits = filterRoster(roster?.members ?? [], ql, company);

  // Email is the User primary key — a key read answers fast even when the
  // org queries above are timing out, and still finds records orphaned from
  // a deleted or renamed org that the snapshot can't see.
  if (hits.length === 0 && ql.includes("@")) {
    const direct = await getCustomerCore(ql);
    if (direct) return { results: [direct], failed: false };
  }

  if (roster?.complete) return { results: hits, failed: false };

  if (hits.length > 0) {
    return { results: hits, failed: false, partial: true };
  }

  // Nothing in the partial snapshot — last resort is the direct search.
  console.error(
    `[customer-search] roster ${
      roster ? `partial ${roster.loaded}/${roster.total}` : "unavailable"
    }, trying direct search`,
  );
  const direct = await searchCustomersCore(q, company);
  if (direct !== null) {
    return { results: direct.slice(0, LIMIT), failed: false };
  }
  return { results: [], failed: true };
}
