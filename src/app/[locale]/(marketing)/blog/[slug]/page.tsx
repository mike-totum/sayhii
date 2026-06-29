import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBanner } from "@/components/cta-banner";
import { DotSurface } from "@/components/dot-field";
import { Markdown } from "@/components/markdown";
import { ArrowIcon } from "@/components/icons";
import { posts, getPost } from "@/lib/posts";
import {
  fmt,
  getDictionary,
  isLocale,
  localePath,
  locales,
  type Locale,
} from "@/lib/i18n";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    posts.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — sayhii`,
    description: post.excerpt,
  };
}

function formatDate(d: string, locale: Locale) {
  if (!d) return "";
  return new Date(d).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const post = getPost(slug);
  if (!post) notFound();
  const dict = getDictionary(locale);
  const b = dict.blog;

  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <article>
        {/* Masthead */}
        <header className="relative overflow-hidden border-b border-border">
          <DotSurface density={2400} />
          <div className="relative mx-auto max-w-3xl px-6 lg:px-10">
            <div className="border-b border-border py-4">
              <Link
                href={localePath(locale, "/blog")}
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted hover:text-foreground transition-colors"
              >
                <ArrowIcon className="size-3 rotate-180" />
                {b.backToBlog}
              </Link>
            </div>
            <div className="pt-12 pb-14 lg:pt-16 lg:pb-16">
              <h1 className="rise font-serif font-normal text-4xl lg:text-6xl tracking-tight leading-[1.06]">
                {post.title}
              </h1>
              <div className="rise rise-1 mt-7 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted tabular-nums">
                <span className="text-foreground/80">{post.author}</span>
                <span aria-hidden>·</span>
                <span>{formatDate(post.date, locale)}</span>
                <span aria-hidden>·</span>
                <span>
                  {post.readingMinutes} {b.readSuffix}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="mx-auto max-w-3xl px-6 lg:px-10 py-14 lg:py-20">
          <Markdown source={post.body} />

          <div className="mt-16 border-t border-border pt-8">
            <Link
              href={localePath(locale, "/blog")}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <ArrowIcon className="size-4 rotate-180" />
              {b.backToBlog}
            </Link>
          </div>
        </div>
      </article>

      {/* Keep reading */}
      {more.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-20">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted">
              {b.moreReading}
            </p>
            <div className="mt-8 grid md:grid-cols-2 gap-5">
              {more.map((p) => (
                <Link
                  key={p.slug}
                  href={localePath(locale, `/blog/${p.slug}`)}
                  className="group block rounded-md border border-border bg-surface p-7 transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_-28px_rgba(17,17,23,0.4)]"
                >
                  <div className="flex items-center gap-3 text-xs text-muted tabular-nums">
                    <span>{formatDate(p.date, locale)}</span>
                    <span aria-hidden>·</span>
                    <span>
                      {p.readingMinutes} {b.readSuffix}
                    </span>
                  </div>
                  <h3 className="mt-3 font-serif text-2xl tracking-tight leading-snug">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-2">
                    {p.excerpt}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium group-hover:text-primary transition-colors">
                    {b.cta}
                    <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
