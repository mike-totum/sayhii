"use client";

import { usePathname } from "next/navigation";
import { locales, defaultLocale, localePath, logicalPath } from "@/lib/i18n";

const SITE = "https://sayhii.io";

// Emits <link rel="alternate" hreflang> tags so search engines understand the
// language alternates — this is what does the real SEO work, independent of
// any visible language switch. React hoists these <link> tags into <head>,
// and they render in the static HTML at build time. Normalizing through
// logicalPath keeps the output identical whether the runtime hands us a clean
// or internally-rewritten pathname (so no hydration mismatch).
export function Hreflang() {
  const path = logicalPath(usePathname() || "/");

  const href = (l: (typeof locales)[number]) => {
    const p = localePath(l, path);
    return `${SITE}${p === "/" ? "/" : p}`;
  };

  return (
    <>
      {locales.map((l) => (
        <link key={l} rel="alternate" hrefLang={l} href={href(l)} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={href(defaultLocale)} />
    </>
  );
}
