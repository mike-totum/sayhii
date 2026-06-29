"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { LocaleSwitch } from "./locale-switch";
import { en } from "@/dictionaries/en";
import { es } from "@/dictionaries/es";
import { localePath, logicalPath, type Locale } from "@/lib/i18n";

type Props = { locale: Locale };

const dicts = { en, es } as const;

export function Nav({ locale }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dict = dicts[locale];

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const links = [
    { href: "/notes", label: dict.nav.notes },
    { href: "/blog", label: dict.nav.blog },
    { href: "/contact", label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        <Link href={localePath(locale, "/")} className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {links.map((l) => {
            const localized = localePath(locale, l.href);
            const active = logicalPath(pathname || "/") === l.href;
            return (
              <Link
                key={l.href}
                href={localized}
                className={`px-3 py-2 border-b-2 transition-colors ${
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href={localePath(locale, "/contact")}
            className="inline-flex h-9 items-center rounded-[4px] bg-foreground text-background px-4 text-sm font-medium hover:bg-primary transition-colors"
          >
            {dict.nav.cta}
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button
            aria-label={dict.nav.toggleMenu}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center size-10 rounded-[4px] border border-border bg-surface"
          >
            <span className="relative block w-4 h-3">
              <span
                className={`absolute left-0 top-0 h-0.5 w-full bg-foreground transition-transform ${
                  mobileOpen ? "translate-y-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-foreground transition-opacity ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 bottom-0 h-0.5 w-full bg-foreground transition-transform ${
                  mobileOpen ? "-translate-y-1 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-6 py-6 space-y-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={localePath(locale, l.href)}
                className="block py-2 text-base font-medium hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={localePath(locale, "/contact")}
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-[4px] bg-foreground text-background px-4 text-sm font-medium"
            >
              {dict.nav.cta}
            </Link>
            <div className="pt-3 mt-3 border-t border-border">
              <LocaleSwitch locale={locale} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
