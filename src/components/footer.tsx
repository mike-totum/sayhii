import Link from "next/link";
import { Logo } from "./logo";
import { ArrowIcon } from "./icons";

const cols = [
  {
    title: "Read",
    links: [
      { label: "Notes from the Field", href: "/notes" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "hi@sayhii.io", href: "mailto:hi@sayhii.io" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/sayhii" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_repeat(2,1fr)_1.4fr]">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              <span className="font-serif italic">sayhii</span> everyday.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              100 S. Clinton Ave
              <br />
              Rochester, NY 14604
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-medium text-foreground mb-4">
                {c.title}
              </h4>
              <ul className="space-y-3 text-sm text-muted">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("http") || l.href.startsWith("mailto") ? (
                      <a
                        href={l.href}
                        target={l.href.startsWith("http") ? "_blank" : undefined}
                        rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                        className="hover:text-foreground transition-colors"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">
              Subscribe
            </h4>
            <p className="text-sm text-muted">
              Sign up with your email address to receive news and updates. We
              respect your privacy.
            </p>
            <form
              action="mailto:hi@sayhii.io"
              method="post"
              className="mt-4 flex gap-2"
            >
              <input
                type="email"
                name="email"
                placeholder="you@company.com"
                aria-label="Email address"
                className="flex-1 h-10 rounded-full border border-border bg-background px-4 text-sm placeholder:text-muted/70 focus:border-foreground/40 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/85 transition-colors"
              >
                <ArrowIcon className="size-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-xs text-muted">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p>
              Copyright © {new Date().getFullYear()} sayhii, inc. All rights
              reserved.
            </p>
            <span className="hidden md:inline">·</span>
            <p>
              <span className="lowercase">sayhii</span> name and logo are
              registered trademarks and the property of sayhii inc.
            </p>
          </div>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
