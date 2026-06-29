"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTeam } from "@/lib/team-store";
import { GOAL_STATUSES, type GoalStatus, type GoalType } from "@/lib/team";

export default function PersonDetailPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const router = useRouter();
  const { data, updatePerson, deletePerson, addGoal, updateGoal, deleteGoal } = useTeam();

  const person = data.people.find((p) => p.id === id);
  if (!person) {
    return (
      <div>
        <Back locale={locale} />
        <p className="mt-6 text-muted">This person no longer exists.</p>
      </div>
    );
  }

  const goals = data.goals.filter((g) => g.personId === person.id);
  const cards = data.cards.filter((c) => c.assigneeId === person.id);

  return (
    <div className="max-w-2xl space-y-6">
      <Back locale={locale} />

      <header className="rounded-md border border-border bg-surface p-5 space-y-3">
        <Field
          value={person.name}
          onChange={(v) => updatePerson(person.id, { name: v })}
          className="font-serif text-2xl tracking-tight"
        />
        <div className="grid grid-cols-2 gap-3">
          <Labeled label="Role">
            <Field value={person.role} onChange={(v) => updatePerson(person.id, { role: v })} />
          </Labeled>
          <Labeled label="Email">
            <Field value={person.email} onChange={(v) => updatePerson(person.id, { email: v })} />
          </Labeled>
          <Labeled label="Department">
            <select
              value={person.departmentId}
              onChange={(e) => updatePerson(person.id, { departmentId: e.target.value })}
              className="h-8 w-full rounded-[4px] border border-border bg-background px-2 text-sm focus:border-foreground/40 focus:outline-none"
            >
              {data.departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </Labeled>
        </div>
      </header>

      {/* Goals */}
      <section className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-sm font-medium mb-3">Weekly goals</h2>
        <ul className="space-y-2">
          {goals.map((g) => (
            <li key={g.id} className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted w-20 shrink-0">
                {g.type}
              </span>
              <Field
                value={g.text}
                onChange={(v) => updateGoal(g.id, { text: v })}
                className="flex-1 text-sm"
              />
              <select
                value={g.status}
                onChange={(e) => updateGoal(g.id, { status: e.target.value as GoalStatus })}
                className="h-8 rounded-[4px] border border-border bg-background px-2 text-xs focus:outline-none"
              >
                {GOAL_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <button onClick={() => deleteGoal(g.id)} className="text-muted hover:text-primary text-sm px-1" aria-label="Delete goal">×</button>
            </li>
          ))}
          {goals.length === 0 && <li className="text-sm text-muted">No goals yet.</li>}
        </ul>
        <AddGoal onAdd={(type, text) => addGoal({ personId: person.id, type, text, status: "on_track" })} />
      </section>

      {/* Assigned work */}
      <section className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-sm font-medium mb-3">Assigned work ({cards.length})</h2>
        <ul className="space-y-1.5">
          {cards.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
              <Link href={`/${locale}/admin/team/boards?dept=${c.departmentId}`} className="hover:text-primary truncate">
                {c.title}
              </Link>
              <span className="text-xs text-muted shrink-0">{c.column.replace("_", " ")}</span>
            </li>
          ))}
          {cards.length === 0 && <li className="text-sm text-muted">Nothing assigned.</li>}
        </ul>
      </section>

      <button
        onClick={() => {
          deletePerson(person.id);
          router.push(`/${locale}/admin/team/people`);
        }}
        className="text-sm text-primary hover:underline"
      >
        Remove {person.name}
      </button>
    </div>
  );
}

function AddGoal({ onAdd }: { onAdd: (type: GoalType, text: string) => void }) {
  const [type, setType] = useState<GoalType>("professional");
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) {
          onAdd(type, text.trim());
          setText("");
        }
      }}
      className="mt-3 flex gap-2"
    >
      <select value={type} onChange={(e) => setType(e.target.value as GoalType)}
        className="h-9 rounded-[4px] border border-border bg-background px-2 text-sm focus:outline-none">
        <option value="professional">Professional</option>
        <option value="personal">Personal</option>
      </select>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a goal…"
        className="flex-1 h-9 rounded-[4px] border border-border bg-background px-3 text-sm focus:border-foreground/40 focus:outline-none" />
      <button className="h-9 rounded-[4px] border border-border px-3 text-sm font-medium hover:bg-background">Add</button>
    </form>
  );
}

function Field({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-transparent border-b border-transparent hover:border-border focus:border-foreground/40 focus:outline-none ${className}`}
    />
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted mb-0.5">{label}</p>
      {children}
    </div>
  );
}

function Back({ locale }: { locale: string }) {
  return (
    <Link href={`/${locale}/admin/team/people`} className="text-sm text-muted hover:text-foreground transition-colors">
      ← People
    </Link>
  );
}
