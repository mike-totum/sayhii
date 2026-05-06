"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const links = [
  { href: "/notes", label: "Notes from the Field" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-full transition-colors ${
                  active ? "text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/contact"
            className="inline-flex h-9 items-center rounded-full bg-foreground text-background px-4 text-sm font-medium hover:bg-foreground/85 transition-colors"
          >
            Schedule a 30-min chat
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center size-10 rounded-full border border-border bg-surface"
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

      {mobileOpen && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-6 space-y-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block py-2 text-base font-medium hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground text-background px-4 text-sm font-medium"
            >
              Schedule a 30-min chat
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
