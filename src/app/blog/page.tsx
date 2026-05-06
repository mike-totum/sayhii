import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CtaBanner } from "@/components/cta-banner";
import { ArrowIcon } from "@/components/icons";
import { posts, postUrl } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog — sayhii",
  description: "Essays from sayhii on workforce, listening, and leadership.",
};

const tones = ["bg-warm", "bg-accent-soft", "bg-sky"] as const;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPage() {
  const [featured, ...rest] = posts;
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title={
          <>
            Essays from{" "}
            <span className="font-serif italic">sayhii</span>.
          </>
        }
        sub="Authored on the sayhii blog. Click any post to read it on sayhii.io."
      />

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
                    Latest essay
                  </span>
                  <span>{formatDate(featured.date)}</span>
                  <span>·</span>
                  <span>{featured.author}</span>
                </div>
                <h2 className="mt-5 text-3xl lg:text-5xl tracking-tight font-semibold leading-tight">
                  {featured.title}
                </h2>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium group-hover:text-primary transition-colors">
                  Read on sayhii.io
                  <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
              <div className="relative aspect-[4/3] rounded-2xl bg-background border border-border overflow-hidden">
                <div className="absolute inset-0 bg-warm opacity-60" />
                <div className="absolute inset-0 grain" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-serif italic text-2xl text-foreground/80 leading-snug">
                    &ldquo;sayhii{" "}
                    <span className="not-italic font-sans">everyday</span>
                    .&rdquo;
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
                  <span>{formatDate(p.date)}</span>
                  <span>·</span>
                  <span>{p.author}</span>
                </div>
                <h3 className="mt-4 text-xl tracking-tight font-medium leading-snug">
                  {p.title}
                </h3>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium group-hover:text-primary transition-colors">
                  Read on sayhii.io
                  <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <CtaBanner
        title={
          <>
            Create a <span className="font-serif italic">win-win</span>{" "}
            workplace.
          </>
        }
        sub="People are the heart of your business. We help you help them thrive. When you're ready to sayhii, we're ready to answer."
        primary={{ label: "Schedule a 30-min chat", href: "/contact" }}
      />
    </>
  );
}
