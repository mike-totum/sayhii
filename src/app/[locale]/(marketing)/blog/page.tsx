import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { CtaBanner } from "@/components/cta-banner";
import { Reveal } from "@/components/reveal";
import { ArrowIcon } from "@/components/icons";
import { posts } from "@/lib/posts";
import {
  fmt,
  getDictionary,
  isLocale,
  localePath,
  type Locale,
} from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { title: dict.meta.blog.title, description: dict.meta.blog.description };
}

function formatDate(d: string, locale: Locale) {
  if (!d) return "";
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

      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-24">
        {featured && (
          <Reveal>
            <Link
              href={localePath(locale, `/blog/${featured.slug}`)}
              className="group block rounded-md border border-border bg-surface overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_-32px_rgba(17,17,23,0.4)]"
            >
              <div className="grid lg:grid-cols-[1.3fr_1fr]">
                <div className="p-8 lg:p-12 flex flex-col">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted tabular-nums">
                    <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-border bg-background px-2.5 py-1 uppercase tracking-[0.18em] text-[10px]">
                      <span className="size-1.5 rounded-full bg-primary animate-pulse-soft" />
                      {b.latest}
                    </span>
                    <span>{formatDate(featured.date, locale)}</span>
                    <span aria-hidden>·</span>
                    <span>
                      {featured.readingMinutes} {b.readSuffix}
                    </span>
                  </div>
                  <h2 className="mt-6 font-serif font-normal text-3xl lg:text-5xl tracking-tight leading-[1.08]">
                    {featured.title}
                  </h2>
                  <p className="mt-5 text-muted leading-relaxed max-w-xl">
                    {featured.excerpt}
                  </p>
                  <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium group-hover:text-primary transition-colors">
                    {b.cta}
                    <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
                <div className="relative hidden lg:block border-l border-border bg-foreground text-background overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center p-10">
                    <p className="font-serif italic text-3xl text-background/80 leading-snug text-center">
                      {fmt(b.pullQuote)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        )}

        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 80}>
              <Link
                href={localePath(locale, `/blog/${p.slug}`)}
                className="group flex h-full flex-col rounded-md border border-border bg-surface p-7 transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_-28px_rgba(17,17,23,0.4)]"
              >
                <div className="flex items-center gap-3 text-xs text-muted tabular-nums">
                  <span>{formatDate(p.date, locale)}</span>
                  <span aria-hidden>·</span>
                  <span>
                    {p.readingMinutes} {b.readSuffix}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-xl tracking-tight leading-snug">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-3 flex-1">
                  {p.excerpt}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium group-hover:text-primary transition-colors">
                  {b.cta}
                  <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
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
