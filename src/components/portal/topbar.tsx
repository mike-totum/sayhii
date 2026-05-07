"use client";

import { useState, useEffect, useRef } from "react";
import { signOut } from "@/app/[locale]/portal/actions";
import { CommandPalette } from "@/components/portal/command-palette";
import type { Session } from "@/lib/auth";

export function Topbar({
  session,
  locale,
}: {
  session: Session;
  locale: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const initials = session.name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            {session.role === "admin" ? "Admin" : "Welcome back"}
          </p>
          <p className="text-sm font-medium leading-tight truncate">
            {session.role === "admin"
              ? `${session.team} · sayhii-demo`
              : `Hi, ${session.name.split(" ")[0]}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CommandPalette locale={locale} role={session.role} />

          <span
            aria-hidden
            className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft/60 px-2.5 py-1 text-[11px] font-medium text-foreground/80"
          >
            <span className="size-1.5 rounded-full bg-accent animate-pulse-soft" />
            Live
          </span>

          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              className="inline-flex items-center gap-3 rounded-full border border-border bg-surface pr-3 pl-1.5 py-1.5 hover:border-foreground/30 transition-colors"
            >
              <span
                className="size-7 rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground text-xs font-semibold flex items-center justify-center"
                aria-hidden
              >
                {initials}
              </span>
              <span className="text-sm font-medium hidden lg:inline">
                {session.name}
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-4 text-muted"
                aria-hidden
              >
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
                  <p className="font-medium">{session.name}</p>
                  <p className="text-sm text-muted truncate">{session.email}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5">
                    {session.role === "admin" ? "Admin" : "Employee"}
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
      </div>
    </header>
  );
}
