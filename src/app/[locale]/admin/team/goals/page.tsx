import {
  listDepartments,
  listPeople,
  listGoals,
  CURRENT_WEEK_LABEL,
  type GoalStatus,
  type WeeklyGoal,
} from "@/lib/team";
import { DeptFilter } from "@/components/admin/dept-filter";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ dept?: string }>;
};

export default async function TeamGoalsPage({ searchParams }: Props) {
  const { dept = "" } = await searchParams;
  const [departments, people, goals] = await Promise.all([
    listDepartments(),
    listPeople(),
    listGoals(dept || undefined),
  ]);

  const peopleWithGoals = people
    .filter((p) => (dept ? p.departmentId === dept : true))
    .map((p) => ({ person: p, goals: goals.filter((g) => g.personId === p.id) }))
    .filter((x) => x.goals.length > 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl tracking-tight">Weekly goals</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">{CURRENT_WEEK_LABEL}</span>
          <DeptFilter value={dept} departments={departments} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {peopleWithGoals.map(({ person, goals }) => (
          <div key={person.id} className="rounded-md border border-border bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{person.name}</p>
              <span className="text-xs text-muted">{person.role}</span>
            </div>
            <div className="mt-3 space-y-3">
              <GoalGroup label="Professional" goals={goals.filter((g) => g.type === "professional")} />
              <GoalGroup label="Personal" goals={goals.filter((g) => g.type === "personal")} />
            </div>
          </div>
        ))}
        {peopleWithGoals.length === 0 && (
          <p className="text-sm text-muted">No goals set for this filter yet.</p>
        )}
      </div>
    </div>
  );
}

function GoalGroup({ label, goals }: { label: string; goals: WeeklyGoal[] }) {
  if (goals.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted mb-1.5">{label}</p>
      <ul className="space-y-1.5">
        {goals.map((g) => (
          <li key={g.id} className="flex items-start gap-2 text-sm">
            <StatusDot status={g.status} />
            <span className={g.status === "done" ? "text-muted line-through" : ""}>
              {g.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusDot({ status }: { status: GoalStatus }) {
  const map: Record<GoalStatus, string> = {
    done: "bg-accent",
    on_track: "bg-sky",
    missed: "bg-primary",
  };
  return (
    <span
      aria-label={status}
      title={status.replace("_", " ")}
      className={`mt-1.5 size-2 shrink-0 rounded-full ${map[status]}`}
    />
  );
}
