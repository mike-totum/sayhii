"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import type { AdminModule } from "@/lib/admin-modules";

export function AdminSidebar({
  locale,
  modules,
}: {
  locale: string;
  modules: AdminModule[];
}) {
  const pathname = usePathname();
  const prefix = `/${locale}`;
  const norm = (href: string) => `${prefix}${href}`;
  const home = norm("/admin");

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/60 bg-white/55 backdrop-blur-xl">
      <div className="px-6 h-16 flex items-center border-b border-border">
        <Link href={home} className="flex items-center gap-2">
          <Logo />
          <span className="text-[10px] uppercase tracking-[0.18em] rounded-full bg-primary/10 text-primary px-2 py-0.5">
            Admin
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <div className="px-3 mb-6">
          <p className="px-3 mb-2 text-xs uppercase tracking-[0.2em] text-muted">
            Modules
          </p>
          <ul className="space-y-1">
            {modules.map((m) => {
              const href = norm(m.href);
              const active = pathname?.startsWith(href);
              return (
                <li key={m.id}>
                  <Link
                    href={href}
                    className={`group relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
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
                    <span className={active ? "font-medium" : ""}>{m.label}</span>
                    {m.status !== "live" && (
                      <span className="text-[10px] uppercase tracking-[0.14em] rounded-full bg-border/70 text-muted px-1.5 py-0.5">
                        {m.status === "in-progress" ? "WIP" : "Soon"}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="px-6 py-4 border-t border-border text-xs text-muted">
        <p>
          <span className="font-serif italic">sayhii</span> internal admin
        </p>
      </div>
    </aside>
  );
}
