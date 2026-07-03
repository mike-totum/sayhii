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
// The snapshot is only trusted when every company loaded. Anything less falls
// back to the direct core search — slower, but correct — so this path can
// never be quieter than the tool was before the snapshot existed.
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

  if (roster?.complete) {
    const results = filterRoster(roster.members, ql, company);
    if (results.length > 0) return { results, failed: false };
    // Email is the User primary key — a direct lookup still finds records
    // orphaned from a deleted or renamed org that the snapshot can't see.
    if (ql.includes("@")) {
      const direct = await getCustomerCore(ql);
      if (direct) return { results: [direct], failed: false };
    }
    return { results, failed: false };
  }

  // Snapshot unavailable or partial: use the old direct search.
  console.error(
    `[customer-search] roster ${roster ? "incomplete" : "unavailable"}, falling back to direct search`,
  );
  const direct = await searchCustomersCore(q, company);
  if (direct !== null) return { results: direct.slice(0, LIMIT), failed: false };

  // Direct search failed too; a partial roster is still better than nothing.
  if (roster && roster.members.length > 0) {
    return { results: filterRoster(roster.members, ql, company), failed: false };
  }
  return { results: [], failed: true };
}
