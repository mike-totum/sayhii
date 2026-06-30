"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTeam } from "@/lib/team-store";
import {
  addWeeks,
  currentWeekMonday,
  weekLabel,
  type GoalStatus,
  type GoalType,
  type Person,
  type WeeklyGoal,
} from "@/lib/team";
import { PersonAvatar } from "@/components/admin/person-chip";

// PULSE — the Monday meeting cockpit. Amy walks the team top-to-bottom: grade
// last week's two goals (Hit/Missed), set this week's two. Goals are stamped
// with their week, so history + streaks accrue automatically.

const STREAK_WEEKS = 6;

export default function PulsePage() {
  const { locale } = useParams<{ locale: string }>();
  const { data, me, addGoal, updateGoal } = useTeam();
  const [dept, setDept] = useState("");
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week
  const [burstId, setBurstId] = useState<string | null>(null);

  const currentWeek = currentWeekMonday();
  const thisWeek = addWeeks(currentWeek, -weekOffset); // the "set" column
  const lastWeek = addWeeks(thisWeek, -1); // the "grade" column
  const isCurrent = weekOffset === 0;

  const people = useMemo(
    () => data.people.filter((p) => p.active && (dept ? p.departmentId === dept : true)),
    [data.people, dept],
  );

  const goalOf = (personId: string, type: GoalType, week: string) =>
    data.goals.find((g) => g.personId === personId && g.type === type && g.weekOf === week);

  // rollup
  const setThisWeek = people.filter((p) =>
    data.goals.some((g) => g.personId === p.id && g.weekOf === thisWeek),
  ).length;
  const lastWeekGoals = data.goals.filter(
    (g) => g.weekOf === lastWeek && people.some((p) => p.id === g.personId),
  );
  const graded = lastWeekGoals.filter((g) => g.status !== "on_track");
  const hits = graded.filter((g) => g.status === "done").length;
  const hitRate = graded.length ? Math.round((hits / graded.length) * 100) : null;

  function grade(goal: WeeklyGoal, status: GoalStatus) {
    if (status === "done" && goal.status !== "done") {
      setBurstId(goal.id);
      setTimeout(() => setBurstId((id) => (id === goal.id ? null : id)), 1100);
    }
    updateGoal(goal.id, { status });
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div>
      {/* header + rollup */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Weekly pulse</h1>
          <p className="mt-1 text-sm text-muted">{isCurrent ? today : "Reviewing history"}</p>
        </div>
        <div className="flex items-center gap-3">
          <Rollup label="Set this week" value={`${setThisWeek}/${people.length}`} />
          <Rollup label="Hit last week" value={hitRate === null ? "—" : `${hitRate}%`} accent />
        </div>
      </div>

      {/* week switcher + dept chips */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={dept === ""} onClick={() => setDept("")}>
            All
          </Chip>
          {data.departments.map((d) => (
            <Chip key={d.id} active={dept === d.id} onClick={() => setDept(d.id)}>
              {d.name}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full glass px-2 py-1">
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="px-1.5 text-muted hover:text-foreground"
            aria-label="Previous week"
          >
            ◀
          </button>
          <span className="min-w-32 text-center text-xs font-medium">
            {weekLabel(thisWeek)}
            {isCurrent && <span className="ml-1 text-muted">· now</span>}
          </span>
          <button
            onClick={() => setWeekOffset((o) => Math.max(0, o - 1))}
            disabled={isCurrent}
            className="px-1.5 text-muted hover:text-foreground disabled:opacity-30"
            aria-label="Next week"
          >
            ▶
          </button>
        </div>
      </div>

      {/* per-person rows */}
      <div className="mt-6 space-y-4">
        {people.map((person) => (
          <PersonRow
            key={person.id}
            locale={locale}
            person={person}
            lastWeek={lastWeek}
            thisWeek={thisWeek}
            goals={data.goals.filter((g) => g.personId === person.id)}
            goalOf={goalOf}
            burstId={burstId}
            canEdit={!!me?.isAdmin || me?.personId === person.id}
            onGrade={grade}
            onSet={(type, text) =>
              addGoal({ personId: person.id, type, text, status: "on_track", weekOf: thisWeek })
            }
            onEdit={(id, text) => updateGoal(id, { text })}
          />
        ))}
        {people.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">No one in this view yet.</p>
        )}
      </div>
    </div>
  );
}

function PersonRow({
  locale,
  person,
  lastWeek,
  thisWeek,
  goals,
  goalOf,
  burstId,
  canEdit,
  onGrade,
  onSet,
  onEdit,
}: {
  locale: string;
  person: Person;
  lastWeek: string;
  thisWeek: string;
  goals: WeeklyGoal[];
  goalOf: (personId: string, type: GoalType, week: string) => WeeklyGoal | undefined;
  burstId: string | null;
  canEdit: boolean;
  onGrade: (goal: WeeklyGoal, status: GoalStatus) => void;
  onSet: (type: GoalType, text: string) => void;
  onEdit: (id: string, text: string) => void;
}) {
  return (
    <div className="glass glass-hover rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <PersonAvatar person={person} size={34} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/${locale}/admin/team/people/${person.id}`}
            className="block truncate text-sm font-semibold hover:text-primary"
          >
            {person.name}
          </Link>
          <p className="truncate text-xs text-muted">{person.role || "—"}</p>
        </div>
        <StreakStrip person={person} goals={goals} endWeek={lastWeek} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* last week — grade */}
        <div className="glass-well rounded-xl p-3">
          <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted">
            Last week · {weekLabel(lastWeek).replace("Week of ", "")}
          </p>
          {(["professional", "personal"] as GoalType[]).map((type) => {
            const goal = goalOf(person.id, type, lastWeek);
            return (
              <div key={type} className="mb-2 last:mb-0">
                <p className="text-[10px] uppercase tracking-wide text-muted/70">{type}</p>
                {goal ? (
                  <div className="mt-0.5 flex items-start gap-2">
                    <p className={`relative flex-1 text-sm leading-snug ${goal.status === "done" ? "text-muted" : ""}`}>
                      {goal.text}
                      {burstId === goal.id && (
                        <span className="animate-recognize pointer-events-none absolute -top-3 left-0 text-base">
                          ✨🎉
                        </span>
                      )}
                    </p>
                    {canEdit ? (
                      <GradeButtons value={goal.status} onChange={(s) => onGrade(goal, s)} />
                    ) : (
                      <GradeBadge value={goal.status} />
                    )}
                  </div>
                ) : (
                  <p className="mt-0.5 text-sm text-muted/60">—</p>
                )}
              </div>
            );
          })}
        </div>

        {/* this week — set */}
        <div className="glass-well rounded-xl p-3">
          <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted">This week</p>
          {(["professional", "personal"] as GoalType[]).map((type) => {
            const goal = goalOf(person.id, type, thisWeek);
            return (
              <div key={type} className="mb-2 last:mb-0">
                <p className="text-[10px] uppercase tracking-wide text-muted/70">{type}</p>
                <SetCell
                  goal={goal}
                  canEdit={canEdit}
                  placeholder={`${type} goal…`}
                  onSet={(text) => onSet(type, text)}
                  onEdit={(text) => goal && onEdit(goal.id, text)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// An input that creates the goal if none exists, or edits it on blur.
function SetCell({
  goal,
  canEdit,
  placeholder,
  onSet,
  onEdit,
}: {
  goal?: WeeklyGoal;
  canEdit: boolean;
  placeholder: string;
  onSet: (text: string) => void;
  onEdit: (text: string) => void;
}) {
  const [text, setText] = useState(goal?.text ?? "");
  // resync local text if the underlying goal changes identity (e.g. week nav)
  const [seen, setSeen] = useState(goal?.id ?? "");
  if ((goal?.id ?? "") !== seen) {
    setSeen(goal?.id ?? "");
    setText(goal?.text ?? "");
  }

  if (!canEdit) {
    return (
      <p className="mt-0.5 text-sm leading-snug">
        {goal?.text || <span className="text-muted/60">—</span>}
      </p>
    );
  }

  const commit = () => {
    const v = text.trim();
    if (!v) return;
    if (!goal) onSet(v);
    else if (v !== goal.text) onEdit(v);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        commit();
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        placeholder={placeholder}
        className="mt-0.5 w-full bg-transparent text-sm leading-snug placeholder:text-muted/60 focus:outline-none"
      />
    </form>
  );
}

const GRADES: { id: GoalStatus; label: string; on: string }[] = [
  { id: "done", label: "Hit", on: "bg-accent text-white" },
  { id: "missed", label: "Missed", on: "bg-primary text-white" },
];

function GradeButtons({ value, onChange }: { value: GoalStatus; onChange: (s: GoalStatus) => void }) {
  return (
    <div className="inline-flex shrink-0 rounded-full border border-white/60 bg-white/40 p-0.5">
      {GRADES.map((g) => (
        <button
          key={g.id}
          onClick={() => onChange(g.id)}
          className={`rounded-full px-2.5 py-0.5 text-[11px] transition-colors ${
            value === g.id ? g.on : "text-muted hover:text-foreground"
          }`}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}

function GradeBadge({ value }: { value: GoalStatus }) {
  if (value === "on_track") return <span className="shrink-0 text-[11px] text-muted">not graded</span>;
  const g = GRADES.find((x) => x.id === value);
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${g?.on}`}>{g?.label}</span>;
}

// Recent weeks of consistency: one dot per week ending at `endWeek`.
function StreakStrip({
  person,
  goals,
  endWeek,
}: {
  person: Person;
  goals: WeeklyGoal[];
  endWeek: string;
}) {
  const dots = [];
  for (let i = STREAK_WEEKS - 1; i >= 0; i--) {
    const wk = addWeeks(endWeek, -i);
    const wkGoals = goals.filter((g) => g.weekOf === wk);
    const wkGraded = wkGoals.filter((g) => g.status !== "on_track");
    let cls = "bg-white/50"; // none
    let title = "no goals";
    if (wkGraded.length) {
      const missed = wkGraded.some((g) => g.status === "missed");
      cls = missed ? "bg-primary/70" : "bg-accent";
      title = missed ? "missed" : "hit";
    } else if (wkGoals.length) {
      cls = "bg-muted/40";
      title = "set, not graded";
    }
    dots.push(<span key={wk} title={`${wk}: ${title}`} className={`size-2 rounded-full ${cls}`} />);
  }
  return (
    <span
      className="hidden shrink-0 items-center gap-1 sm:flex"
      title={`${person.name} — last ${STREAK_WEEKS} weeks`}
    >
      {dots}
    </span>
  );
}

function Rollup({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass rounded-xl px-3.5 py-2 text-center">
      <p className={`font-serif text-xl tabular-nums leading-none ${accent ? "text-accent" : ""}`}>{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs transition-colors ${
        active ? "bg-foreground text-background" : "glass text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
