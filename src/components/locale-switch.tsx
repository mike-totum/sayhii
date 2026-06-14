"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

const LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

// A quiet footer-style language switch. Auto-detection (the proxy) picks the
// language on first visit; this is the manual override, and clicking it drops
// a cookie so the choice persists across visits instead of being re-detected.
export function LocaleSwitch({ locale }: { locale: Locale }) {
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

  function persist(target: Locale) {
    document.cookie = `locale=${target}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <div className="inline-flex items-center gap-2 text-xs text-muted">
      {locales.map((l, i) => {
        const active = l === locale;
        return (
          <span key={l} className="inline-flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-border">/</span>}
            <Link
              href={pathFor(l)}
              onClick={() => persist(l)}
              aria-current={active ? "true" : undefined}
              hrefLang={l}
              className={
                active
                  ? "text-foreground"
                  : "hover:text-foreground transition-colors"
              }
            >
              {LABELS[l]}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
