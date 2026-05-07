"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import type { Role } from "@/lib/auth";

type Item = { href: string; label: string; icon: React.ReactNode };

const homeIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="size-5">
    <path
      d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7H10v7H4a1 1 0 0 1-1-1z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const heartIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="size-5">
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const cardIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="size-5">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);
const themeIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="size-5">
    <path
      d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const teamIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="size-5">
    <path
      d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const chartIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="size-5">
    <path
      d="M3 3v18h18M7 14l4-4 4 4 5-6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const layersIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="size-5">
    <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const treeIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="size-5">
    <path d="M12 4v6M5 14h14M5 14v6M19 14v6M12 14v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="5" cy="20.5" r="1.5" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="12" cy="20.5" r="1.5" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="19" cy="20.5" r="1.5" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);

const sparkIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="size-5">
    <path d="M5 17l4-7 4 4 6-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="19" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);
const docIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="size-5">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M14 3v5h5M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const profileIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="size-5">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const reportsIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="size-5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M14 2v6h6M9 14h6M9 18h6M9 10h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const userItems: Item[] = [
  { href: "/portal", label: "Home", icon: homeIcon },
  { href: "/portal/actions", label: "Actions", icon: sparkIcon },
  { href: "/portal/briefings", label: "Briefings", icon: docIcon },
  { href: "/portal/vitals", label: "Vitals", icon: heartIcon },
  { href: "/portal/scorecard", label: "Scorecard", icon: cardIcon },
  { href: "/portal/themes", label: "Themes", icon: themeIcon },
  { href: "/portal/reports", label: "Reports", icon: reportsIcon },
  { href: "/portal/profile", label: "Profile", icon: profileIcon },
];

const adminItems: Item[] = [
  { href: "/portal/admin/overview", label: "Overview", icon: chartIcon },
  { href: "/portal/admin/comparison", label: "Departments", icon: layersIcon },
  { href: "/portal/admin/hierarchy", label: "Hierarchy", icon: treeIcon },
  { href: "/portal/admin/users", label: "Users", icon: teamIcon },
];

export function Sidebar({
  locale,
  role,
}: {
  locale: string;
  role: Role;
}) {
  const pathname = usePathname();
  const localePrefix = `/${locale}`;
  const norm = (href: string) => `${localePrefix}${href}`;

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-surface/60">
      <div className="px-6 h-16 flex items-center border-b border-border">
        <Link href={norm("/portal")} className="flex items-center">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <Section title="For you">
          {userItems.map((it) => {
            const href = norm(it.href);
            const active =
              pathname === href ||
              (it.href !== "/portal" && pathname?.startsWith(href));
            return <Item key={it.href} item={it} href={href} active={active} />;
          })}
        </Section>

        {role === "admin" && (
          <Section title="Admin" pillLabel="Admin only">
            {adminItems.map((it) => {
              const href = norm(it.href);
              const active = pathname?.startsWith(href);
              return <Item key={it.href} item={it} href={href} active={active} />;
            })}
          </Section>
        )}
      </nav>

      <div className="px-6 py-4 border-t border-border text-xs text-muted">
        <p>
          <span className="font-serif italic">sayhii</span> demo · all data
          illustrative
        </p>
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
  pillLabel,
}: {
  title: string;
  children: React.ReactNode;
  pillLabel?: string;
}) {
  return (
    <div className="px-3 mb-6">
      <div className="px-3 mb-2 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{title}</p>
        {pillLabel && (
          <span className="text-[10px] uppercase tracking-[0.18em] rounded-full bg-primary/10 text-primary px-2 py-0.5">
            {pillLabel}
          </span>
        )}
      </div>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function Item({
  item,
  href,
  active,
}: {
  item: Item;
  href: string;
  active: boolean | undefined;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
          active
            ? "text-foreground bg-gradient-to-r from-warm/70 via-accent-soft/40 to-transparent"
            : "text-muted hover:text-foreground hover:bg-background"
        }`}
      >
        {active && (
          <span
            aria-hidden
            className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-primary"
          />
        )}
        <span className={active ? "text-primary" : "text-muted"}>
          {item.icon}
        </span>
        <span className={active ? "font-medium" : ""}>{item.label}</span>
      </Link>
    </li>
  );
}
