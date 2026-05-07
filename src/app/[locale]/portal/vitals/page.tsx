import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { vitals } from "@/lib/portal-data";
import { VitalsAreaChart } from "@/components/portal/charts/line";

type Props = { params: Promise<{ locale: string }> };

const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const series = months.map((m, i) => ({
  month: `${m} ${i < 6 ? 25 : 26}`,
  resources: 4.4 + Math.sin(i / 3) * 0.15,
  demands: 3.0 + Math.sin(i / 2.4) * 0.5 + (i > 7 ? 0.6 : 0),
  balance: 3.5 - Math.cos(i / 4) * 0.4 + (i > 4 ? -0.1 : 0.2),
}));

export default async function VitalsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Your vitals
        </p>
        <h1 className="mt-2 text-4xl tracking-tight font-semibold">
          Three things you can&rsquo;t fake.
        </h1>
        <p className="mt-3 text-muted max-w-2xl leading-relaxed">
          Vitals impact your ability to perform over time. Stress, bandwidth,
          and balance are interconnected — measuring all three keeps the
          picture honest.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-4">
        {vitals.map((v) => {
          const yourClass =
            v.yourGrade === "Excellent"
              ? "text-accent"
              : v.yourGrade === "Substantial"
                ? "text-primary"
                : "text-foreground";
          return (
            <article
              key={v.key}
              className="rounded-3xl border border-border bg-surface p-6"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {v.label}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-3xl tracking-tight font-semibold ${yourClass}`}>
                    {v.yourGrade}
                  </p>
                  <p className="mt-1 text-xs text-muted">You</p>
                </div>
                <div>
                  <p className="text-3xl tracking-tight font-semibold text-foreground/80">
                    {v.orgGrade}
                  </p>
                  <p className="mt-1 text-xs text-muted">Organization</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted leading-relaxed">{v.blurb}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-3xl border border-border bg-surface p-6 lg:p-8">
        <header className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Vitals over time
            </p>
            <h2 className="mt-1 text-2xl tracking-tight font-semibold">
              The last twelve months
            </h2>
          </div>
        </header>
        <VitalsAreaChart data={series} />
      </section>
    </div>
  );
}
