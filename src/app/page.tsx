import Link from "next/link";
import { CtaBanner } from "@/components/cta-banner";
import { SectionHeader } from "@/components/section-header";
import { ArrowIcon, QuoteIcon } from "@/components/icons";

export default function Home() {
  return (
    <>
      <Hero />
      <TaglineStrip />
      <Stats />
      <ListenAgain />
      <Signals />
      <UniquelySayhii />
      <Stories />
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

/* -------------------- HERO -------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="grain" />
      <BlobBackdrop />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 backdrop-blur px-3 py-1 text-xs font-medium text-muted">
              <span className="size-1.5 rounded-full bg-accent animate-pulse-soft" />
              It all starts with sayhii
            </span>

            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight font-semibold">
              Deeper data.
              <br />
              <span className="text-muted/90">Happier</span>{" "}
              <span className="font-serif italic font-normal">employees</span>.
              <br />
              Less turnover.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted leading-relaxed">
              sayhii is a real-time feedback and insight platform that helps
              leaders identify, prioritize, and resolve employee concerns and
              operational inefficiencies — before they become systemic problems.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 h-12 rounded-full bg-primary px-6 text-primary-foreground font-medium shadow-[0_8px_24px_-8px_rgba(255,107,91,0.6)] hover:bg-primary-hover transition-all"
              >
                Schedule a 30-min chat
                <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/notes"
                className="inline-flex items-center gap-2 h-12 rounded-full border border-border bg-surface px-6 font-medium text-foreground hover:border-foreground/30 transition-colors"
              >
                Read the field notes
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
              <span>
                <span className="font-medium text-foreground">90%+</span>{" "}
                daily adoption
              </span>
            </div>
          </div>

          <HeroVisual />
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

function HeroVisual() {
  return (
    <div className="relative">
      <div className="relative rounded-[28px] bg-surface border border-border shadow-[0_30px_80px_-30px_rgba(15,17,23,0.25)] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-xs font-medium text-muted">
              Today&rsquo;s check-in · 3 seconds
            </span>
          </div>
          <span className="text-xs text-muted">9:14 AM</span>
        </div>
        <p className="mt-5 text-2xl tracking-tight font-medium leading-snug">
          How clear is the work in front of you this week?
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
        <p className="mt-4 text-xs text-muted">
          Anonymous · aggregated at a sample size of 5 or greater
        </p>
      </div>

      <FloatingCard
        className="absolute -top-6 -left-10 hidden md:block animate-float"
        accent="bg-accent"
      >
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          Lens
        </span>
        <p className="text-base font-medium">
          <span className="font-serif italic">Individual</span>, team, org
        </p>
      </FloatingCard>
      <FloatingCard
        className="absolute -bottom-8 -right-6 hidden md:block animate-float [animation-delay:1.5s]"
        accent="bg-primary"
      >
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          The signal
        </span>
        <p className="text-sm font-medium">
          Trust · Workload · Safety · Clarity · Belonging
        </p>
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

function TaglineStrip() {
  return (
    <section className="border-y border-border/60 bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-3">
          The promise
        </p>
        <p className="text-2xl sm:text-3xl tracking-tight font-medium">
          Empower your workforce.{" "}
          <span className="font-serif italic">Eliminate</span> blind spots.
        </p>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "90%+", label: "Daily adoption" },
    {
      value: "3 sec",
      label: "A day · just 12.5 minutes a year",
    },
    {
      value: "< 4 hrs",
      label: "Of technical time to roll out system-wide",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28">
      <div className="grid md:grid-cols-3 gap-px bg-border rounded-3xl overflow-hidden border border-border">
        {stats.map((s) => (
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

function ListenAgain() {
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-10 lg:py-16">
      <div className="rounded-[32px] border border-border bg-warm/50 p-10 lg:p-14 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          A note from sayhii
        </p>
        <p className="mt-5 text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium leading-snug max-w-3xl mx-auto">
          If emails aren&rsquo;t working, the problem isn&rsquo;t the inbox —
          it&rsquo;s how we&rsquo;re communicating.{" "}
          <span className="font-serif italic">sayhii</span> helps teams listen
          again.
        </p>
      </div>
    </section>
  );
}

function Signals() {
  return (
    <section
      id="signals"
      className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28"
    >
      <SectionHeader
        eyebrow="The signals"
        title={
          <>
            What&rsquo;s hard to see is often what{" "}
            <span className="font-serif italic">matters most</span>.
          </>
        }
        sub="sayhii transforms 3-second daily micro-signals into clear, actionable insights at the individual, team, and organizational level — giving leaders visibility into the foundational needs that quietly shape performance, culture, and retention."
      />
      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
        {[
          { name: "Trust", tone: "bg-warm" },
          { name: "Workload strain", tone: "bg-sky" },
          { name: "Psychological safety", tone: "bg-accent-soft" },
          { name: "Clarity", tone: "bg-warm" },
          { name: "Belonging", tone: "bg-accent-soft" },
        ].map((s) => (
          <article
            key={s.name}
            className="group rounded-3xl border border-border bg-surface p-7"
          >
            <div
              className={`size-10 rounded-2xl ${s.tone} flex items-center justify-center mb-6`}
            >
              <span className="size-2.5 rounded-full bg-foreground/80" />
            </div>
            <h3 className="text-lg tracking-tight font-medium leading-snug">
              {s.name}
            </h3>
          </article>
        ))}
      </div>
      <p className="mt-8 max-w-3xl text-muted leading-relaxed">
        sayhii brings those signals to the surface in real time, enabling
        faster decisions, better outcomes, and a healthier, more resilient
        workforce.
      </p>
    </section>
  );
}

function UniquelySayhii() {
  const pillars = [
    {
      eyebrow: "Because your time is valuable",
      title: "We give your time back.",
      body: "The amount of extra time your managers have, and the amount you want to spend on redundant tech. Sure, we give you the insights and actions you need to empower your entire workforce, but we also give you and your employees back something much more finite: your time.",
    },
    {
      eyebrow: "Because being science-backed matters",
      title: "Patent-pending, by design.",
      body: "There's only one solution that combines multiple human data perspectives — patent pending — to drive your leaders' plans and human priorities. That solution is sayhii.",
    },
    {
      eyebrow: "Because one-size-fits-all isn't a fit",
      title: "100% of your employees are unique.",
      body: "With just one question a day, sayhii learns each of your people as individuals and prompts them with what they need to do to become the best versions of themselves — inside the office and out.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28">
      <SectionHeader
        eyebrow="Uniquely sayhii"
        title={
          <>
            Three reasons it&rsquo;s{" "}
            <span className="font-serif italic">not</span> like the others.
          </>
        }
      />
      <div className="mt-14 grid lg:grid-cols-3 gap-5">
        {pillars.map((p, i) => {
          const tones = ["bg-warm", "bg-accent-soft", "bg-sky"];
          return (
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
          );
        })}
      </div>
    </section>
  );
}

function Stories() {
  const quotes = [
    {
      body: "There are many things unique about sayhii, but most of all, that it touches the whole employee lifecycle.",
      tone: "bg-warm",
      size: "lg",
    },
    {
      body: "This is the missing piece for us.",
      tone: "bg-accent-soft",
      size: "sm",
    },
    {
      body: "There is nothing out there like this… Nothing!",
      tone: "bg-sky",
      size: "sm",
    },
    {
      body: "Sayhii is a hi-tech, easy to use, conduit into existing levels of motivation, commitment, and engagement that otherwise would be a mystery.",
      tone: "bg-accent-soft",
      size: "lg",
    },
    {
      body: "I hear this and my initial thought is, 'It's genius!'",
      tone: "bg-warm",
      size: "sm",
    },
    {
      body: "Sayhii takes it from being an event to an integrated part of your day that you don't have to think about.",
      tone: "bg-sky",
      size: "md",
    },
    {
      body: "That the program doesn't hinge on the success of any one group's success is critical.",
      tone: "bg-accent-soft",
      size: "md",
    },
    {
      body: "The team view was super interesting and made me want to dig into it more.",
      tone: "bg-warm",
      size: "md",
    },
  ] as const;

  return (
    <section
      id="stories"
      className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28"
    >
      <SectionHeader
        eyebrow="What people are saying"
        title={
          <>
            In the words of the people{" "}
            <span className="font-serif italic">already</span> in sayhii.
          </>
        }
      />
      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-[1fr]">
        {quotes.map((q, i) => (
          <figure
            key={i}
            className={`rounded-3xl border border-border bg-surface p-6 lg:p-7 flex flex-col ${
              q.size === "lg"
                ? "sm:col-span-2 lg:col-span-2"
                : q.size === "md"
                  ? "lg:col-span-1"
                  : ""
            }`}
          >
            <span
              className={`size-10 rounded-2xl ${q.tone} flex items-center justify-center mb-5`}
            >
              <QuoteIcon className="size-5 text-foreground/70" />
            </span>
            <blockquote
              className={`leading-relaxed text-foreground ${
                q.size === "lg"
                  ? "text-2xl tracking-tight font-medium"
                  : "text-base"
              }`}
            >
              &ldquo;{q.body}&rdquo;
            </blockquote>
          </figure>
        ))}
      </div>
    </section>
  );
}
