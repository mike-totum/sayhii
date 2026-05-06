import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CtaBanner } from "@/components/cta-banner";
import { ArrowIcon } from "@/components/icons";
import { issues } from "@/lib/notes-issues";

export const metadata: Metadata = {
  title: "Notes from the Field — sayhii",
  description:
    "Workforce Navigator: insights from CIOs, HR leaders, and industry experts to help you optimize your strategy for an ever-changing workforce.",
};

const tones = ["bg-warm", "bg-accent-soft", "bg-sky", "bg-accent-soft"] as const;

export default function NotesPage() {
  return (
    <>
      <PageHero
        tone="sky"
        eyebrow="Notes from the Field"
        title={
          <>
            <span className="font-serif italic">Workforce</span> Navigator.
          </>
        }
        sub="Welcome to Notes from the Field — your trusted resource for navigating the evolving landscape of human capital management. In each issue, we bring together insights from CIOs, HR leaders, and industry experts to help you optimize your strategy for an ever-changing workforce."
      />

      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-8">
          Available issues
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {issues.map((issue, i) => (
            <a
              key={issue.href}
              href={issue.href}
              target="_blank"
              rel="noreferrer"
              className="group relative rounded-[28px] border border-border bg-surface overflow-hidden hover:-translate-y-0.5 transition-transform"
            >
              <div className={`h-2 ${tones[i % tones.length]}`} />
              <div className="p-8 lg:p-10 grid sm:grid-cols-[auto_1fr] gap-6 items-start">
                <div
                  className={`hidden sm:flex size-20 rounded-2xl ${tones[i % tones.length]} items-center justify-center`}
                >
                  <span className="font-serif italic text-3xl text-foreground/70">
                    {issue.label[0]}
                  </span>
                </div>
                <div>
                  {issue.number && (
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      {issue.number}
                    </p>
                  )}
                  <h2 className="mt-2 text-2xl lg:text-3xl tracking-tight font-semibold leading-tight">
                    {issue.label}
                  </h2>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium group-hover:text-primary transition-colors">
                    Open the PDF on sayhii.io
                    <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
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
