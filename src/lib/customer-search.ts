import "server-only";
import { searchCustomers, type CustomerSummary } from "./customers";
import { getCustomerCore, getRosterCore, isCoreConfigured } from "./core-api";

// Mirror core's SEARCH_LIMIT — the UI is a lookup tool, not a directory dump.
const LIMIT = 50;

export type SearchOutcome = {
  results: CustomerSummary[];
  failed: boolean;
};

// Customer search over the cached roster snapshot. Same match semantics as
// core's /internal/customers (substring on email, name, company) but filtered
// here against getRosterCore() instead of calling the endpoint, whose
// free-text path scans the entire prod User table.
export async function searchRoster(
  q: string,
  company?: string,
): Promise<SearchOutcome> {
  if (!isCoreConfigured) {
    const results = (await searchCustomers(q, company)).slice(0, LIMIT);
    return { results, failed: false };
  }

  const roster = await getRosterCore();
  if (roster === null) return { results: [], failed: true };

  const ql = q.trim().toLowerCase();
  const results = roster
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

  // The snapshot only covers members of orgs in the Organization table. Email
  // is the User primary key, so when the snapshot comes up empty for what
  // looks like an email, try the direct (instant) lookup — this still finds
  // records orphaned from a deleted or renamed org.
  if (results.length === 0 && ql.includes("@")) {
    const direct = await getCustomerCore(ql);
    if (direct) return { results: [direct], failed: false };
  }

  return { results, failed: false };
}
