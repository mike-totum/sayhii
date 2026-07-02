"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTeam } from "@/lib/team-store";
import {
  addWeeks,
  currentWeekMonday,
  weekLabel,
  deptName,
  type GoalStatus,
  type GoalType,
  type Person,
  type WeeklyGoal,
} from "@/lib/team";
import { PersonAvatar } from "@/components/admin/person-chip";

// MEETING MODE — runs Amy's Monday ritual, one person at a time:
// grade last week's two goals, capture this week's two, next person.
// Ends on a summary: the notebook page, already written.

const TYPES: GoalType[] = ["professional", "personal"];

export default function MondayMeetingPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const { data, me, addGoal, updateGoal } = useTeam();

  const thisWeek = currentWeekMonday();
  const lastWeek = addWeeks(thisWeek, -1);

  const people = useMemo(() => data.people.filter((p) => p.active), [data.people]);
  const [idx, setIdx] = useState(0);
  const [burstId, setBurstId] = useState<string | null>(null);

  const isAdmin = !!me?.isAdmin;

  // Keyboard: ← → move between people when not typing.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight") setIdx((i) => Math.min(people.length, i + 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [people.length]);

  if (!isAdmin) {
    return (
      <div className="rounded-2xl glass px-6 py-12 text-center">
        <h1 className="font-serif text-2xl tracking-tight">Admins run the meeting</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Meeting mode grades and sets goals for the whole team, so it&apos;s admin-only.
          You can grade and set your own on{" "}
          <Link href={`/${locale}/admin/team/pulse`} className="text-foreground underline">
            Pulse
          </Link>
          .
        </p>
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <div className="rounded-2xl glass px-6 py-12 text-center">
        <h1 className="font-serif text-2xl tracking-tight">No one on the roster yet</h1>
        <p className="mt-2 text-sm text-muted">Add your team on Manage first.</p>
      </div>
    );
  }

  const goalOf = (personId: string, type: GoalType, week: string) =>
    data.goals.find((g) => g.personId === personId && g.type === type && g.weekOf === week);

  function grade(goal: WeeklyGoal, status: GoalStatus) {
    if (status === "done" && goal.status !== "done") {
      setBurstId(goal.id);
      setTimeout(() => setBurstId((id) => (id === goal.id ? null : id)), 1100);
    }
    updateGoal(goal.id, { status });
  }

  const done = idx >= people.length;

  return (
    <div className="mx-auto max-w-2xl">
      {/* meeting header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            Monday meeting · {weekLabel(thisWeek)}
          </p>
          <h1 className="mt-1 font-serif text-2xl tracking-tight">
            {done ? "This week, written down" : "Weekly pulse — live"}
          </h1>
        </div>
        <Link
          href={`/${locale}/admin/team/pulse`}
          className="shrink-0 text-xs text-muted hover:text-foreground transition-colors"
        >
          Exit ✕
        </Link>
      </div>

      {/* progress dots */}
      <div className="mt-4 flex items-center gap-1.5">
        {people.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setIdx(i)}
            title={p.name}
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? "w-6 bg-primary" : i < idx ? "w-3 bg-foreground/50" : "w-3 bg-foreground/15"
            }`}
            aria-label={`Go to ${p.name}`}
          />
        ))}
        <button
          onClick={() => setIdx(people.length)}
          title="Summary"
          className={`h-1.5 rounded-full transition-all ${
            done ? "w-6 bg-accent" : "w-3 bg-foreground/15"
          }`}
          aria-label="Go to summary"
        />
      </div>

      {done ? (
        <Summary
          people={people}
          goalOf={goalOf}
          thisWeek={thisWeek}
          lastWeek={lastWeek}
          onRevisit={(i) => setIdx(i)}
          onDone={() => router.push(`/${locale}/admin/team/pulse`)}
        />
      ) : (
        <PersonStep
          key={people[idx].id}
          person={people[idx]}
          position={`${idx + 1} of ${people.length}`}
          departments={data.departments}
          lastWeek={lastWeek}
          thisWeek={thisWeek}
          goalOf={goalOf}
          burstId={burstId}
          onGrade={grade}
          onSet={(type, text) =>
            addGoal({ personId: people[idx].id, type, text, status: "on_track", weekOf: thisWeek })
          }
          onEdit={(id, text) => updateGoal(id, { text })}
          onBack={idx > 0 ? () => setIdx(idx - 1) : undefined}
          nextLabel={idx + 1 < people.length ? `Next: ${people[idx + 1].name.split(" ")[0]}` : "Finish"}
          onNext={() => setIdx(idx + 1)}
        />
      )}
    </div>
  );
}

function PersonStep({
  person,
  position,
  departments,
  lastWeek,
  thisWeek,
  goalOf,
  burstId,
  onGrade,
  onSet,
  onEdit,
  onBack,
  nextLabel,
  onNext,
}: {
  person: Person;
  position: string;
  departments: { id: string; name: string }[];
  lastWeek: string;
  thisWeek: string;
  goalOf: (personId: string, type: GoalType, week: string) => WeeklyGoal | undefined;
  burstId: string | null;
  onGrade: (goal: WeeklyGoal, status: GoalStatus) => void;
  onSet: (type: GoalType, text: string) => void;
  onEdit: (id: string, text: string) => void;
  onBack?: () => void;
  nextLabel: string;
  onNext: () => void;
}) {
  return (
    <div className="mt-5 rounded-2xl glass p-6">
      {/* person header */}
      <div className="flex items-center gap-3">
        <PersonAvatar person={person} size={44} />
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-xl tracking-tight">{person.name}</h2>
          <p className="text-xs text-muted">
            {person.role || "—"}
            {person.departmentId ? ` · ${deptName(departments, person.departmentId)}` : ""}
          </p>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted">{position}</span>
      </div>

      {/* last week — grade it */}
      <div className="mt-5 rounded-xl border border-border/70 bg-foreground/[0.035] p-4">
        <p className="mb-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted">
          <span className="size-1.5 rounded-full bg-muted/50" aria-hidden />
          Last week · did they hit it?
        </p>
        {TYPES.map((type) => {
          const goal = goalOf(person.id, type, lastWeek);
          return (
            <div key={type} className="mb-3 last:mb-0">
              <p className="text-[10px] uppercase tracking-wide text-muted/70">{type}</p>
              {goal ? (
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <p className="relative min-w-0 flex-1 text-[15px] leading-snug">
                    {goal.text}
                    {burstId === goal.id && (
                      <span className="animate-recognize pointer-events-none absolute -top-3 left-0 text-base">
                        ✨🎉
                      </span>
                    )}
                  </p>
                  <BigGrade value={goal.status} onChange={(s) => onGrade(goal, s)} />
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted/60">No goal was set.</p>
              )}
            </div>
          );
        })}
      </div>

      {/* this week — capture it */}
      <div className="mt-3 rounded-xl glass p-4 ring-1 ring-primary/25">
        <p className="mb-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-primary">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          This week · {weekLabel(thisWeek).replace("Week of ", "")}
        </p>
        {TYPES.map((type) => (
          <WeekInput
            key={type}
            type={type}
            goal={goalOf(person.id, type, thisWeek)}
            onSet={(text) => onSet(type, text)}
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* nav */}
      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={!onBack}
          className="text-sm text-muted hover:text-foreground transition-colors disabled:opacity-0"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-primary transition-colors"
        >
          {nextLabel} →
        </button>
      </div>
    </div>
  );
}

// Bigger meeting-scale Hit/Missed toggle (Pulse's inline one is compact).
function BigGrade({
  value,
  onChange,
}: {
  value: GoalStatus;
  onChange: (s: GoalStatus) => void;
}) {
  return (
    <span className="inline-flex shrink-0 rounded-full border border-white/60 bg-white/40 p-0.5">
      <button
        onClick={() => onChange("done")}
        className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
          value === "done" ? "bg-accent text-white" : "text-muted hover:text-foreground"
        }`}
      >
        ✓ Hit
      </button>
      <button
        onClick={() => onChange("missed")}
        className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
          value === "missed" ? "bg-foreground text-background" : "text-muted hover:text-foreground"
        }`}
      >
        ✗ Missed
      </button>
    </span>
  );
}

// Controlled input that commits on blur: creates the goal if new, edits if
// the text changed. Pre-filled when the person set their goal beforehand.
function WeekInput({
  type,
  goal,
  onSet,
  onEdit,
}: {
  type: GoalType;
  goal: WeeklyGoal | undefined;
  onSet: (text: string) => void;
  onEdit: (id: string, text: string) => void;
}) {
  const [text, setText] = useState(goal?.text ?? "");
  const [seen, setSeen] = useState(goal?.id ?? "");
  if ((goal?.id ?? "") !== seen) {
    setSeen(goal?.id ?? "");
    setText(goal?.text ?? "");
  }

  const commit = () => {
    const v = text.trim();
    if (!v) return;
    if (!goal) onSet(v);
    else if (v !== goal.text) onEdit(goal.id, v);
  };

  return (
    <div className="mb-3 last:mb-0">
      <p className="text-[10px] uppercase tracking-wide text-muted/70">{type}</p>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        placeholder={`What's their ${type} goal this week?`}
        className="mt-1 w-full rounded-lg border border-white/60 bg-white/60 px-3 py-2 text-[15px] leading-snug placeholder:text-muted/50 focus:border-foreground/40 focus:outline-none"
      />
    </div>
  );
}

