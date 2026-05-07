import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { briefings } from "@/lib/portal-briefings";
import { ArrowIcon } from "@/components/icons";

type Props = { params: Promise<{ locale: string }> };

const COVER_TONE: Record<string, string> = {
  primary: "from-primary/20 via-warm/40 to-transparent",
  warm: "from-warm via-warm/50 to-transparent",
  sage: "from-accent-soft via-accent-soft/40 to-transparent",
  sky: "from-sky via-sky/40 to-transparent",
};

const STATUS_TONE: Record<string, string> = {
  published: "bg-accent-soft text-accent border-accent/30",
  draft: "bg-warm/60 text-primary border-primary/30",
  scheduled: "bg-sky text-foreground/80 border-sky",
  archived: "bg-background text-muted border-border",
};

const STATUS_LABEL: Record<string, string> = {
  published: "Published",
  draft: "Draft",
  scheduled: "Scheduled",
  archived: "Archived",
};

export default async function BriefingsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);

  const featured =
    briefings.find((b) => b.status === "published") ?? briefings[0];
  const rest = briefings.filter((b) => b.slug !== featured.slug);

  return (
    <div className="px-6 lg:px-10 py-7 lg:py-9 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 rise">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            Briefings
          </p>
          <h1 className="mt-1 text-3xl lg:text-4xl tracking-tight font-semibold">
            The <span className="font-serif italic text-primary">live</span>{" "}
            quarterly report.
          </h1>
          <p className="mt-2 text-muted max-w-2xl leading-relaxed text-sm">
            Briefings are read-only documents that pull live charts straight
            from the portal. Share a link with your team — they don&rsquo;t
            need an account to read it, and every chart links back to the
            full data when they want to dig in.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 h-10 rounded-full bg-foreground text-background px-4 text-sm font-medium hover:bg-foreground/85 transition-colors">
          New briefing
          <ArrowIcon className="size-4" />
        </button>
      </header>

      {/* Featured */}
      <Link
        href={`/${locale}/portal/briefings/${featured.slug}`}
        className="group block rounded-[28px] border border-border bg-surface overflow-hidden hover:-translate-y-0.5 transition-transform rise rise-1"
      >
        <div
          className={`relative h-48 lg:h-56 bg-gradient-to-br ${COVER_TONE[featured.cover.tone]}`}
        >
          <div className="grain absolute inset-0" />
          <div className="absolute inset-0 p-7 lg:p-10 flex flex-col justify-end">
            <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/70">
              {featured.cover.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl lg:text-4xl tracking-tight font-semibold leading-tight max-w-3xl">
              <span className="font-serif italic">{featured.title}</span>
            </h2>
          </div>
        </div>
        <div className="p-7 lg:p-8 grid lg:grid-cols-[2fr_auto] gap-6 items-end">
          <div>
            <p className="text-muted leading-relaxed max-w-2xl">
              {featured.subtitle}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${STATUS_TONE[featured.status]}`}
              >
                {STATUS_LABEL[featured.status]}
              </span>
              <span>{featured.audienceLabel}</span>
              <span className="size-0.5 rounded-full bg-muted" />
              <span>{featured.publishedLabel}</span>
              <span className="size-0.5 rounded-full bg-muted" />
              <span>
                {featured.views.toLocaleString()} views · {featured.recipients}{" "}
                recipients
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-medium group-hover:text-primary transition-colors">
            Read briefing
            <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>

      {/* Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 rise rise-2">
        {rest.map((b) => (
          <Link
            key={b.slug}
            href={`/${locale}/portal/briefings/${b.slug}`}
            className="group block rounded-2xl border border-border bg-surface overflow-hidden hover:-translate-y-0.5 transition-transform"
          >
            <div
              className={`relative h-32 bg-gradient-to-br ${COVER_TONE[b.cover.tone]}`}
            >
              <div className="grain absolute inset-0" />
              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/70">
                  {b.cover.eyebrow}
                </p>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg tracking-tight font-semibold leading-snug">
                {b.title}
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-2">
                {b.subtitle}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 ${STATUS_TONE[b.status]}`}
                >
                  {STATUS_LABEL[b.status]}
                </span>
                <span>·</span>
                <span>{b.audienceLabel}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted">{b.publishedLabel}</span>
                <span className="inline-flex items-center gap-1 font-medium group-hover:text-primary transition-colors">
                  Read
                  <ArrowIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* Distribution callout */}
      <section className="rise rise-3 rounded-3xl border border-foreground bg-foreground text-background p-6 lg:p-8 grid lg:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-background/60">
            Distribution, in one click
          </p>
          <h2 className="mt-2 text-2xl lg:text-3xl tracking-tight font-semibold">
            No more zip files of agenda decks.
          </h2>
          <p className="mt-3 max-w-2xl text-background/75 leading-relaxed">
            Briefings have read-only share links — recipients don&rsquo;t need
            a sayhii account. Every embedded chart links back to the live
            portal for anyone who does. View counts are tracked. The PDF is
            optional and one-click.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 h-11 rounded-full bg-primary text-primary-foreground px-5 text-sm font-medium hover:bg-primary-hover transition-colors">
          New from template
          <ArrowIcon className="size-4" />
        </button>
      </section>
    </div>
  );
}
