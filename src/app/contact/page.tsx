import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ArrowIcon } from "@/components/icons";
import { WalkthroughForm } from "./walkthrough-form";

export const metadata: Metadata = {
  title: "Get Started Today — sayhii",
  description:
    "Contact sayhii. hi@sayhii.io · 100 S. Clinton Ave, Rochester, NY 14604.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        tone="warm"
        eyebrow="Contact us"
        title={
          <>
            Get started{" "}
            <span className="font-serif italic">today</span>.
          </>
        }
        sub="Tell us a little about your team and we'll be in touch."
      />

      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-24">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-10">
          <WalkthroughForm />

          <aside className="space-y-5">
            <div className="rounded-3xl border border-border bg-surface p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Email us directly
              </p>
              <a
                href="mailto:hi@sayhii.io"
                className="mt-3 inline-flex items-center gap-2 text-2xl tracking-tight font-medium hover:text-primary transition-colors"
              >
                hi@sayhii.io
                <ArrowIcon className="size-5" />
              </a>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Visit
              </p>
              <p className="mt-3 text-lg tracking-tight font-medium leading-snug">
                100 S. Clinton Ave
                <br />
                Rochester, NY 14604
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-foreground text-background p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-background/60">
                When you&rsquo;re ready
              </p>
              <p className="mt-3 text-xl tracking-tight font-medium leading-snug">
                When you&rsquo;re ready to sayhii, we&rsquo;re ready to answer.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
