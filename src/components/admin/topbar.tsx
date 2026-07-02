"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/[locale]/admin/actions";
import type { Staff } from "@/lib/admin-auth";

// Where-am-I label, mirroring the sidebar's items (display only — no gating).
const SECTIONS: [string, string][] = [
  ["/admin/dashboard", "Home"],
  ["/admin/team/pulse", "Pulse"],
  ["/admin/team/work", "Work"],
  ["/admin/team/initiatives", "Work"],
  ["/admin/team/engineering", "Engineering"],
  ["/admin/team/people", "Manage"],
  ["/admin/customers", "Customers"],
  ["/admin/companies", "Customers"],
];

export function AdminTopbar({
  staff,
  locale,
}: {
  staff: Staff;
  locale: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const section =
    SECTIONS.find(([p]) => pathname?.startsWith(`/${locale}${p}`))?.[1] ?? "Portal";

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const initials = staff.name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="px-6 lg:px-10 h-12 flex items-center justify-between gap-4">
        <p className="min-w-0 truncate text-[11px] uppercase tracking-[0.22em] text-muted">
          sayhii internal
          <span className="mx-2 text-border" aria-hidden>/</span>
          <span className="text-foreground font-medium">{section}</span>
        </p>

        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface pr-2.5 pl-1 py-1 hover:border-foreground/30 transition-colors"
          >
            <span
              className="size-6 rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground text-[10px] font-semibold flex items-center justify-center"
              aria-hidden
            >
              {initials}
            </span>
            <span className="text-xs font-medium hidden lg:inline">
              {staff.name}
            </span>
            <svg viewBox="0 0 24 24" fill="none" className="size-3.5 text-muted" aria-hidden>
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border bg-surface shadow-[0_24px_60px_-20px_rgba(15,17,23,0.25)] overflow-hidden"
            >
              <div className="p-4 border-b border-border">
                <p className="font-medium">{staff.name}</p>
                <p className="text-sm text-muted truncate">{staff.email}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5">
                  Staff
                </span>
              </div>
              <form action={signOut}>
                <input type="hidden" name="locale" value={locale} />
                <button
                  type="submit"
                  className="w-full text-left px-4 py-3 text-sm hover:bg-background transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
