"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AccountStatus, ParticipationStatus } from "@/lib/customers";
import type { SearchOutcome } from "@/lib/customer-search";

type Props = {
  locale: string;
  companies: string[];
  initialQ: string;
  initialCompany: string;
  // Server-rendered results for the initial URL params; null = landing state.
  initial: SearchOutcome | null;
};

const DEBOUNCE_MS = 250;

export default function CustomerSearch({
  locale,
  companies,
  initialQ,
  initialCompany,
  initial,
}: Props) {
  const [q, setQ] = useState(initialQ);
  const [company, setCompany] = useState(initialCompany);
  const [outcome, setOutcome] = useState<SearchOutcome | null>(initial);
  const [pending, setPending] = useState(false);
  const firstRender = useRef(true);
  // One request in flight at a time; only the newest queued query fires next.
  // A cold backend can take many seconds per search, and aborted fetches
  // don't stop the server-side work — serializing keeps a burst of typing
  // from stacking expensive queries on core.
  const queued = useRef<string | null>(null);
  const running = useRef(false);

  async function pump() {
    if (running.current) return;
    running.current = true;
    try {
      while (queued.current !== null) {
        const params = queued.current;
        queued.current = null;
        let next: SearchOutcome;
        try {
          const res = await fetch(`/api/admin/customers/search?${params}`);
          if (!res.ok) throw new Error(`search ${res.status}`);
          next = (await res.json()) as SearchOutcome;
        } catch {
          next = { results: [], failed: true };
        }
        // Stale if the user kept typing — skip straight to the newer query.
        if (queued.current === null) {
          setOutcome(next);
          setPending(false);
        }
      }
    } finally {
      running.current = false;
    }
  }

  useEffect(() => {
    // The server already rendered results for the initial params.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q);
    if (company) params.set("company", company);
    // Keep the URL shareable without a server round trip per keystroke —
    // replaceState integrates with the Next router.
    window.history.replaceState(
      null,
      "",
      params.size ? `?${params}` : window.location.pathname,
    );

    if (!q.trim() && !company) {
      queued.current = null;
      setOutcome(null);
      setPending(false);
      return;
    }

    setPending(true);
    const timer = setTimeout(() => {
      queued.current = params.toString();
      void pump();
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, company]);

  return (
    <>
      <form
        className="mt-8 flex flex-col sm:flex-row gap-3"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="relative flex-1">
          <input
            type="search"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="email or name…"
            aria-label="Search customers"
            autoFocus
            className="w-full h-11 rounded-[4px] border border-border bg-surface px-4 text-sm placeholder:text-muted/70 focus:border-foreground/40 focus:outline-none transition-colors"
          />
          {pending && (
            <span
              aria-hidden
              className="absolute right-4 top-1/2 -translate-y-1/2 size-4 rounded-full border-2 border-border border-t-foreground/60 animate-spin"
            />
          )}
        </div>
        <select
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          aria-label="Filter by company"
          className="h-11 rounded-[4px] border border-border bg-surface px-4 text-sm focus:border-foreground/40 focus:outline-none transition-colors"
        >
          <option value="">All companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </form>

      {outcome === null ? (
        <div className="mt-8 rounded-2xl glass px-6 py-12 text-center">
          <p className="text-sm font-medium">Start typing to search</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted">
            Results filter as you type — a name, an email, or pick a company to
            browse its people.
          </p>
        </div>
      ) : outcome.failed ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 px-6 py-8 text-center">
          <p className="text-sm font-medium">Search is unavailable</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted">
            The customer directory didn&apos;t respond. Try again in a moment —
            a full email address is the fastest path.
          </p>
        </div>
      ) : (
        <div
          className={`mt-8 transition-opacity ${pending ? "opacity-60" : ""}`}
        >
          <p className="text-xs uppercase tracking-[0.18em] text-muted mb-3">
            {outcome.results.length}{" "}
            {outcome.results.length === 1 ? "result" : "results"}
          </p>
          <ul className="divide-y divide-white/50 rounded-2xl glass overflow-hidden">
            {outcome.results.map((r) => (
              <li key={r.email}>
                <Link
                  href={`/${locale}/admin/customers/${encodeURIComponent(r.email)}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/50 transition-colors"
                >
                  <span className="size-9 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground text-xs font-semibold flex items-center justify-center">
                    {initials(r.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{r.name}</p>
                    <p className="text-xs text-muted truncate">
                      {r.email} · {r.company}
                      {r.department ? ` · ${r.department}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                  <ParticipationDot status={r.participationStatus} />
                </Link>
              </li>
            ))}
            {outcome.results.length === 0 && (
              <li className="px-5 py-8 text-sm text-muted text-center">
                No matches. Try the full email address.
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const map: Record<AccountStatus, string> = {
    active: "bg-accent-soft/70 text-foreground border-accent/40",
    unconfirmed: "bg-amber-100 text-foreground border-amber-200",
    disabled: "bg-rose-100 text-foreground border-rose-200",
  };
  return (
    <span
      className={`hidden sm:inline-flex shrink-0 text-[11px] capitalize rounded-full border px-2.5 py-0.5 ${map[status]}`}
    >
      {status}
    </span>
  );
}

function ParticipationDot({ status }: { status: ParticipationStatus }) {
  const map: Record<ParticipationStatus, string> = {
    engaged: "bg-accent",
    dormant: "bg-primary",
    new: "bg-muted",
  };
  return (
    <span
      aria-label={`Participation: ${status}`}
      className={`shrink-0 size-2 rounded-full ${map[status]}`}
    />
  );
}
