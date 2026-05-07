import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { fmt, getDictionary, isLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.meta.privacy.title,
    description: dict.meta.privacy.description,
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const p = dict.privacy;

  return (
    <>
      <PageHero tone="sage" eyebrow={p.eyebrow} title={fmt(p.title)} />

      <section className="mx-auto max-w-3xl px-6 lg:px-10 py-16 lg:py-20">
        {p.note && (
          <p className="mb-10 rounded-2xl border border-border bg-surface px-5 py-4 text-sm text-muted">
            {p.note}
          </p>
        )}
        <div className="space-y-12">
          {p.sections.map((s) => (
            <div key={s.h}>
              <h2 className="text-2xl lg:text-3xl tracking-tight font-semibold leading-snug">
                {s.h}
              </h2>
              <div className="mt-4 space-y-4 text-foreground/85 leading-relaxed">
                {s.p.map((para, i) =>
                  typeof para === "string" ? (
                    <p key={i}>{para}</p>
                  ) : (
                    <blockquote
                      key={i}
                      className="rounded-2xl border-l-4 border-primary bg-warm/40 px-5 py-4 text-foreground"
                    >
                      {para.quote}
                    </blockquote>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
