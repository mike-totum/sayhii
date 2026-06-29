"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTeam } from "@/lib/team-store";
import {
  CURRENT_WEEK_LABEL,
  GOAL_STATUSES,
  type GoalStatus,
  type GoalType,
} from "@/lib/team";
import { DeptFilter } from "@/components/admin/dept-filter";

export default function TeamGoalsPage() {
  return (
    <Suspense>
      <GoalsInner />
    </Suspense>
  );
}

function GoalsInner() {
  const { locale } = useParams<{ locale: string }>();
  const dept = useSearchParams().get("dept") ?? "";
  const { data, addGoal, updateGoal, deleteGoal } = useTeam();
  const [adding, setAdding] = useState(false);

  const people = data.people.filter((p) => (dept ? p.departmentId === dept : true));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl tracking-tight">Weekly goals</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">{CURRENT_WEEK_LABEL}</span>
          <DeptFilter value={dept} departments={data.departments} />
          <button
            onClick={() => setAdding((v) => !v)}
            className="text-xs font-medium rounded-[4px] bg-foreground text-background px-3 py-1.5 hover:bg-primary transition-colors"
          >
            + Goal
          </button>
        </div>
      </div>

      {adding && (
        <AddGoal
          people={data.people}
          onAdd={(personId, type, text) => {
            addGoal({ personId, type, text, status: "on_track" });
            setAdding(false);
          }}
        />
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {people.map((person) => {
          const goals = data.goals.filter((g) => g.personId === person.id);
          return (
            <div key={person.id} className="rounded-md border border-border bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/${locale}/admin/team/people/${person.id}`}
                  className="text-sm font-medium hover:text-primary"
                >
                  {person.name}
                </Link>
                <span className="text-xs text-muted">{person.role}</span>
              </div>
              <ul className="mt-3 space-y-2">
                {goals.map((g) => (
                  <li key={g.id} className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-muted w-16 shrink-0">
                      {g.type}
                    </span>
                    <span className={`flex-1 text-sm ${g.status === "done" ? "line-through text-muted" : ""}`}>
                      {g.text}
                    </span>
                    <select
                      value={g.status}
                      onChange={(e) => updateGoal(g.id, { status: e.target.value as GoalStatus })}
                      className="h-7 rounded-[4px] border border-border bg-background px-1.5 text-xs focus:outline-none"
                    >
                      {GOAL_STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                    <button onClick={() => deleteGoal(g.id)} className="text-muted hover:text-primary px-1" aria-label="Delete">×</button>
                  </li>
                ))}
                {goals.length === 0 && <li className="text-xs text-muted">No goals set.</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddGoal({
  people,
  onAdd,
}: {
  people: { id: string; name: string }[];
  onAdd: (personId: string, type: GoalType, text: string) => void;
}) {
  const [personId, setPersonId] = useState(people[0]?.id ?? "");
  const [type, setType] = useState<GoalType>("professional");
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (personId && text.trim()) onAdd(personId, type, text.trim());
      }}
      className="mt-4 flex flex-wrap gap-2 rounded-md border border-border bg-surface p-3"
    >
      <select value={personId} onChange={(e) => setPersonId(e.target.value)}
        className="h-9 rounded-[4px] border border-border bg-background px-2 text-sm focus:outline-none">
        {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <select value={type} onChange={(e) => setType(e.target.value as GoalType)}
        className="h-9 rounded-[4px] border border-border bg-background px-2 text-sm focus:outline-none">
        <option value="professional">Professional</option>
        <option value="personal">Personal</option>
      </select>
      <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Goal…"
        className="flex-1 min-w-40 h-9 rounded-[4px] border border-border bg-background px-3 text-sm focus:border-foreground/40 focus:outline-none" />
      <button className="h-9 rounded-[4px] bg-foreground text-background px-4 text-sm font-medium">Add</button>
    </form>
  );
}
