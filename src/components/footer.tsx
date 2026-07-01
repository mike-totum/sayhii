import Link from "next/link";
import { Logo } from "./logo";
import { LocaleSwitch } from "./locale-switch";
import { ArrowIcon } from "./icons";
import { en } from "@/dictionaries/en";
import { es } from "@/dictionaries/es";
import { localePath, type Locale } from "@/lib/i18n";
import { fmt } from "@/lib/i18n";

const dicts = { en, es } as const;

export function Footer({ locale }: { locale: Locale }) {
  const dict = dicts[locale];
  const f = dict.footer;
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_repeat(2,1fr)_1.4fr]">
          <div className="space-y-5">
            <Logo />
            <p className="font-serif text-3xl tracking-tight text-foreground max-w-xs leading-snug">
              {fmt(f.motto)}
            </p>
            <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
              {f.address}
            </p>
          </div>

          {[f.columns.read, f.columns.connect].map((c) => (
            <div key={c.title}>
              <h4 className="text-[11px] uppercase tracking-[0.25em] text-muted mb-4">
                {c.title}
              </h4>
              <ul className="space-y-3 text-sm text-muted">
                {c.items.map((l) => {
                  const isExternal =
                    l.href.startsWith("http") || l.href.startsWith("mailto");
                  if (isExternal) {
                    return (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          target={l.href.startsWith("http") ? "_blank" : undefined}
                          rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                          className="hover:text-foreground transition-colors"
                        >
                          {l.label}
                        </a>
                      </li>
                    );
                  }
                  return (
                    <li key={l.label}>
                      <Link
                        href={localePath(locale, l.href)}
                        className="hover:text-foreground transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-[11px] uppercase tracking-[0.25em] text-muted mb-4">
              {f.subscribe.title}
            </h4>
            <p className="text-sm text-muted">{f.subscribe.body}</p>
            <form
              action="mailto:hi@sayhii.io"
              method="post"
              className="mt-4 flex gap-2"
            >
              <input
                type="email"
                name="email"
                placeholder={f.subscribe.placeholder}
                aria-label={f.subscribe.ariaEmail}
                className="flex-1 h-10 rounded-[4px] border border-border bg-surface px-4 text-sm placeholder:text-muted/70 focus:border-foreground/40 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                aria-label={f.subscribe.ariaSubmit}
                className="group inline-flex h-10 w-10 items-center justify-center rounded-[4px] bg-foreground text-background hover:bg-primary transition-colors"
              >
                <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-xs text-muted">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p>
              {f.copyright.replace("{year}", String(new Date().getFullYear()))}
            </p>
            <span className="hidden md:inline">·</span>
            <p>{f.trademark}</p>
          </div>
          <div className="flex items-center gap-4">
            <LocaleSwitch locale={locale} />
            <span aria-hidden className="text-border">·</span>
            <Link
              href={localePath(locale, "/privacy")}
              className="hover:text-foreground transition-colors"
            >
              {f.privacy}
            </Link>
            <span aria-hidden className="text-border">·</span>
            <a
              href="https://admin.sayhii.io"
              className="hover:text-foreground transition-colors"
            >
              {f.internal}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
