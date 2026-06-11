import Link from "next/link";
import { CtaBanner } from "@/components/cta-banner";
import { SectionHeader } from "@/components/section-header";
import { Reveal } from "@/components/reveal";
import {
  ArrowIcon,
  CheckIcon,
  ChevronDownIcon,
  QuoteIcon,
} from "@/components/icons";
import { AnimatedNumber } from "@/components/portal/animated-number";
import { MetricTile, DeltaPill } from "@/components/portal/metric-tile";
import { Sparkline } from "@/components/portal/sparkline";
import {
  TrustIcon,
  WorkloadIcon,
  SafetyIcon,
  ClarityIcon,
  BelongingIcon,
  TimeIcon,
  FlaskIcon,
  FingerprintIcon,
} from "@/components/feature-icons";
import { HeroCheckin, StickFigure } from "@/components/hero-checkin";
import { HeroV2 } from "@/components/hero-v2";
import { DotSurface } from "@/components/dot-field";
import { sparkSeries } from "@/lib/portal-data";

// A/B switch: true renders the dot-field editorial hero, false the
// "say hii." greeting hero from main.
const USE_V2_HERO = true;
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
  const h = dict.home.hero;
  return (
    <>
      {USE_V2_HERO ? (
        <HeroV2
          locale={locale}
          contactHref={localePath(locale, "/contact")}
          t={{
            ...h.v2,
            ctaPrimary: h.ctaPrimary,
            ctaSecondary: h.ctaSecondary,
            prompts: [h.checkin.prompt, ...h.checkin.morePrompts],
            agree: h.checkin.agree,
            disagree: h.checkin.disagree,
            skip: h.checkin.skip,
            another: h.checkin.another,
            thanksTitle: h.checkin.thanksTitle,
          }}
        />
      ) : (
        <Hero locale={locale} dict={dict} />
      )}
      <TaglineStrip dict={dict} />
      <Stats dict={dict} />
      <HowItWorks dict={dict} />
      <ProductShowcase locale={locale} dict={dict} />
      <Signals dict={dict} />
      <Compare dict={dict} />
      <ListenAgain dict={dict} />
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
  return (
    <section className="relative overflow-hidden">
      <div className="grain" />
      <BlobBackdrop />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="flex flex-col items-center text-center">
          <span className="rise inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 backdrop-blur px-3 py-1 text-xs font-medium text-muted">
            <span className="size-1.5 rounded-full bg-accent animate-pulse-soft" />
            {h.eyebrow}
          </span>

          {/* The site greets you: brand name at viewport scale, greetings in
              every language drifting behind, mascot waving on the baseline. */}
          <div className="relative mt-4 w-full">
            <GreetingMarquee greetings={h.greetings} />
            <h1
              aria-label={`sayhii: ${h.title.replaceAll("\n", " ").replaceAll("*", "")}`}
              className="relative font-semibold tracking-tight leading-none text-[clamp(4.25rem,13vw,12rem)]"
            >
              <span aria-hidden className="inline-flex items-baseline">
                <span className="rise rise-1">say</span>
                <span className="rise rise-2 relative font-serif italic font-normal text-primary">
                  hii.
                  <svg
                    aria-hidden
                    viewBox="0 0 220 26"
                    fill="none"
                    className="absolute left-[0.04em] -bottom-[0.06em] w-[88%] h-[0.14em]"
                  >
                    <path
                      d="M8 16 C 64 25, 152 23, 212 7"
                      stroke="currentColor"
                      strokeWidth="9"
                      strokeLinecap="round"
                      className="animate-draw"
                    />
                  </svg>
                </span>
                <StickFigure className="rise rise-4 ml-[0.08em] h-[0.58em] w-auto" />
              </span>
            </h1>
          </div>

          <p className="rise rise-3 mt-8 text-2xl sm:text-3xl lg:text-[2.5rem] lg:leading-tight tracking-tight font-medium max-w-4xl">
            {fmt(h.title.replaceAll("\n", " "))}
          </p>
          <p className="rise rise-4 mt-4 max-w-2xl text-lg text-muted leading-relaxed">
            {h.body}
          </p>

          <div className="rise rise-5 mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={localePath(locale, "/contact")}
              className="group inline-flex items-center gap-2 h-12 rounded-full bg-primary px-6 text-primary-foreground font-medium shadow-[0_8px_24px_-8px_rgba(255,107,91,0.6)] hover:bg-primary-hover hover:shadow-[0_12px_32px_-8px_rgba(255,107,91,0.7)] transition-all"
            >
              {h.ctaPrimary}
              <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center gap-2 h-12 rounded-full border border-border bg-surface px-6 font-medium text-foreground hover:border-foreground/30 transition-colors"
            >
              {h.ctaSecondary}
            </Link>
          </div>

          <div className="rise rise-6 mt-8 flex items-center gap-4 text-sm text-muted">
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

          <div className="relative mt-16 w-full max-w-xl">
            <HeroCheckin
              t={{
                prompts: [h.checkin.prompt, ...h.checkin.morePrompts],
                agree: h.checkin.agree,
                disagree: h.checkin.disagree,
                skip: h.checkin.skip,
                tryIt: h.checkin.tryIt,
                thanksTitle: h.checkin.thanksTitle,
                thanksBody: h.checkin.thanksBody,
                another: h.checkin.another,
              }}
            />

            <FloatingCard
              className="absolute top-0 left-[-280px] hidden xl:block animate-float"
              accent="bg-accent"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                {h.floatA.eyebrow}
              </span>
              <p className="text-base font-medium">{fmt(h.floatA.body)}</p>
            </FloatingCard>
            <FloatingCard
              className="absolute top-1/3 right-[-290px] hidden xl:block animate-float [animation-delay:1.5s]"
              accent="bg-primary"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                {h.floatB.eyebrow}
              </span>
              <p className="text-sm font-medium">{h.floatB.body}</p>
            </FloatingCard>
            <FloatingCard
              className="absolute bottom-4 left-[-300px] hidden xl:block animate-float [animation-delay:3s]"
              accent="bg-accent"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                {h.floatC.eyebrow}
              </span>
              <div className="mt-1 flex items-end gap-3">
                <Sparkline
                  data={sparkSeries(9, 4.05, 0.22, 18)}
                  width={96}
                  height={28}
                  color="#7da88a"
                />
                <span className="text-sm font-medium text-accent">
                  {h.floatC.body}
                </span>
              </div>
            </FloatingCard>
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="#how"
              className="group inline-flex flex-col items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground transition-colors"
            >
              {h.scrollCue}
              <ChevronDownIcon className="size-4 animate-bounce-soft" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function GreetingMarquee({ greetings }: { greetings: string[] }) {
  const row = (key: number) => (
    <div key={key} className="flex shrink-0 items-center gap-12 pr-12">
      {greetings.map((g, i) => (
        <span
          key={i}
          className="font-serif italic text-5xl lg:text-7xl whitespace-nowrap"
        >
          {g}
        </span>
      ))}
    </div>
  );
  return (
    <div
      aria-hidden
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-screen overflow-hidden fade-x text-foreground/[0.05] select-none"
    >
      <div className="flex w-max animate-marquee">{[0, 1].map(row)}</div>
    </div>
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
      className={`pointer-events-none rounded-md bg-surface text-foreground border border-border shadow-lg px-4 py-3 max-w-[260px] ${className}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`size-2 rounded-full ${accent} animate-pulse-soft`} />
      </div>
      {children}
    </div>
  );
}

/* -------------------- TAGLINE -------------------- */
function TaglineStrip({ dict }: { dict: DictPart }) {
  const t = dict.home.tagline;
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12 text-center">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted mb-4">
          02 · {t.eyebrow}
        </p>
        <p className="font-serif text-3xl sm:text-4xl tracking-tight">
          {fmt(t.body)}
        </p>
      </div>
    </section>
  );
}

/* -------------------- STATS -------------------- */
function Stats({ dict }: { dict: DictPart }) {
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-24">
      <Reveal>
        <div className="grid md:grid-cols-3 gap-px bg-border rounded-md overflow-hidden border border-border">
          {dict.home.stats.map((s) => (
            <div
              key={s.label}
              className="group bg-background p-8 lg:p-10 transition-colors hover:bg-surface"
            >
              <div className="font-serif text-5xl lg:text-6xl tracking-tight tabular-nums">
                {s.prefix}
                <AnimatedNumber value={s.value} />
                {s.suffix}
              </div>
              <div className="mt-3 text-sm font-medium text-foreground">
                {s.label}
              </div>
              <p className="mt-2 text-sm text-muted leading-relaxed">{s.sub}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* -------------------- HOW IT WORKS -------------------- */
function HowItWorks({ dict }: { dict: DictPart }) {
  const h = dict.home.how;
  return (
    <section
      id="how"
      className="scroll-mt-24 mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-24"
    >
      <Reveal>
        <SectionHeader
          no="03"
          eyebrow={h.eyebrow}
          title={fmt(h.title)}
          sub={h.sub}
          align="center"
        />
      </Reveal>
      <div className="relative mt-14">
        <div
          aria-hidden
          className="hidden lg:block absolute top-7 left-[16.66%] right-[16.66%] border-t border-dashed border-foreground/20"
        />
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
          {h.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 120}>
              <article className="relative flex flex-col">
                <div className="relative z-10 self-center lg:self-start inline-flex items-center gap-2 rounded-[4px] border border-border bg-surface px-4 py-2">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse-soft" />
                  <span className="font-mono text-xs tracking-tight text-foreground">
                    {step.time}
                  </span>
                </div>
                <div className="mt-5 rounded-md border border-border bg-surface p-7 flex-1 flex flex-col transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_-28px_rgba(17,17,23,0.4)]">
                  <StepVignette index={i} dict={dict} />
                  <p className="mt-6 text-[11px] uppercase tracking-[0.25em] text-muted">
                    {step.tag}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl tracking-tight leading-snug">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-muted leading-relaxed">{step.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepVignette({ index, dict }: { index: number; dict: DictPart }) {
  if (index === 0) {
    return (
      <div aria-hidden className="rounded-md bg-background border border-border p-4">
        <div className="rounded-md bg-primary text-primary-foreground px-4 py-3 text-sm font-medium leading-snug">
          {dict.home.hero.checkin.prompt.slice(0, 52)}…
        </div>
        <div className="mt-3 flex items-center justify-center gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`size-3.5 rounded-full border-2 ${
                i === 1
                  ? "border-primary bg-primary shadow-[0_0_0_3px_rgba(255,107,91,0.18)]"
                  : "border-foreground/25"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }
  if (index === 1) {
    const sig = dict.home.signals.items;
    return (
      <div aria-hidden className="rounded-md bg-background border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-3 rounded-[4px] bg-surface border border-border px-3 py-2">
          <span className="text-xs font-medium">{sig[0].name}</span>
          <div className="flex items-center gap-2">
            <Sparkline
              data={sparkSeries(3, 4.1, 0.2, 16)}
              width={64}
              height={20}
              color="#7da88a"
            />
            <DeltaPill delta={2.4} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-[4px] bg-surface border border-border px-3 py-2">
          <span className="text-xs font-medium">{sig[1].name}</span>
          <div className="flex items-center gap-2">
            <Sparkline
              data={sparkSeries(14, 3.9, 0.24, 16)}
              width={64}
              height={20}
              color="#ff6b5b"
            />
            <DeltaPill delta={-3.1} />
          </div>
        </div>
      </div>
    );
  }
  const m = dict.home.product.mock;
  return (
    <div aria-hidden className="rounded-md bg-background border border-border p-4">
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
        {m.actionEyebrow}
      </p>
      <div className="mt-2 flex items-start gap-3">
        <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-white">
          <CheckIcon className="size-3" />
        </span>
        <div>
          <p className="text-sm font-medium leading-snug">{m.actionTitle}</p>
          <p className="mt-1 text-xs text-muted">{m.actionMeta}</p>
        </div>
      </div>
    </div>
  );
}

/* -------------------- PRODUCT SHOWCASE -------------------- */
function ProductShowcase({ locale, dict }: { locale: Locale; dict: DictPart }) {
  const p = dict.home.product;
  const m = p.mock;
  return (
    <section className="relative overflow-hidden bg-foreground text-background py-16 lg:py-24">
      <DotSurface tone="paper" density={2400} />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-[11px] uppercase tracking-[0.25em] text-background/60">
              04 · {p.eyebrow}
            </span>
            <h2 className="mt-4 font-serif font-normal text-4xl lg:text-5xl tracking-tight leading-[1.08]">
              {fmt(p.title)}
            </h2>
            <p className="mt-5 text-lg text-background/70 leading-relaxed">
              {p.sub}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {p.capabilities.map((cap) => (
              <span
                key={cap}
                className="inline-flex items-center gap-2 rounded-[4px] border border-background/20 bg-background/5 px-4 py-1.5 text-sm font-medium text-background"
              >
                <span className="size-1.5 rounded-full bg-primary" />
                {cap}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120} className="relative mt-12 max-w-5xl mx-auto">
          <div className="relative rounded-md border border-background/15 bg-surface text-foreground shadow-[0_50px_140px_-40px_rgba(0,0,0,0.7)] overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border bg-background/60 px-5 py-3">
              <div aria-hidden className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-primary/60" />
                <span className="size-2.5 rounded-full bg-warm" />
                <span className="size-2.5 rounded-full bg-accent/60" />
              </div>
              <span className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted font-mono">
                <span className="size-1.5 rounded-full bg-accent animate-pulse-soft" />
                portal.sayhii.io
              </span>
              <span aria-hidden className="w-12" />
            </div>

            <div className="p-5 sm:p-7 lg:p-8 space-y-4">
              <p className="text-xl sm:text-2xl tracking-tight font-semibold">
                {fmt(m.greeting)}
              </p>

              <div className="rounded-2xl bg-foreground text-background p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-background/60">
                      {m.insightEyebrow}
                    </p>
                    <p className="mt-2 text-xl sm:text-2xl tracking-tight font-medium">
                      <span className="font-serif italic">{m.insightTitle}</span>
                    </p>
                    <p className="mt-2 text-sm text-background/70 max-w-md leading-relaxed">
                      {m.insightBody}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <DeltaPill delta={-3.1} darkBg />
                    <Sparkline
                      data={sparkSeries(14, 3.9, 0.24, 24)}
                      width={140}
                      height={40}
                      color="#ff8675"
                    />
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                      {m.insightCta}
                      <ArrowIcon className="size-3.5" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <MetricTile
                  label={m.tiles[0].label}
                  value={82.6}
                  format="percent1"
                  delta={1.2}
                  spark={sparkSeries(11, 4.0, 0.16)}
                  sub={m.tiles[0].sub}
                  tone="accent"
                />
                <MetricTile
                  label={m.tiles[1].label}
                  value={84.1}
                  format="percent1"
                  delta={0.4}
                  spark={sparkSeries(22, 4.2, 0.14)}
                  sub={m.tiles[1].sub}
                />
                <MetricTile
                  label={m.tiles[2].label}
                  value={91.4}
                  format="percent1"
                  delta={2.1}
                  spark={sparkSeries(7, 4.5, 0.1)}
                  sub={m.tiles[2].sub}
                  tone="warm"
                />
              </div>

              <div className="rounded-2xl border border-border bg-background px-5 py-4 flex items-center gap-4">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-accent text-accent">
                  <CheckIcon className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                    {m.actionEyebrow}
                  </p>
                  <p className="text-sm font-medium truncate">{m.actionTitle}</p>
                </div>
                <span className="ml-auto hidden sm:block text-xs text-muted shrink-0">
                  {m.actionMeta}
                </span>
              </div>
            </div>
          </div>

          <FloatingCard
            className="absolute -bottom-8 -left-6 hidden md:block animate-float [animation-delay:2s]"
            accent="bg-primary"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              {m.floatCard.eyebrow}
            </span>
            <p className="text-sm font-medium">{m.floatCard.body}</p>
          </FloatingCard>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------- SIGNALS -------------------- */
function Signals({ dict }: { dict: DictPart }) {
  const s = dict.home.signals;
  const tones = ["bg-warm", "bg-sky", "bg-accent-soft", "bg-warm", "bg-accent-soft"];
  const sparkColors = ["#7da88a", "#ff6b5b", "#7da88a", "#7da88a", "#7da88a"];
  const icons = [TrustIcon, WorkloadIcon, SafetyIcon, ClarityIcon, BelongingIcon];
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-24">
      <Reveal>
        <SectionHeader no="05" eyebrow={s.eyebrow} title={fmt(s.title)} sub={s.sub} />
      </Reveal>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {s.items.map((item, i) => {
          const Icon = icons[i % icons.length];
          return (
          <Reveal key={item.name} delay={(i % 3) * 100}>
            <article className="group h-full rounded-md border border-border bg-surface p-7 flex flex-col transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_-28px_rgba(17,17,23,0.4)]">
              <div
                className={`size-11 rounded-[4px] ${tones[i % tones.length]} flex items-center justify-center mb-6 transition-transform group-hover:-rotate-6 group-hover:scale-105`}
              >
                <Icon className="size-5 text-foreground/75" />
              </div>
              <h3 className="font-serif text-2xl tracking-tight leading-snug">
                {item.name}
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed flex-1">
                {item.desc}
              </p>
              <div className="mt-5 opacity-60 transition-opacity group-hover:opacity-100">
                <Sparkline
                  data={sparkSeries(i * 5 + 2, 4.0, 0.2, 22)}
                  width={220}
                  height={30}
                  color={sparkColors[i % sparkColors.length]}
                  strokeWidth={1.4}
                />
              </div>
            </article>
          </Reveal>
          );
        })}
        <Reveal delay={200}>
          <article className="h-full rounded-md bg-foreground text-background p-7 flex flex-col justify-between overflow-hidden relative">
            <DotSurface tone="paper" density={1600} />
            <p className="relative font-serif text-xl leading-relaxed text-background/90">
              {s.outro}
            </p>
            <span className="relative mt-6 inline-flex items-baseline text-xl font-semibold tracking-tight">
              <span>say</span>
              <span className="font-serif italic text-primary">hii</span>
              <span
                aria-hidden
                className="ml-0.5 inline-block size-1 rounded-full bg-primary translate-y-[-2px] animate-pulse-soft"
              />
            </span>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------- COMPARE -------------------- */
function Compare({ dict }: { dict: DictPart }) {
  const c = dict.home.compare;
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-24">
      <Reveal>
        <SectionHeader
          no="06"
          eyebrow={c.eyebrow}
          title={fmt(c.title)}
          sub={c.sub}
          align="center"
        />
      </Reveal>
      <div className="mt-14 grid lg:grid-cols-2 gap-5 max-w-4xl mx-auto items-stretch">
        <Reveal delay={80}>
          <article className="h-full rounded-md border border-border bg-surface/60 p-8 lg:p-9">
            <h3 className="text-lg font-medium tracking-tight text-muted">
              {c.oldTitle}
            </h3>
            <div className="relative mt-6 rounded-md border border-border bg-background p-4">
              <span className="absolute top-3 right-3 z-10 rounded-[3px] border border-border bg-surface px-2.5 py-1 font-mono text-[10px] text-muted">
                {c.oldNote}
              </span>
              <div aria-hidden className="fade-y h-28 overflow-hidden">
                <div className="animate-scroll-y space-y-3">
                  {[0, 1].map((copy) => (
                    <div key={copy} className="space-y-3 pb-3">
                      {[72, 56, 80, 48, 64, 76].map((w, i) => (
                        <div key={i} className="flex items-center gap-3 opacity-60">
                          <span
                            className="h-2 rounded-full bg-border"
                            style={{ width: `${w}%` }}
                          />
                          <span className="ml-auto flex shrink-0 gap-1.5">
                            {[0, 1, 2, 3, 4].map((d) => (
                              <span
                                key={d}
                                className="size-2.5 rounded-full border border-foreground/20"
                              />
                            ))}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <ul className="mt-6 space-y-4">
              {c.oldPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-muted">
                  <span
                    aria-hidden
                    className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-xs"
                  >
                    ✕
                  </span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
        <Reveal delay={180}>
          <article className="relative h-full overflow-hidden rounded-md bg-foreground text-background p-8 lg:p-9 shadow-[0_30px_80px_-30px_rgba(15,17,23,0.45)]">
            <DotSurface tone="paper" density={2000} />
            <h3 className="relative text-lg font-medium tracking-tight">
              <span>say</span>
              <span className="font-serif italic text-primary">hii</span>
              <span className="text-background/70">
                {c.newTitle.replace(/^sayhii/, "")}
              </span>
            </h3>
            <div className="relative mt-6 flex h-[8.5rem] flex-col justify-center gap-3 rounded-md border border-background/15 bg-background/5 p-4">
              <span className="self-start rounded-md rounded-bl-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                say<span className="font-serif italic">hii</span>
              </span>
              <span className="inline-flex items-center gap-2 self-end rounded-full border border-background/20 bg-background/10 px-3 py-1.5 text-xs font-medium">
                <span className="inline-flex size-4 items-center justify-center rounded-full bg-accent text-white">
                  <CheckIcon className="size-2.5" />
                </span>
                {c.newDone}
              </span>
            </div>
            <ul className="relative mt-6 space-y-4">
              {c.newPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CheckIcon className="size-3" />
                  </span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------- LISTEN AGAIN -------------------- */
function ListenAgain({ dict }: { dict: DictPart }) {
  const l = dict.home.listenAgain;
  return (
    <section className="relative overflow-hidden border-y border-border">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-20 text-center">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted">
            07 · {l.eyebrow}
          </p>
          <p className="mt-6 font-serif text-3xl sm:text-4xl lg:text-[2.75rem] tracking-tight leading-[1.15] max-w-3xl mx-auto">
            {fmt(l.body)}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------- UNIQUELY SAYHII -------------------- */
function UniquelySayhii({ dict }: { dict: DictPart }) {
  const u = dict.home.uniquely;
  const tones = ["bg-warm", "bg-accent-soft", "bg-sky"];
  const icons = [TimeIcon, FlaskIcon, FingerprintIcon];
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-24">
      <Reveal>
        <SectionHeader no="08" eyebrow={u.eyebrow} title={fmt(u.title)} />
      </Reveal>
      <div className="mt-12 grid lg:grid-cols-3 gap-5">
        {u.pillars.map((p, i) => {
          const Icon = icons[i];
          return (
          <Reveal key={p.title} delay={i * 100}>
            <article className="group relative h-full overflow-hidden rounded-md border border-border bg-surface p-7 flex flex-col transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_-28px_rgba(17,17,23,0.4)]">
              <span
                aria-hidden
                className="absolute -top-3 right-4 font-serif italic text-[88px] leading-none text-border select-none"
              >
                0{i + 1}
              </span>
              <div
                className={`size-11 rounded-[4px] ${tones[i]} flex items-center justify-center mb-6 transition-transform group-hover:-rotate-6 group-hover:scale-105`}
              >
                <Icon className="size-5 text-foreground/75" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted">
                {p.eyebrow}
              </p>
              <h3 className="mt-3 font-serif text-2xl tracking-tight leading-snug">
                {p.title}
              </h3>
              <p className="mt-3 text-muted leading-relaxed">{p.body}</p>
            </article>
          </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------- STORIES -------------------- */
function Stories({ dict }: { dict: DictPart }) {
  const s = dict.home.stories;
  const rowA = s.quotes.slice(0, 4);
  const rowB = s.quotes.slice(4);
  const tones = ["bg-warm", "bg-accent-soft", "bg-sky", "bg-accent-soft"];
  return (
    <section className="py-16 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <SectionHeader no="09" eyebrow={s.eyebrow} title={fmt(s.title)} align="center" />
        </Reveal>
      </div>
      <Reveal delay={120}>
        <div className="marquee-group mt-14 space-y-5">
          <MarqueeRow quotes={rowA} tones={tones} />
          <MarqueeRow quotes={rowB} tones={tones} reverse />
        </div>
      </Reveal>
    </section>
  );
}

function MarqueeRow({
  quotes,
  tones,
  reverse = false,
}: {
  quotes: string[];
  tones: string[];
  reverse?: boolean;
}) {
  const cards = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex gap-5 pr-5">
      {quotes.map((body, i) => (
        <figure
          key={i}
          className="w-[320px] sm:w-[400px] shrink-0 rounded-md border border-border bg-surface p-6 lg:p-7"
        >
          <span
            className={`size-9 rounded-[4px] ${tones[i % tones.length]} flex items-center justify-center mb-4`}
          >
            <QuoteIcon className="size-4 text-foreground/70" />
          </span>
          <blockquote className="font-serif text-lg leading-relaxed text-foreground">
            &ldquo;{body}&rdquo;
          </blockquote>
        </figure>
      ))}
    </div>
  );
  return (
    <div className="fade-x overflow-hidden">
      <div
        className={`flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {cards(false)}
        {cards(true)}
      </div>
    </div>
  );
}
