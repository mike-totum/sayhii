import { en } from "@/dictionaries/en";
import { es } from "@/dictionaries/es";

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

const dictionaries = { en, es } as const;

export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

// The default locale (English) lives at clean, unprefixed URLs (/, /blog);
// other locales are prefixed (/es, /es/blog).
export function localePath(locale: Locale, path: string): string {
  if (path.startsWith("http") || path.startsWith("mailto:")) return path;
  if (path.startsWith("#")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return `/${locale}${clean === "/" ? "" : clean}`;
}

// Strip any leading locale segment to get the locale-independent path. Used to
// compare/active-match and to rebuild URLs regardless of whether the runtime
// handed us a clean ("/blog") or internally-rewritten ("/en/blog") pathname.
export function logicalPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] && isLocale(parts[0])) parts.shift();
  return "/" + parts.join("/");
}

import type { ReactNode } from "react";

// Renders a string with `*emphasis*` markers as serif-italic spans.
// Used for translated headlines that retain the brand's italic accent words.
export function fmt(s: string): ReactNode[] {
  const parts = s.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <span key={i} className="font-serif italic font-normal">
          {part.slice(1, -1)}
        </span>
      );
    }
    return part;
  });
}
