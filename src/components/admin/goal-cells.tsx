"use client";

import { useState } from "react";
import { addWeeks, type GoalStatus, type WeeklyGoal } from "@/lib/team";

// Shared weekly-goal UI used by both the team Pulse cockpit and the personal
// dashboard: set a goal, grade it Hit/Missed, and the consistency streak strip.

export const STREAK_WEEKS = 6;

export const GRADES: { id: GoalStatus; label: string; on: string }[] = [
  { id: "done", label: "Hit", on: "bg-accent text-white" },
  { id: "missed", label: "Missed", on: "bg-primary text-white" },
];

// An input that creates the goal if none exists, or edits it on blur.
export function SetCell({
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

export function GradeButtons({
  value,
  onChange,
}: {
  value: GoalStatus;
  onChange: (s: GoalStatus) => void;
}) {
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

export function GradeBadge({ value }: { value: GoalStatus }) {
  if (value === "on_track") return <span className="shrink-0 text-[11px] text-muted">not graded</span>;
  const g = GRADES.find((x) => x.id === value);
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${g?.on}`}>{g?.label}</span>;
}

// Recent weeks of consistency: one dot per week ending at `endWeek`.
export function StreakStrip({
  goals,
  endWeek,
  label,
}: {
  goals: WeeklyGoal[];
  endWeek: string;
  label?: string;
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
    <span className="flex shrink-0 items-center gap-1" title={label ?? `last ${STREAK_WEEKS} weeks`}>
      {dots}
    </span>
  );
}
