import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
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
          <WalkthroughForm
            dict={c}
            notesHref={localePath(locale, "/notes")}
            blogHref={localePath(locale, "/blog")}
          />

          <aside className="space-y-5">
            <div className="rounded-3xl border border-border bg-surface p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {c.sidebar.emailEyebrow}
              </p>
              <a
                href="mailto:hi@sayhii.io"
                className="mt-3 inline-flex items-center gap-2 text-2xl tracking-tight font-medium hover:text-primary transition-colors"
              >
                hi@sayhii.io
                <ArrowIcon className="size-5" />
              </a>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {c.sidebar.visitEyebrow}
              </p>
              <p className="mt-3 text-lg tracking-tight font-medium leading-snug">
                100 S. Clinton Ave
                <br />
                Rochester, NY 14604
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-foreground text-background p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-background/60">
                {c.sidebar.readyEyebrow}
              </p>
              <p className="mt-3 text-xl tracking-tight font-medium leading-snug">
                {c.sidebar.readyBody}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
