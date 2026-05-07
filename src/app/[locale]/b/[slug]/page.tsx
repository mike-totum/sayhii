import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/lib/i18n";
import { briefings, getBriefing } from "@/lib/portal-briefings";
import { ArrowIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { BriefingSection } from "@/components/portal/briefing-renderer";

type Props = { params: Promise<{ locale: string; slug: string }> };

const COVER_TONE: Record<string, string> = {
  primary: "from-primary/20 via-warm/40 to-transparent",
  warm: "from-warm via-warm/50 to-transparent",
  sage: "from-accent-soft via-accent-soft/40 to-transparent",
  sky: "from-sky via-sky/40 to-transparent",
};

export function generateStaticParams() {
  return briefings.flatMap((b) =>
    ["en", "es"].map((locale) => ({ locale, slug: b.slug })),
  );
}

export default async function PublicBriefingReader({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const briefing = getBriefing(slug);
  if (!briefing) notFound();

  const livePath = `/${locale}/portal`;
  const basePath = `/${locale}/b/${briefing.slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Stripped public header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          <Link href={`/${locale}`} className="flex items-center">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-muted">
              <span className="size-1.5 rounded-full bg-accent animate-pulse-soft" />
              Read-only briefing
            </span>
            <Link
              href={`/${locale}/signin`}
              className="inline-flex h-9 items-center rounded-full border border-border bg-surface px-3 text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex h-9 items-center rounded-full bg-foreground text-background px-4 text-sm font-medium hover:bg-foreground/85 transition-colors"
            >
              About sayhii
            </Link>
          </div>
        </div>
      </header>

      {/* Cover */}
      <header
        className={`relative h-56 lg:h-80 bg-gradient-to-br ${COVER_TONE[briefing.cover.tone]} border-b border-border`}
      >
        <div className="grain absolute inset-0" />
        <div className="relative px-6 lg:px-10 h-full flex flex-col justify-end pb-8 max-w-7xl mx-auto w-full">
          <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/70">
            {briefing.cover.eyebrow}
          </p>
          <h1 className="mt-2 text-4xl lg:text-6xl tracking-tight font-semibold leading-[1.05] max-w-4xl">
            <span className="font-serif italic">{briefing.title}</span>
          </h1>
          <p className="mt-3 text-foreground/80 max-w-2xl leading-relaxed">
            {briefing.subtitle}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span>{briefing.publishedLabel}</span>
            <span>·</span>
            <span>{briefing.author.name}</span>
            <span>·</span>
            <span>{briefing.audienceLabel}</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 mx-auto max-w-3xl w-full px-6 lg:px-10 py-10 lg:py-12 space-y-12">
        {briefing.sections.map((section) => (
          <BriefingSection
            key={section.id}
            section={section}
            basePath={basePath}
            livePath={livePath}
          />
        ))}

        <section className="rounded-3xl bg-foreground text-background p-8 lg:p-10 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-20 -right-12 size-[280px] rounded-full bg-primary/30 blur-3xl"
          />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.22em] text-background/60">
              Want the live data?
            </p>
            <h2 className="mt-2 text-3xl tracking-tight font-semibold leading-tight">
              The charts above are read from a real{" "}
              <span className="font-serif italic">sayhii</span> dashboard.
            </h2>
            <p className="mt-3 text-background/75 max-w-xl">
              If your team is on sayhii, sign in to see your own scorecard,
              themes, and per-team data. If you&rsquo;re evaluating, talk to us.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/${locale}/signin`}
                className="inline-flex items-center gap-2 h-11 rounded-full bg-primary text-primary-foreground px-5 text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Sign in to sayhii
                <ArrowIcon className="size-4" />
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center h-11 rounded-full border border-background/20 px-5 text-sm font-medium hover:bg-background/5 transition-colors"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted">
        <p>
          <span className="font-serif italic">sayhii</span> · briefing shared
          via read-only link · charts update in real time
        </p>
      </footer>
    </div>
  );
}
