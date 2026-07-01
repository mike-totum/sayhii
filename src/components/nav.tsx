"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { LocaleSwitch } from "./locale-switch";
import { en } from "@/dictionaries/en";
import { es } from "@/dictionaries/es";
import { localePath, logicalPath, type Locale } from "@/lib/i18n";

type Props = { locale: Locale };

const dicts = { en, es } as const;

// The two customer-facing apps this landing page hands off to. (The internal
// /admin portal is intentionally not listed here — it's staff-only.)
const PORTALS = [
  { label: "Client Portal", hint: "Clients & employees", href: "https://portal.sayhii.io/#/sign-in" },
  { label: "Partner Portal", hint: "Partners", href: "https://www.sayhii.io/partner-portal" },
];

export function Nav({ locale }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const loginRef = useRef<HTMLDivElement | null>(null);
  const dict = dicts[locale];

  useEffect(() => {
    setMobileOpen(false);
    setLoginOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!loginRef.current?.contains(e.target as Node)) setLoginOpen(false);
    }
    if (loginOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [loginOpen]);

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

        <div className="hidden md:flex items-center gap-2">
          <div className="relative" ref={loginRef}>
            <button
              onClick={() => setLoginOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={loginOpen}
              className="inline-flex h-9 items-center gap-1 rounded-[4px] border border-border px-3 text-sm font-medium text-foreground hover:border-foreground/30 transition-colors"
            >
              {dict.nav.login}
              <svg viewBox="0 0 24 24" fill="none" className={`size-4 text-muted transition-transform ${loginOpen ? "rotate-180" : ""}`} aria-hidden>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {loginOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-[6px] border border-border bg-surface shadow-[0_20px_50px_-20px_rgba(15,17,23,0.3)]"
              >
                {PORTALS.map((p) => (
                  <a
                    key={p.href}
                    href={p.href}
                    className="block px-4 py-3 hover:bg-background transition-colors"
                  >
                    <span className="block text-sm font-medium">{p.label}</span>
                    <span className="block text-xs text-muted">{p.hint}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
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
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-muted">{dict.nav.login}</p>
              {PORTALS.map((p) => (
                <a key={p.href} href={p.href} className="block py-2 text-base font-medium hover:text-primary transition-colors">
                  {p.label}
                </a>
              ))}
            </div>
            <div className="pt-3 mt-3 border-t border-border">
              <LocaleSwitch locale={locale} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
