import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { departments, themes, deptThemeScore, scoreCellTone } from "@/lib/portal-data";

type Props = { params: Promise<{ locale: string }> };

export default async function ComparisonPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);
  if (session.role !== "admin") redirect(`/${locale}/portal`);

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Admin · departments
        </p>
        <h1 className="mt-2 text-4xl tracking-tight font-semibold">
          Side-by-side, by{" "}
          <span className="font-serif italic text-primary">department</span>.
        </h1>
        <p className="mt-3 text-muted max-w-2xl leading-relaxed">
          Average answer over the last three months. Soft cell colors highlight
          where a group is meaningfully above or below the org baseline.
        </p>
      </header>

      <section className="rounded-3xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-muted border-b border-border">
                <th className="px-5 py-3 font-medium sticky left-0 bg-surface">
                  Department
                </th>
                {themes.map((t) => (
                  <th key={t.key} className="px-3 py-3 font-medium whitespace-nowrap">
                    {t.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.name} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium sticky left-0 bg-surface">
                    <div>{d.name}</div>
                    <div className="text-xs text-muted">{d.users} users</div>
                  </td>
                  {themes.map((t) => {
                    const v = deptThemeScore(d.name, t.key);
                    return (
                      <td key={t.key} className="px-3 py-3 align-middle">
                        <span
                          className={`inline-flex items-center justify-center min-w-[52px] rounded-lg px-2.5 py-1 font-mono text-xs ${scoreCellTone(v)}`}
                        >
                          {v.toFixed(2)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t-2 border-border bg-background/50">
                <td className="px-5 py-3 font-medium sticky left-0 bg-surface">
                  Total
                </td>
                {themes.map((t) => (
                  <td key={t.key} className="px-3 py-3">
                    <span className="font-mono text-xs">{t.org.toFixed(2)}</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid sm:grid-cols-4 gap-3 max-w-3xl">
        {[
          { label: "≥ 4.0", tone: "bg-accent-soft" },
          { label: "3.5 – 3.99", tone: "bg-warm/60" },
          { label: "3.0 – 3.49", tone: "bg-amber-100" },
          { label: "< 3.0", tone: "bg-rose-100" },
        ].map((l) => (
          <div key={l.label} className={`rounded-xl px-3 py-2 text-xs ${l.tone}`}>
            <span className="font-mono">{l.label}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
