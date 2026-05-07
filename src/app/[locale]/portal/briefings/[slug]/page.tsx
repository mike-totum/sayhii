import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { briefings, getBriefing } from "@/lib/portal-briefings";
import { ArrowIcon } from "@/components/icons";
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

export default async function BriefingReader({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);

  const briefing = getBriefing(slug);
  if (!briefing) notFound();

  const shareUrl = `https://sayhii.io/${locale}/b/${briefing.slug}?key=${briefing.shareToken}`;
  const livePath = `/${locale}/portal`;
  const basePath = `/${locale}/portal/briefings/${briefing.slug}`;

  return (
    <div className="pb-16">
      {/* Cover */}
      <header
        className={`relative h-56 lg:h-72 bg-gradient-to-br ${COVER_TONE[briefing.cover.tone]} border-b border-border`}
      >
        <div className="grain absolute inset-0" />
        <div className="relative px-6 lg:px-10 h-full flex flex-col justify-end pb-6">
          <Link
            href={`/${locale}/portal/briefings`}
            className="self-start inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-auto pt-6"
          >
            <ArrowIcon className="size-4 rotate-180" />
            All briefings
          </Link>
          <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/70">
            {briefing.cover.eyebrow}
          </p>
          <h1 className="mt-2 text-4xl lg:text-5xl tracking-tight font-semibold leading-[1.05] max-w-4xl">
            <span className="font-serif italic">{briefing.title}</span>
          </h1>
          <p className="mt-3 text-foreground/80 max-w-2xl leading-relaxed">
            {briefing.subtitle}
          </p>
        </div>
      </header>

      {/* Meta + share row */}
      <div className="px-6 lg:px-10 py-5 border-b border-border bg-surface/40">
        <div className="grid lg:grid-cols-[1fr_auto] gap-3 items-center">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-accent animate-pulse-soft" />
              Live · charts read from the portal in real time
            </span>
            <span>·</span>
            <span>{briefing.publishedLabel}</span>
            <span>·</span>
            <span>{briefing.author.name}</span>
            <span>·</span>
            <span>{briefing.audienceLabel}</span>
            <span>·</span>
            <span>
              {briefing.views.toLocaleString()} views · {briefing.recipients}{" "}
              recipients
            </span>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="hidden lg:inline-flex items-center text-xs text-muted font-mono truncate max-w-xs px-3 py-1.5 rounded-full border border-border bg-background">
              {shareUrl.replace("https://", "")}
            </span>
            <button className="inline-flex items-center gap-2 h-9 rounded-full border border-border bg-surface px-3 text-xs font-medium hover:border-foreground/30 transition-colors">
              Copy share link
            </button>
            <button className="inline-flex items-center gap-2 h-9 rounded-full border border-border bg-surface px-3 text-xs font-medium hover:border-foreground/30 transition-colors">
              Send to Slack
            </button>
            <button className="inline-flex items-center gap-2 h-9 rounded-full bg-foreground text-background px-3 text-xs font-medium hover:bg-foreground/85 transition-colors">
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 lg:px-10 pt-8 grid lg:grid-cols-[220px_1fr] gap-10">
        {/* TOC */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted mb-2">
              Sections
            </p>
            {briefing.sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block text-sm py-1.5 text-muted hover:text-foreground transition-colors"
              >
                <span className="font-mono text-[10px] mr-2 text-muted/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.heading}
              </a>
            ))}
          </nav>
        </aside>

        <article className="space-y-12 max-w-3xl pb-16">
          {briefing.sections.map((section) => (
            <BriefingSection
              key={section.id}
              section={section}
              basePath={basePath}
              livePath={livePath}
            />
          ))}
        </article>
      </div>
    </div>
  );
}
