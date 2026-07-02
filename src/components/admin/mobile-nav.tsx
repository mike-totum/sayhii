"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildNav, isActive, type NavFlags } from "./admin-nav";

// Phone navigation: a fixed glass bottom bar with the same relevance-gated
// items as the sidebar. Before this, the portal had no nav at all below lg.

export function AdminMobileNav({ locale, nav }: { locale: string; nav: NavFlags }) {
  const pathname = usePathname();
  const prefix = `/${locale}`;
  const items = buildNav(nav);

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-white/70"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Portal"
    >
      <ul className="flex items-stretch justify-around px-1">
        {items.map((item) => {
          const active = isActive(pathname, prefix, item);
          const Icon = item.icon;
          return (
            <li key={item.id} className="min-w-0 flex-1">
              <Link
                href={`${prefix}${item.href}`}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors ${
                  active ? "text-primary" : "text-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-5" />
                <span className={`truncate ${active ? "font-medium" : ""}`}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