function Summary({
  people,
  goalOf,
  thisWeek,
  lastWeek,
  onRevisit,
  onDone,
}: {
  people: Person[];
  goalOf: (personId: string, type: GoalType, week: string) => WeeklyGoal | undefined;
  thisWeek: string;
  lastWeek: string;
  onRevisit: (i: number) => void;
  onDone: () => void;
}) {
  const lastGoals = people.flatMap((p) =>
    TYPES.map((t) => goalOf(p.id, t, lastWeek)).filter((g): g is WeeklyGoal => !!g),
  );
  const graded = lastGoals.filter((g) => g.status !== "on_track");
  const hits = graded.filter((g) => g.status === "done").length;
  const hitRate = graded.length ? Math.round((hits / graded.length) * 100) : null;
  const setCount = people.filter((p) =>
    TYPES.some((t) => goalOf(p.id, t, thisWeek)),
  ).length;

  return (
    <div className="mt-5 space-y-4">
      {/* rollup */}
      <div className="flex items-center gap-3">
        <div className="rounded-2xl glass px-5 py-3 text-center">
          <p className="font-serif text-2xl tabular-nums">{setCount}/{people.length}</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">set this week</p>
        </div>
        <div className="rounded-2xl glass px-5 py-3 text-center">
          <p className="font-serif text-2xl tabular-nums text-accent">
            {hitRate === null ? "—" : `${hitRate}%`}
          </p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">hit last week</p>
        </div>
      </div>

      {/* the notebook page */}
      <div className="rounded-2xl glass divide-y divide-white/50 overflow-hidden">
        {people.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onRevisit(i)}
            className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-white/50 transition-colors"
          >
            <PersonAvatar person={p} size={32} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{p.name}</p>
                <span className="text-xs text-muted">
                  {TYPES.map((t) => {
                    const g = goalOf(p.id, t, lastWeek);
                    return g ? (g.status === "done" ? "✓" : g.status === "missed" ? "✗" : "·") : "—";
                  }).join(" ")}
                  <span className="ml-1 text-muted/60">last wk</span>
                </span>
              </div>
              {TYPES.map((t) => {
                const g = goalOf(p.id, t, thisWeek);
                return (
                  <p key={t} className="mt-0.5 truncate text-sm">
                    <span className="text-[10px] uppercase tracking-wide text-muted/70 mr-1.5">
                      {t.slice(0, 4)}
                    </span>
                    {g ? (
                      <span className="text-foreground">{g.text}</span>
                    ) : (
                      <span className="text-muted/50">not set</span>
                    )}
                  </p>
                );
              })}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onDone}
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-primary transition-colors"
        >
          Done — back to Pulse
        </button>
      </div>
    </div>
  );
}
