import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { CtaBanner } from "@/components/cta-banner";
import { ArrowIcon } from "@/components/icons";
import { issues } from "@/lib/notes-issues";
import {
  fmt,
  getDictionary,
  isLocale,
  localePath,
} from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { title: dict.meta.notes.title, description: dict.meta.notes.description };
}

const tones = ["bg-warm", "bg-accent-soft", "bg-sky", "bg-accent-soft"] as const;

export default async function NotesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const n = dict.notes;

  return (
    <>
      <PageHero
        tone="sky"
        eyebrow={n.eyebrow}
        title={fmt(n.title)}
        sub={n.sub}
      />

      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-8">
          {n.available}
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {issues.map((issue, i) => {
            const localizedLabel =
              n.issueLabels[issue.label as keyof typeof n.issueLabels] ??
              issue.label;
            const issueNumberLocalized = issue.number
              ? issue.number.replace("Issue", n.issueNumberPrefix)
              : undefined;
            return (
              <a
                key={issue.href}
                href={issue.href}
                target="_blank"
                rel="noreferrer"
                className="group relative rounded-[28px] border border-border bg-surface overflow-hidden hover:-translate-y-0.5 transition-transform"
              >
                <div className={`h-2 ${tones[i % tones.length]}`} />
                <div className="p-8 lg:p-10 grid sm:grid-cols-[auto_1fr] gap-6 items-start">
                  <div
                    className={`hidden sm:flex size-20 rounded-2xl ${tones[i % tones.length]} items-center justify-center`}
                  >
                    <span className="font-serif italic text-3xl text-foreground/70">
                      {localizedLabel[0]}
                    </span>
                  </div>
                  <div>
                    {issueNumberLocalized && (
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">
                        {issueNumberLocalized}
                      </p>
                    )}
                    <h2 className="mt-2 text-2xl lg:text-3xl tracking-tight font-semibold leading-tight">
                      {localizedLabel}
                    </h2>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium group-hover:text-primary transition-colors">
                      {n.open}
                      <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
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
