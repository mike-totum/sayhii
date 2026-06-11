import Link from "next/link";
import { ArrowIcon } from "./icons";
import { DotSurface } from "./dot-field";

type Action = { label: string; href: string };

export function CtaBanner({
  eyebrow,
  title,
  sub,
  primary,
  secondary,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub: React.ReactNode;
  primary: Action;
  secondary?: Action;
}) {
  return (
    <section className="relative overflow-hidden bg-foreground text-background mt-24">
      <DotSurface tone="paper" density={1800} />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex items-center justify-between gap-4 border-b border-background/15 py-4 text-[11px] uppercase tracking-[0.25em] text-background/55">
          <span>10 · {eyebrow}</span>
          <span aria-hidden className="size-1.5 rounded-full bg-primary animate-pulse-soft" />
        </div>
        <div className="py-16 lg:py-24 max-w-3xl">
          <h2 className="font-serif font-normal text-4xl lg:text-6xl tracking-tight leading-[1.05]">
            {title}
          </h2>
          <p className="mt-5 text-lg text-background/70 max-w-xl">{sub}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={primary.href}
              className="group inline-flex items-center gap-2 h-12 rounded-[4px] bg-primary px-7 font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              {primary.label}
              <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            {secondary && (
              <Link
                href={secondary.href}
                className="inline-flex items-center h-12 rounded-[4px] border border-background/25 px-7 font-medium hover:border-background/60 transition-colors"
              >
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
