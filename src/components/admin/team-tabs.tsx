"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/team", label: "Overview", exact: true },
  { href: "/admin/team/people", label: "People" },
  { href: "/admin/team/goals", label: "Goals" },
  { href: "/admin/team/initiatives", label: "Initiatives" },
  { href: "/admin/team/boards", label: "Work boards" },
];

export function TeamTabs({ locale }: { locale: string }) {
  const pathname = usePathname();
  return (
    <nav className="mt-3 flex flex-wrap gap-1 border-b border-border">
      {TABS.map((t) => {
        const href = `/${locale}${t.href}`;
        const active = t.exact ? pathname === href : pathname?.startsWith(href);
        return (
          <Link
            key={t.href}
            href={href}
            className={`px-3.5 py-2 text-sm border-b-2 -mb-px transition-colors ${
              active
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
