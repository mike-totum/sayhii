import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { managers, departments } from "@/lib/portal-data";

type Props = { params: Promise<{ locale: string }> };

export default async function HierarchyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);
  if (session.role !== "admin") redirect(`/${locale}/portal`);

  const total = managers.reduce(
    (acc, m) => ({
      expected: acc.expected + m.expected,
      confirmed: acc.confirmed + m.confirmed,
      active: acc.active + m.active,
    }),
    { expected: 0, confirmed: 0, active: 0 },
  );

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Admin · hierarchy
        </p>
        <h1 className="mt-2 text-4xl tracking-tight font-semibold">
          Org{" "}
          <span className="font-serif italic text-primary">hierarchy</span>{" "}
          review.
        </h1>
        <p className="mt-3 text-muted max-w-2xl leading-relaxed">
          Confirm everyone is mapped to the right manager and department before
          your next pulse.
        </p>
      </header>

      <section className="grid lg:grid-cols-[1fr_2fr] gap-6">
        <div className="rounded-3xl border border-border bg-surface p-6 lg:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Department / Group
          </p>
          <h2 className="mt-1 text-2xl tracking-tight font-semibold">
            Group level 2
          </h2>
          <ul className="mt-6 divide-y divide-border">
            {departments.map((d) => (
              <li key={d.name} className="grid grid-cols-[1fr_auto] gap-4 py-3">
                <span className="font-medium">{d.name}</span>
                <span className="font-mono text-sm tabular-nums">{d.users}</span>
              </li>
            ))}
            <li className="grid grid-cols-[1fr_auto] gap-4 py-3 border-t-2 border-border bg-background/50 -mx-6 lg:-mx-8 px-6 lg:px-8">
              <span className="font-medium">Total</span>
              <span className="font-mono text-sm tabular-nums">
                {departments.reduce((a, d) => a + d.users, 0)}
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 lg:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Manager hierarchy
          </p>
          <h2 className="mt-1 text-2xl tracking-tight font-semibold">
            Manager level 1
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-muted border-b border-border">
                  <th className="py-2 font-medium">Manager</th>
                  <th className="py-2 font-medium text-right">Expected</th>
                  <th className="py-2 font-medium text-right">Confirmed</th>
                  <th className="py-2 font-medium text-right">Active</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((m) => (
                  <tr key={m.email} className="border-b border-border last:border-0">
                    <td className="py-3">
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted">{m.email}</p>
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums">{m.expected}</td>
                    <td className="py-3 text-right font-mono tabular-nums">{m.confirmed}</td>
                    <td className="py-3 text-right font-mono tabular-nums">{m.active}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border bg-background/50">
                  <td className="py-3 font-medium">Total</td>
                  <td className="py-3 text-right font-mono tabular-nums">{total.expected}</td>
                  <td className="py-3 text-right font-mono tabular-nums">{total.confirmed}</td>
                  <td className="py-3 text-right font-mono tabular-nums">{total.active}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
