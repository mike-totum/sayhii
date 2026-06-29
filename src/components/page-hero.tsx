import { DotSurface } from "./dot-field";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  /* kept for call-site compatibility; the editorial system has one tone */
  tone?: "warm" | "sage" | "sky";
};

export function PageHero({ eyebrow, title, sub }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <DotSurface density={2200} />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="border-b border-border py-4 text-[11px] uppercase tracking-[0.25em] text-muted rise">
          {eyebrow}
        </div>
        <div className="pt-12 pb-16 lg:pt-16 lg:pb-20">
          <h1 className="rise rise-1 font-serif font-normal text-5xl lg:text-7xl tracking-tight leading-[1.05] max-w-4xl">
            {title}
          </h1>
          {sub && (
            <p className="rise rise-2 mt-6 max-w-2xl text-lg text-muted leading-relaxed">
              {sub}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
