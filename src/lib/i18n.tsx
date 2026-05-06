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

export function localePath(locale: Locale, path: string): string {
  if (path.startsWith("http") || path.startsWith("mailto:")) return path;
  if (path.startsWith("#")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean === "/" ? "" : clean}`;
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
