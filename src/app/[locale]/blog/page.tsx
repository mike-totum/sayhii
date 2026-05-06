import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { CtaBanner } from "@/components/cta-banner";
import { ArrowIcon } from "@/components/icons";
import { posts, postUrl } from "@/lib/posts";
import {
  fmt,
  getDictionary,
  isLocale,
  localePath,
  type Locale,
} from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { title: dict.meta.blog.title, description: dict.meta.blog.description };
}

const tones = ["bg-warm", "bg-accent-soft", "bg-sky"] as const;

function formatDate(d: string, locale: Locale) {
  return new Date(d).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const b = dict.blog;
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero eyebrow={b.eyebrow} title={fmt(b.title)} sub={b.sub} />

      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-24">
        {featured && (
          <a
            href={postUrl(featured.slug)}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-[28px] border border-border bg-surface overflow-hidden hover:-translate-y-0.5 transition-transform"
          >
            <div className="h-2 bg-warm" />
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 p-8 lg:p-12 items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span className="rounded-full border border-border px-3 py-1">
                    {b.latest}
                  </span>
                  <span>{formatDate(featured.date, locale)}</span>
                  <span>·</span>
                  <span>{featured.author}</span>
                </div>
                <h2 className="mt-5 text-3xl lg:text-5xl tracking-tight font-semibold leading-tight">
                  {featured.title}
                </h2>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium group-hover:text-primary transition-colors">
                  {b.cta}
                  <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
              <div className="relative aspect-[4/3] rounded-2xl bg-background border border-border overflow-hidden">
                <div className="absolute inset-0 bg-warm opacity-60" />
                <div className="absolute inset-0 grain" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-serif italic text-2xl text-foreground/80 leading-snug">
                    {fmt(b.pullQuote)}
                  </p>
                </div>
              </div>
            </div>
          </a>
        )}

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((p, i) => (
            <a
              key={p.slug}
              href={postUrl(p.slug)}
              target="_blank"
              rel="noreferrer"
              className="group rounded-3xl border border-border bg-surface overflow-hidden hover:-translate-y-0.5 transition-transform"
            >
              <div className={`h-2 ${tones[i % tones.length]}`} />
              <div className="p-7">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span>{formatDate(p.date, locale)}</span>
                  <span>·</span>
                  <span>{p.author}</span>
                </div>
                <h3 className="mt-4 text-xl tracking-tight font-medium leading-snug">
                  {p.title}
                </h3>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium group-hover:text-primary transition-colors">
                  {b.cta}
                  <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <CtaBanner
        eyebrow={dict.home.cta.eyebrow}
        title={fmt(dict.home.cta.title)}
        sub={dict.home.cta.sub}
        primary={{
          label: dict.home.cta.primary,
          href: localePath(locale, "/contact"),
        }}
      />
    </>
  );
}
