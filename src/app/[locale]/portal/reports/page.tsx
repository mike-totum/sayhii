import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { ArrowIcon } from "@/components/icons";

type Props = { params: Promise<{ locale: string }> };

const reports = [
  {
    title: "Personal scorecard · Q1 2026",
    blurb: "Your themes, vitals, and check-in cadence over the last 90 days.",
    date: "Apr 4, 2026",
    type: "PDF",
    size: "1.4 MB",
    accent: "primary",
  },
  {
    title: "Personal scorecard · Q4 2025",
    blurb: "End-of-year summary including the company benchmark.",
    date: "Jan 6, 2026",
    type: "PDF",
    size: "1.2 MB",
    accent: "warm",
  },
  {
    title: "Sub-theme breakdown · Environment",
    blurb: "Your inputs to the Environment theme, per sub-theme.",
    date: "Mar 12, 2026",
    type: "CSV",
    size: "62 KB",
    accent: "sky",
  },
  {
    title: "Manager comparison · Grey's Anatomy",
    blurb: "Anonymous group comparison shared by your manager.",
    date: "Feb 19, 2026",
    type: "PDF",
    size: "780 KB",
    accent: "accent",
  },
];

const accentMap: Record<string, string> = {
  primary: "bg-warm/70 text-primary",
  warm: "bg-warm text-primary",
  sky: "bg-sky text-foreground/80",
  accent: "bg-accent-soft text-accent",
};

export default async function ReportsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);

  return (
    <div className="px-6 lg:px-10 py-7 lg:py-9 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 rise">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            Reports
          </p>
          <h1 className="mt-1 text-3xl lg:text-4xl tracking-tight font-semibold">
            Your{" "}
            <span className="font-serif italic text-primary">downloads</span>{" "}
            and exports.
          </h1>
        </div>
        <button className="inline-flex items-center gap-2 h-10 rounded-full bg-foreground text-background px-4 text-sm font-medium hover:bg-foreground/85 transition-colors">
          Generate a new report
          <ArrowIcon className="size-4" />
        </button>
      </header>

      {/* Filter row */}
      <div className="rise rise-1 flex flex-wrap items-center gap-2">
        {["All", "Personal", "Group", "PDFs", "CSVs"].map((f, i) => (
          <button
            key={f}
            className={`inline-flex items-center h-8 rounded-full border px-3 text-xs font-medium transition-colors ${
              i === 0
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-surface text-muted hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Available reports */}
      <section className="rise rise-2">
        <div className="grid md:grid-cols-2 gap-4">
          {reports.map((r) => (
            <article
              key={r.title}
              className="group rounded-2xl border border-border bg-surface p-5 hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex items-start gap-4">
                <span
                  className={`size-12 shrink-0 rounded-xl flex items-center justify-center text-[10px] font-mono tracking-widest ${
                    accentMap[r.accent] ?? "bg-warm text-primary"
                  }`}
                >
                  {r.type}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-medium leading-snug">{r.title}</h2>
                  <p className="mt-1 text-sm text-muted leading-relaxed">
                    {r.blurb}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                    <span>{r.date}</span>
                    <span className="size-0.5 rounded-full bg-muted" />
                    <span>{r.size}</span>
                  </div>
                </div>
                <button
                  aria-label={`Download ${r.title}`}
                  className="size-9 rounded-full border border-border bg-background hover:border-foreground/30 hover:bg-surface transition-colors flex items-center justify-center"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="size-4 text-muted group-hover:text-foreground transition-colors">
                    <path
                      d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Scheduled reports placeholder */}
      <section className="rise rise-3 rounded-3xl border border-dashed border-border bg-surface/50 p-8 lg:p-10 grid lg:grid-cols-[auto_1fr_auto] gap-6 items-center">
        <span className="size-14 rounded-2xl bg-warm/60 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="size-6 text-foreground/70">
            <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            No scheduled reports
          </p>
          <p className="mt-2 text-lg tracking-tight font-medium">
            Get a personal summary delivered every Monday.
          </p>
          <p className="mt-1 text-sm text-muted">
            Choose what to include and we&rsquo;ll email it to{" "}
            <span className="font-mono text-foreground/80">{session.email}</span>.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 h-11 rounded-full border border-foreground bg-foreground text-background px-5 text-sm font-medium hover:bg-foreground/85 transition-colors">
          Set up a schedule
          <ArrowIcon className="size-4" />
        </button>
      </section>
    </div>
  );
}
