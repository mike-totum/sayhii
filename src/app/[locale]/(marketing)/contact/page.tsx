import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ArrowIcon } from "@/components/icons";
import { WalkthroughForm } from "./walkthrough-form";
import { fmt, getDictionary, isLocale, localePath } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.meta.contact.title,
    description: dict.meta.contact.description,
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const c = dict.contact;

  return (
    <>
      <PageHero
        tone="warm"
        eyebrow={c.eyebrow}
        title={fmt(c.title)}
        sub={c.sub}
      />

      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-24">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-10">
          <Reveal>
            <WalkthroughForm
              dict={c}
              notesHref={localePath(locale, "/notes")}
              blogHref={localePath(locale, "/blog")}
            />
          </Reveal>

          <aside className="space-y-5">
            <Reveal delay={100}>
              <div className="group rounded-md border border-border bg-surface p-7 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-30px_rgba(15,17,23,0.25)]">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {c.sidebar.emailEyebrow}
                </p>
                <a
                  href="mailto:hi@sayhii.io"
                  className="mt-3 inline-flex items-center gap-2 text-2xl tracking-tight font-medium hover:text-primary transition-colors"
                >
                  hi@sayhii.io
                  <ArrowIcon className="size-5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="rounded-md border border-border bg-surface p-7 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-30px_rgba(15,17,23,0.25)]">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {c.sidebar.visitEyebrow}
                </p>
                <p className="mt-3 text-lg tracking-tight font-medium leading-snug">
                  100 S. Clinton Ave
                  <br />
                  Rochester, NY 14604
                </p>
              </div>
            </Reveal>

            <Reveal delay={260}>
              <div className="relative overflow-hidden rounded-md border border-border bg-foreground text-background p-7">
                <div
                  aria-hidden
                  className="absolute -top-14 -right-14 size-40 rounded-full bg-primary/30 blur-3xl"
                />
                <p className="relative text-xs uppercase tracking-[0.2em] text-background/60">
                  {c.sidebar.readyEyebrow}
                </p>
                <p className="relative mt-3 text-xl tracking-tight font-medium leading-snug">
                  {c.sidebar.readyBody}
                </p>
                <span className="relative mt-5 inline-flex items-baseline text-lg font-semibold tracking-tight">
                  <span>say</span>
                  <span className="font-serif italic text-primary">hii</span>
                  <span
                    aria-hidden
                    className="ml-0.5 inline-block size-1 rounded-full bg-primary translate-y-[-2px] animate-pulse-soft"
                  />
                </span>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}
