type Props = {
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "warm" | "sage" | "sky";
};

const tones = {
  warm: { a: "bg-warm", b: "bg-accent-soft" },
  sage: { a: "bg-accent-soft", b: "bg-sky" },
  sky: { a: "bg-sky", b: "bg-warm" },
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
      </div>
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-20 lg:pt-28 lg:pb-24">
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          {eyebrow}
        </span>
        <h1 className="mt-5 text-5xl lg:text-7xl tracking-tight font-semibold leading-[1.05] max-w-4xl">
          {title}
        </h1>
        {sub && (
          <p className="mt-6 max-w-2xl text-lg text-muted leading-relaxed">
            {sub}
          </p>
        )}
      </div>
    </section>
  );
}
