"use client";

import { usePathname } from "next/navigation";
import { locales, defaultLocale } from "@/lib/i18n";

const SITE = "https://sayhii.io";

// Emits <link rel="alternate" hreflang> tags so search engines understand the
// language alternates — this is what does the real SEO work, independent of
// any visible language switch. React hoists these <link> tags into <head>,
// and they render in the static HTML at build time.
export function Hreflang() {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/");
  const hasLocale =
    segments[1] && (locales as readonly string[]).includes(segments[1]);
  const rest = hasLocale ? "/" + segments.slice(2).join("/") : pathname;
  const clean = rest === "/" ? "" : rest.replace(/\/$/, "");

  return (
    <>
      {locales.map((l) => (
        <link
          key={l}
          rel="alternate"
          hrefLang={l}
          href={`${SITE}/${l}${clean}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${SITE}/${defaultLocale}${clean}`}
      />
    </>
  );
}
