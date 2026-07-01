"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Pulse = the team Monday cockpit; Work = epics ▸ issues; People = the roster.
// (The personal dashboard is now its own standalone sidebar module.)
const TABS = [
  { href: "/admin/team/pulse", label: "Pulse" },
  { href: "/admin/team/work", label: "Work" },
  { href: "/admin/team/engineering", label: "Engineering" },
  { href: "/admin/team/people", label: "People" },
];

export function TeamTabs({ locale }: { locale: string }) {
  const pathname = usePathname();
  return (
    <nav className="mt-4 inline-flex gap-1 rounded-full glass p-1">
      {TABS.map((t) => {
        const href = `/${locale}${t.href}`;
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={t.href}
            href={href}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              active
                ? "bg-foreground text-background font-medium shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
