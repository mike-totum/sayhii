import Link from "next/link";
import { getOverview, CURRENT_WEEK_LABEL } from "@/lib/team";

type Props = { params: Promise<{ locale: string }> };

export default async function TeamOverviewPage({ params }: Props) {
  const { locale } = await params;
  const rows = await getOverview();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl tracking-tight">Company overview</h1>
        <span className="text-xs text-muted">{CURRENT_WEEK_LABEL}</span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <Link
            key={r.department.id}
            href={`/${locale}/admin/team/boards?dept=${r.department.id}`}
            className="group rounded-md border border-border bg-surface p-5 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(17,17,23,0.4)] transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl tracking-tight">{r.department.name}</h2>
              <span className="text-xs text-muted">{r.headcount} people</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat
                label="Goals done"
                value={r.goalCompletionPct === null ? "—" : `${r.goalCompletionPct}%`}
              />
              <Stat
                label="Initiatives"
                value={`${r.initiativesTotal}`}
                hint={r.initiativesAtRisk ? `${r.initiativesAtRisk} at risk` : undefined}
                alert={r.initiativesAtRisk > 0}
              />
              <Stat label="Open work" value={`${r.openWork}`} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  alert,
}: {
  label: string;
  value: string;
  hint?: string;
  alert?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-serif text-2xl tabular-nums">{value}</p>
      {hint && (
        <p className={`text-[11px] ${alert ? "text-primary" : "text-muted"}`}>{hint}</p>
      )}
    </div>
  );
}
