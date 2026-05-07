"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/auth";

type Item = {
  id: string;
  label: string;
  hint: string;
  href: string;
  group: "Navigate" | "Admin";
  keywords?: string;
};

export function CommandPalette({
  locale,
  role,
}: {
  locale: string;
  role: Role;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    const base: Item[] = [
      { id: "home", label: "Home", hint: "Daily check-in and at-a-glance metrics", href: `/${locale}/portal`, group: "Navigate" },
      { id: "vitals", label: "Vitals", hint: "Resources, demands, work-life balance", href: `/${locale}/portal/vitals`, group: "Navigate" },
      { id: "scorecard", label: "Scorecard", hint: "Wellness, engagement, themes", href: `/${locale}/portal/scorecard`, group: "Navigate", keywords: "score wellness engagement" },
      { id: "themes", label: "All themes", hint: "Browse the thirteen signals", href: `/${locale}/portal/themes`, group: "Navigate" },
      { id: "profile", label: "Profile", hint: "Your personal info", href: `/${locale}/portal/profile`, group: "Navigate" },
      { id: "reports", label: "Reports", hint: "Download org and personal reports", href: `/${locale}/portal/reports`, group: "Navigate" },
      { id: "trust", label: "Theme: Trust", hint: "Drill into the Trust theme", href: `/${locale}/portal/themes/trust`, group: "Navigate" },
      { id: "communication", label: "Theme: Communication", hint: "Drill into Communication", href: `/${locale}/portal/themes/communication`, group: "Navigate" },
      { id: "environment", label: "Theme: Environment", hint: "Drill into Environment", href: `/${locale}/portal/themes/environment`, group: "Navigate" },
      { id: "recognition", label: "Theme: Recognition", hint: "Drill into Recognition", href: `/${locale}/portal/themes/recognition`, group: "Navigate" },
    ];
    if (role === "admin") {
      base.push(
        { id: "overview", label: "Admin · Overview", hint: "Adoption, participation, top movers", href: `/${locale}/portal/admin/overview`, group: "Admin" },
        { id: "comparison", label: "Admin · Departments", hint: "Heatmap of themes by group", href: `/${locale}/portal/admin/comparison`, group: "Admin" },
        { id: "hierarchy", label: "Admin · Hierarchy", hint: "Manager and group rollups", href: `/${locale}/portal/admin/hierarchy`, group: "Admin" },
        { id: "users", label: "Admin · Users", hint: "All people in the org", href: `/${locale}/portal/admin/users`, group: "Admin" },
      );
    }
    return base;
  }, [locale, role]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      `${it.label} ${it.hint} ${it.keywords ?? ""}`.toLowerCase().includes(q),
    );
  }, [items, query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const cmd = isMac ? e.metaKey : e.ctrlKey;
      if (cmd && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        return;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setActive(0);
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  function go(item: Item) {
    setOpen(false);
    router.push(item.href);
  }

  function onListKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      const item = filtered[active];
      if (item) go(item);
    }
  }

  // Group filtered items
  const groups = useMemo(() => {
    const out: Record<string, Item[]> = {};
    filtered.forEach((it) => {
      out[it.group] = out[it.group] ? [...out[it.group], it] : [it];
    });
    return out;
  }, [filtered]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="hidden sm:inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-4">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span>Search</span>
        <kbd className="ml-2 inline-flex items-center gap-0.5 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal
          aria-label="Command palette"
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
        >
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-surface shadow-[0_30px_80px_-20px_rgba(15,17,23,0.35)] overflow-hidden">
            <div className="flex items-center gap-3 px-4 h-12 border-b border-border">
              <svg viewBox="0 0 24 24" fill="none" className="size-4 text-muted">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
                <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onListKey}
                placeholder="Jump to anywhere…"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted"
              />
              <kbd className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted">
                Esc
              </kbd>
            </div>

            <div className="max-h-[420px] overflow-y-auto py-2">
              {filtered.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-muted">
                  No matches.
                </p>
              )}
              {Object.entries(groups).map(([groupName, list]) => (
                <div key={groupName} className="py-1">
                  <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-[0.18em] text-muted">
                    {groupName}
                  </p>
                  <ul>
                    {list.map((it) => {
                      const idx = filtered.indexOf(it);
                      const isActive = idx === active;
                      return (
                        <li key={it.id}>
                          <button
                            onClick={() => go(it)}
                            onMouseEnter={() => setActive(idx)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isActive ? "bg-background" : "hover:bg-background/60"
                            }`}
                          >
                            <span className="flex-1 min-w-0">
                              <span className="text-sm font-medium block truncate">
                                {it.label}
                              </span>
                              <span className="text-xs text-muted truncate block">
                                {it.hint}
                              </span>
                            </span>
                            {isActive && (
                              <kbd className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted">
                                ↵
                              </kbd>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-4 py-2 flex items-center gap-3 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>
                navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
                open
              </span>
              <span className="ml-auto">
                <span className="font-serif italic">sayhii</span> · ⌘K from anywhere
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
