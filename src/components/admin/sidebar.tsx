"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import {
  buildNav,
  isActive,
  SECTION_LABELS,
  type NavFlags,
  type NavItem,
} from "./admin-nav";

// Desktop navigation. One flat list — 5-person company, everyone sees every
// tool; Manage (admin-only) sits under its own small label.

export function AdminSidebar({ locale, nav }: { locale: string; nav: NavFlags }) {
  const pathname = usePathname();
  const prefix = `/${locale}`;
  const items = buildNav(nav);

  const sections: NavItem["section"][] = ["main", "admin"];

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-white/60 bg-white/55 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen">
      <div className="px-6 h-16 flex items-center border-b border-border/70">
        <Link href={`${prefix}/admin/dashboard`} className="flex items-center gap-2">
          <Logo />
          <span className="text-[10px] uppercase tracking-[0.18em] rounded-full bg-primary/10 text-primary px-2 py-0.5">
            Internal
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {sections.map((section) => {
          const group = items.filter((i) => i.section === section);
          if (group.length === 0) return null;
          const label = SECTION_LABELS[section];
          return (
            <div key={section} className="mb-5 last:mb-0">
              {label && (
                <p className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.22em] text-muted/80">
                  {label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.map((item) => {
                  const active = isActive(pathname, prefix, item);
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <Link
                        href={`${prefix}${item.href}`}
                        className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                          active
                            ? "text-foreground bg-gradient-to-r from-warm/80 via-accent-soft/40 to-transparent"
                            : "text-muted hover:text-foreground hover:bg-white/70"
                        }`}
                      >
                        {active && (
                          <span
                            aria-hidden
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-primary"
                          />
                        )}
                        <Icon
                          className={`size-[18px] shrink-0 transition-colors ${
                            active ? "text-primary" : "text-muted/70 group-hover:text-foreground/70"
                          }`}
                        />
                        <span className={active ? "font-medium" : ""}>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-border/70 text-xs text-muted">
        <p>
          <span className="font-serif italic">sayhii</span> internal
        </p>
      </div>
    </aside>
  );
}
