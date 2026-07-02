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
import { SetCell, GradeButtons, GradeBadge, StreakStrip } from "@/components/admin/goal-cells";

// PULSE — the Monday meeting cockpit. Amy walks the team top-to-bottom: grade
// last week's two goals (Hit/Missed), set this week's two. Goals are stamped
// with their week, so history + streaks accrue automatically.

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Weekly pulse</h1>
          <p className="mt-1 text-sm text-muted">{isCurrent ? today : "Reviewing history"}</p>
        </div>
        <div className="flex items-center gap-3">
          <Rollup label="Set this week" value={`${setThisWeek}/${people.length}`} />
          <Rollup label="Hit last week" value={hitRate === null ? "—" : `${hitRate}%`} accent />
          {me?.isAdmin && (
            <Link
              href={`/${locale}/admin/team/pulse/meeting`}
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-primary transition-colors"
            >
              ▶ Run Monday
            </Link>
          )}
        </div>
      </div>

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
        <div className="hidden sm:block">
          <StreakStrip goals={goals} endWeek={lastWeek} label={`${person.name} — last 6 weeks`} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-foreground/[0.035] p-3">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted">
            <span className="size-1.5 rounded-full bg-muted/50" aria-hidden />
            Last week · {weekLabel(lastWeek).replace("Week of ", "")}
          </p>
          {(["professional", "personal"] as GoalType[]).map((type) => {
            const goal = goalOf(person.id, type, lastWeek);
            return (
              <div key={type} className="mb-2 last:mb-0">
                <p className="text-[10px] uppercase tracking-wide text-muted/70">{type}</p>
                {goal ? (
                  <div className="mt-0.5 flex items-start gap-2">
                    <p className={`relative flex-1 text-[15px] leading-snug ${goal.status === "done" ? "text-muted" : ""}`}>
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

        <div className="rounded-xl glass p-3 ring-1 ring-primary/25">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            This week · {weekLabel(thisWeek).replace("Week of ", "")}
          </p>
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
