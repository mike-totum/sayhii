"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { en } from "@/dictionaries/en";
import { es } from "@/dictionaries/es";
import { localePath, locales, type Locale } from "@/lib/i18n";

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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        <Link href={localePath(locale, "/")} className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {links.map((l) => {
            const localized = localePath(locale, l.href);
            const active = pathname === localized;
            return (
              <Link
                key={l.href}
                href={localized}
                className={`px-3 py-2 rounded-full transition-colors ${
                  active
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LocaleSwitch locale={locale} />
          <Link
            href={localePath(locale, "/contact")}
            className="inline-flex h-9 items-center rounded-full bg-foreground text-background px-4 text-sm font-medium hover:bg-foreground/85 transition-colors"
          >
            {dict.nav.cta}
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <LocaleSwitch locale={locale} />
          <button
            aria-label={dict.nav.toggleMenu}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center size-10 rounded-full border border-border bg-surface"
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
        <div className="md:hidden border-t border-border/60 bg-background">
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
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground text-background px-4 text-sm font-medium"
            >
              {dict.nav.cta}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function LocaleSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  function pathFor(target: Locale) {
    if (!pathname) return `/${target}`;
    const segments = pathname.split("/");
    if (segments[1] && (locales as readonly string[]).includes(segments[1])) {
      segments[1] = target;
      return segments.join("/") || `/${target}`;
    }
    return `/${target}${pathname === "/" ? "" : pathname}`;
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center rounded-full border border-border bg-surface text-xs font-medium overflow-hidden"
    >
      {locales.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href={pathFor(l)}
            aria-current={active ? "true" : undefined}
            className={`px-2.5 py-1 transition-colors ${
              active
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            {l.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
