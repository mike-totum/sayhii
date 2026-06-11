type Props = {
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "warm" | "sage" | "sky";
};

const tones = {
  warm: { a: "bg-warm", b: "bg-accent-soft", c: "bg-sky" },
  sage: { a: "bg-accent-soft", b: "bg-sky", c: "bg-warm" },
  sky: { a: "bg-sky", b: "bg-warm", c: "bg-accent-soft" },
};

export function PageHero({ eyebrow, title, sub, tone = "warm" }: Props) {
  const t = tones[tone];
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="grain" />
      <div aria-hidden className="absolute inset-0 -z-10">
        <div
          className={`absolute -top-32 -right-24 size-[460px] rounded-full ${t.a} blur-3xl opacity-70`}
        />
        <div
          className={`absolute top-40 -left-32 size-[380px] rounded-full ${t.b} blur-3xl opacity-70`}
        />
        <div
          className={`absolute -bottom-28 right-1/3 size-[300px] rounded-full ${t.c} blur-3xl opacity-50`}
        />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-20 lg:pt-28 lg:pb-24">
        <span className="rise inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 backdrop-blur px-3 py-1 text-xs font-medium text-muted">
          <span className="size-1.5 rounded-full bg-accent animate-pulse-soft" />
          {eyebrow}
        </span>
        <h1 className="rise rise-1 mt-6 text-5xl lg:text-7xl tracking-tight font-semibold leading-[1.05] max-w-4xl">
          {title}
        </h1>
        {sub && (
          <p className="rise rise-2 mt-6 max-w-2xl text-lg text-muted leading-relaxed">
            {sub}
          </p>
        )}
      </div>
    </section>
  );
}
