import Link from "next/link";
import { CtaBanner } from "@/components/cta-banner";
import { SectionHeader } from "@/components/section-header";
import { ArrowIcon, QuoteIcon } from "@/components/icons";
import {
  fmt,
  getDictionary,
  isLocale,
  localePath,
  type Locale,
} from "@/lib/i18n";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function Home({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  return (
    <>
      <Hero locale={locale} dict={dict} />
      <TaglineStrip dict={dict} />
      <Stats dict={dict} />
      <ListenAgain dict={dict} />
      <Signals dict={dict} />
      <UniquelySayhii dict={dict} />
      <Stories dict={dict} />
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

type DictPart = ReturnType<typeof getDictionary>;

/* -------------------- HERO -------------------- */
function Hero({ locale, dict }: { locale: Locale; dict: DictPart }) {
  const h = dict.home.hero;
  const titleLines = h.title.split("\n");
  return (
    <section className="relative overflow-hidden">
      <div className="grain" />
      <BlobBackdrop />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 backdrop-blur px-3 py-1 text-xs font-medium text-muted">
              <span className="size-1.5 rounded-full bg-accent animate-pulse-soft" />
              {h.eyebrow}
            </span>

            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight font-semibold">
              {titleLines.map((line, i) => (
                <span key={i} className="block">
                  {fmt(line)}
                </span>
              ))}
            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted leading-relaxed">
              {h.body}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={localePath(locale, "/contact")}
                className="group inline-flex items-center gap-2 h-12 rounded-full bg-primary px-6 text-primary-foreground font-medium shadow-[0_8px_24px_-8px_rgba(255,107,91,0.6)] hover:bg-primary-hover transition-all"
              >
                {h.ctaPrimary}
                <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={localePath(locale, "/notes")}
                className="inline-flex items-center gap-2 h-12 rounded-full border border-border bg-surface px-6 font-medium text-foreground hover:border-foreground/30 transition-colors"
              >
                {h.ctaSecondary}
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-muted">
              <div className="flex -space-x-2">
                {["#FFB39A", "#7DA88A", "#A8C5DA", "#E8C0A8"].map((c, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="size-7 rounded-full border-2 border-background"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <span>{fmt(h.adoption)}</span>
            </div>
          </div>

          <HeroVisual dict={dict} />
        </div>
      </div>
    </section>
  );
}

function BlobBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <div className="absolute -top-32 -right-20 size-[520px] rounded-full bg-warm blur-3xl opacity-70" />
      <div className="absolute top-40 -left-32 size-[460px] rounded-full bg-accent-soft blur-3xl opacity-80" />
      <div className="absolute bottom-0 right-1/3 size-[320px] rounded-full bg-sky blur-3xl opacity-60" />
    </div>
  );
}

function HeroVisual({ dict }: { dict: DictPart }) {
  const c = dict.home.hero.checkin;
  const a = dict.home.hero.floatA;
  const b = dict.home.hero.floatB;
  return (
    <div className="relative">
      <div className="relative rounded-[28px] bg-surface border border-border shadow-[0_30px_80px_-30px_rgba(15,17,23,0.25)] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-xs font-medium text-muted">{c.meta}</span>
          </div>
          <span className="text-xs text-muted">{c.time}</span>
        </div>
        <p className="mt-5 text-2xl tracking-tight font-medium leading-snug">
          {c.question}
        </p>
        <div className="mt-6 grid grid-cols-5 gap-2">
          {["😕", "😐", "🙂", "😀", "🤩"].map((e, i) => (
            <button
              key={i}
              className={`aspect-square rounded-2xl border text-2xl flex items-center justify-center transition-all ${
                i === 3
                  ? "bg-primary/10 border-primary text-foreground"
                  : "bg-background border-border hover:border-foreground/30"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">{c.footnote}</p>
      </div>

      <FloatingCard
        className="absolute -top-6 -left-10 hidden md:block animate-float"
        accent="bg-accent"
      >
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          {a.eyebrow}
        </span>
        <p className="text-base font-medium">{fmt(a.body)}</p>
      </FloatingCard>
      <FloatingCard
        className="absolute -bottom-8 -right-6 hidden md:block animate-float [animation-delay:1.5s]"
        accent="bg-primary"
      >
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          {b.eyebrow}
        </span>
        <p className="text-sm font-medium">{b.body}</p>
      </FloatingCard>
    </div>
  );
}

function FloatingCard({
  children,
  className = "",
  accent,
}: {
  children: React.ReactNode;
  className?: string;
  accent: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-surface border border-border shadow-xl px-4 py-3 max-w-[260px] ${className}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`size-2 rounded-full ${accent} animate-pulse-soft`} />
      </div>
      {children}
    </div>
  );
}

function TaglineStrip({ dict }: { dict: DictPart }) {
  const t = dict.home.tagline;
  return (
    <section className="border-y border-border/60 bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-3">
          {t.eyebrow}
        </p>
        <p className="text-2xl sm:text-3xl tracking-tight font-medium">
          {fmt(t.body)}
        </p>
      </div>
    </section>
  );
}

function Stats({ dict }: { dict: DictPart }) {
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28">
      <div className="grid md:grid-cols-3 gap-px bg-border rounded-3xl overflow-hidden border border-border">
        {dict.home.stats.map((s) => (
          <div key={s.value} className="bg-background p-8 lg:p-10">
            <div className="text-5xl lg:text-6xl tracking-tight font-semibold">
              {s.value}
            </div>
            <div className="mt-3 text-sm font-medium text-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ListenAgain({ dict }: { dict: DictPart }) {
  const l = dict.home.listenAgain;
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-10 lg:py-16">
      <div className="rounded-[32px] border border-border bg-warm/50 p-10 lg:p-14 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {l.eyebrow}
        </p>
        <p className="mt-5 text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium leading-snug max-w-3xl mx-auto">
          {fmt(l.body)}
        </p>
      </div>
    </section>
  );
}

function Signals({ dict }: { dict: DictPart }) {
  const s = dict.home.signals;
  const tones = ["bg-warm", "bg-sky", "bg-accent-soft", "bg-warm", "bg-accent-soft"];
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28">
      <SectionHeader eyebrow={s.eyebrow} title={fmt(s.title)} sub={s.sub} />
      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
        {s.names.map((name, i) => (
          <article
            key={name}
            className="group rounded-3xl border border-border bg-surface p-7"
          >
            <div
              className={`size-10 rounded-2xl ${tones[i % tones.length]} flex items-center justify-center mb-6`}
            >
              <span className="size-2.5 rounded-full bg-foreground/80" />
            </div>
            <h3 className="text-lg tracking-tight font-medium leading-snug">
              {name}
            </h3>
          </article>
        ))}
      </div>
      <p className="mt-8 max-w-3xl text-muted leading-relaxed">{s.outro}</p>
    </section>
  );
}

function UniquelySayhii({ dict }: { dict: DictPart }) {
  const u = dict.home.uniquely;
  const tones = ["bg-warm", "bg-accent-soft", "bg-sky"];
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28">
      <SectionHeader eyebrow={u.eyebrow} title={fmt(u.title)} />
      <div className="mt-14 grid lg:grid-cols-3 gap-5">
        {u.pillars.map((p, i) => (
          <article
            key={p.title}
            className="rounded-3xl border border-border bg-surface p-7 flex flex-col"
          >
            <div
              className={`size-10 rounded-2xl ${tones[i]} flex items-center justify-center mb-6`}
            >
              <span className="size-2.5 rounded-full bg-foreground/80" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              {p.eyebrow}
            </p>
            <h3 className="mt-3 text-2xl tracking-tight font-medium leading-snug">
              {p.title}
            </h3>
            <p className="mt-3 text-muted leading-relaxed">{p.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Stories({ dict }: { dict: DictPart }) {
  const s = dict.home.stories;
  const sizes = ["lg", "sm", "sm", "lg", "sm", "md", "md", "md"] as const;
  const tones = [
    "bg-warm",
    "bg-accent-soft",
    "bg-sky",
    "bg-accent-soft",
    "bg-warm",
    "bg-sky",
    "bg-accent-soft",
    "bg-warm",
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28">
      <SectionHeader eyebrow={s.eyebrow} title={fmt(s.title)} />
      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-[1fr]">
        {s.quotes.map((body, i) => {
          const size = sizes[i] ?? "md";
          return (
            <figure
              key={i}
              className={`rounded-3xl border border-border bg-surface p-6 lg:p-7 flex flex-col ${
                size === "lg"
                  ? "sm:col-span-2 lg:col-span-2"
                  : size === "md"
                    ? "lg:col-span-1"
                    : ""
              }`}
            >
              <span
                className={`size-10 rounded-2xl ${tones[i]} flex items-center justify-center mb-5`}
              >
                <QuoteIcon className="size-5 text-foreground/70" />
              </span>
              <blockquote
                className={`leading-relaxed text-foreground ${
                  size === "lg"
                    ? "text-2xl tracking-tight font-medium"
                    : "text-base"
                }`}
              >
                &ldquo;{body}&rdquo;
              </blockquote>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
