import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;
// Authenticated sections stay locale-prefixed; they aren't indexed marketing
// pages, so clean URLs don't matter there.
const APP_SECTIONS = new Set(["admin"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/-/") ||
    /\/(opengraph|twitter)-image$/.test(pathname) ||
    PUBLIC_FILE.test(pathname)
  ) {
    return;
  }

  const parts = pathname.split("/").filter(Boolean);
  let loc: string | null = null;
  let rest = parts;
  if (parts[0] && isLocale(parts[0])) {
    loc = parts[0];
    rest = parts.slice(1);
  }
  const restPath = rest.length ? "/" + rest.join("/") : "";
  const isApp = rest[0] ? APP_SECTIONS.has(rest[0]) : false;

  // A persisted manual choice (cookie) wins over browser auto-detection.
  const saved = request.cookies.get("locale")?.value;
  const accept = request.headers.get("accept-language") ?? "";
  const preferred = isLocale(saved ?? "")
    ? (saved as string)
    : accept.toLowerCase().includes("es")
      ? "es"
      : defaultLocale;

  const to = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return url;
  };

  // App sections: keep them locale-prefixed; add a locale only if missing.
  if (isApp) {
    if (loc) return;
    return NextResponse.redirect(to(`/${preferred}${restPath}`));
  }

  // Marketing — default locale at clean URLs, others prefixed.
  if (loc === defaultLocale) {
    // Drop the redundant /en prefix so the canonical URL is clean.
    return NextResponse.redirect(to(restPath || "/"));
  }
  if (loc) {
    // e.g. /es/... — already canonical, serve as-is.
    return;
  }
  // No prefix: serve English in place (clean URL), or send other locales home.
  if (preferred !== defaultLocale) {
    return NextResponse.redirect(to(`/${preferred}${restPath}`));
  }
  return NextResponse.rewrite(to(`/${defaultLocale}${restPath}`));
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
