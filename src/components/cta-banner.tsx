import Link from "next/link";
import { ArrowIcon } from "./icons";

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
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28">
      <div className="relative overflow-hidden rounded-[32px] bg-foreground text-background p-10 lg:p-16">
        <div className="grain" />
        <div
          aria-hidden
          className="absolute -top-24 -right-24 size-[420px] rounded-full bg-primary/30 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-20 size-[360px] rounded-full bg-accent/20 blur-3xl"
        />
        <div className="relative max-w-3xl">
          <span className="text-xs uppercase tracking-[0.2em] text-background/60">
            {eyebrow}
          </span>
          <h2 className="mt-4 text-4xl lg:text-6xl tracking-tight font-semibold leading-[1.05]">
            {title}
          </h2>
          <p className="mt-5 text-lg text-background/70 max-w-xl">{sub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={primary.href}
              className="group inline-flex items-center gap-2 h-12 rounded-full bg-primary px-6 font-medium text-primary-foreground shadow-[0_8px_24px_-8px_rgba(255,107,91,0.6)] hover:bg-primary-hover transition-all"
            >
              {primary.label}
              <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            {secondary && (
              <Link
                href={secondary.href}
                className="inline-flex items-center h-12 rounded-full border border-background/20 bg-transparent px-6 font-medium hover:bg-background/5 transition-colors"
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
