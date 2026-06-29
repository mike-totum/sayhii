import {
  listDepartments,
  listPeople,
  listInitiatives,
  deptName,
  type InitiativeStatus,
} from "@/lib/team";
import { DeptFilter } from "@/components/admin/dept-filter";

type Props = { searchParams: Promise<{ dept?: string }> };

const STATUS_LABEL: Record<InitiativeStatus, string> = {
  not_started: "Not started",
  on_track: "On track",
  at_risk: "At risk",
  done: "Done",
};

const STATUS_TONE: Record<InitiativeStatus, string> = {
  not_started: "bg-border/70 text-muted",
  on_track: "bg-accent-soft/70 text-foreground border border-accent/40",
  at_risk: "bg-rose-100 text-foreground border border-rose-200",
  done: "bg-warm/70 text-foreground border border-primary/30",
};

export default async function TeamInitiativesPage({ searchParams }: Props) {
  const { dept = "" } = await searchParams;
  const [departments, people, initiatives] = await Promise.all([
    listDepartments(),
    listPeople(),
    listInitiatives(dept || undefined),
  ]);
  const personName = (id: string) => people.find((p) => p.id === id)?.name ?? "—";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl tracking-tight">Initiatives</h1>
        <DeptFilter value={dept} departments={departments} />
      </div>

      <div className="mt-5 space-y-3">
        {initiatives.map((i) => (
          <div key={i.id} className="rounded-md border border-border bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-serif text-lg tracking-tight">{i.title}</h2>
                <p className="mt-1 text-sm text-muted">{i.summary}</p>
              </div>
              <span
                className={`shrink-0 text-[11px] rounded-full px-2.5 py-0.5 ${STATUS_TONE[i.status]}`}
              >
                {STATUS_LABEL[i.status]}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
              <span>Owner: <span className="text-foreground">{personName(i.ownerId)}</span></span>
              <span>
                {i.departmentIds.map((d) => deptName(departments, d)).join(", ")}
              </span>
              <span>Target: {i.targetDate}</span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${i.progress}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-muted">{i.progress}%</span>
            </div>
          </div>
        ))}
        {initiatives.length === 0 && (
          <p className="text-sm text-muted">No initiatives for this filter.</p>
        )}
      </div>
    </div>
  );
}
