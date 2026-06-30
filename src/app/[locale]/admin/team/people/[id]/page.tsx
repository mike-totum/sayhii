"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTeam } from "@/lib/team-store";
import {
  GOAL_STATUSES,
  type GoalStatus,
  type GoalType,
  type TeamRole,
} from "@/lib/team";
import { PersonAvatar } from "@/components/admin/person-chip";

export default function PersonDetailPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const { data, me, updatePerson, addGoal, updateGoal, deleteGoal } = useTeam();

  const person = data.people.find((p) => p.id === id);
  if (!person) {
    return (
      <div>
        <Back locale={locale} />
        <p className="mt-6 text-muted">This person no longer exists.</p>
      </div>
    );
  }

  const isAdmin = !!me?.isAdmin;
  const isSelf = me?.personId === person.id;
  const canEdit = isAdmin || isSelf; // edit own profile + goals
  const goals = data.goals.filter((g) => g.personId === person.id);
  const cards = data.cards.filter((c) => c.assigneeId === person.id);

  return (
    <div className="max-w-2xl space-y-6">
      <Back locale={locale} />

      <header className="rounded-2xl glass p-5 space-y-4">
        <div className="flex items-center gap-4">
          <PersonAvatar person={person} size={52} />
          <div className="min-w-0 flex-1">
            <EditableText
              value={person.name}
              editable={canEdit}
              onChange={(v) => updatePerson(person.id, { name: v })}
              className="font-serif text-2xl tracking-tight"
            />
            <EditableText
              value={person.role}
              editable={canEdit}
              placeholder="Job title"
              onChange={(v) => updatePerson(person.id, { role: v })}
              className="text-sm text-muted"
            />
          </div>
          {person.accessRole === "admin" && (
            <span className="shrink-0 self-start rounded-full bg-foreground px-2 py-0.5 text-[10px] uppercase tracking-wide text-background">
              Admin
            </span>
          )}
          {!person.active && (
            <span className="shrink-0 self-start rounded-full bg-white/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
              Deactivated
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-white/50 pt-4">
          <Labeled label="Email">
            {isAdmin ? (
              <Field value={person.email} onChange={(v) => updatePerson(person.id, { email: v.toLowerCase() })} />
            ) : (
              <p className="text-sm">{person.email || "—"}</p>
            )}
          </Labeled>
          <Labeled label="Department">
            {isAdmin ? (
              <select
                value={person.departmentId}
                onChange={(e) => updatePerson(person.id, { departmentId: e.target.value })}
                className="h-8 w-full rounded-lg border border-white/60 bg-white/60 px-2 text-sm focus:outline-none"
              >
                <option value="">Unassigned</option>
                {data.departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm">
                {data.departments.find((d) => d.id === person.departmentId)?.name ?? "Unassigned"}
              </p>
            )}
          </Labeled>

          {/* Admin-only: role + lifecycle */}
          {isAdmin && (
            <>
              <Labeled label="Access role">
                <select
                  value={person.accessRole}
                  onChange={(e) => updatePerson(person.id, { accessRole: e.target.value as TeamRole })}
                  className="h-8 w-full rounded-lg border border-white/60 bg-white/60 px-2 text-sm focus:outline-none"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </Labeled>
              <Labeled label="Status">
                <button
                  onClick={() => updatePerson(person.id, { active: !person.active })}
                  className="h-8 w-full rounded-lg border border-white/60 bg-white/60 px-2 text-sm hover:text-foreground"
                >
                  {person.active ? "Deactivate" : "Reactivate"}
                </button>
              </Labeled>
            </>
          )}
        </div>
      </header>

      {/* Goals */}
      <section className="rounded-2xl glass p-5">
        <h2 className="text-sm font-medium mb-3">Weekly goals</h2>
        <ul className="space-y-2">
          {goals.map((g) => (
            <li key={g.id} className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted w-20 shrink-0">
                {g.type}
              </span>
              {canEdit ? (
                <Field value={g.text} onChange={(v) => updateGoal(g.id, { text: v })} className="flex-1 text-sm" />
              ) : (
                <span className={`flex-1 text-sm ${g.status === "done" ? "line-through text-muted" : ""}`}>{g.text}</span>
              )}
              {canEdit ? (
                <select
                  value={g.status}
                  onChange={(e) => updateGoal(g.id, { status: e.target.value as GoalStatus })}
                  className="h-8 rounded-lg border border-white/60 bg-white/60 px-2 text-xs focus:outline-none"
                >
                  {GOAL_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-muted">{GOAL_STATUSES.find((s) => s.id === g.status)?.label}</span>
              )}
              {canEdit && (
                <button onClick={() => deleteGoal(g.id)} className="text-muted hover:text-primary text-sm px-1" aria-label="Delete goal">×</button>
              )}
            </li>
          ))}
          {goals.length === 0 && <li className="text-sm text-muted">No goals yet.</li>}
        </ul>
        {canEdit && (
          <AddGoal onAdd={(type, text) => addGoal({ personId: person.id, type, text, status: "on_track" })} />
        )}
      </section>

      {/* Assigned work */}
      <section className="rounded-2xl glass p-5">
        <h2 className="text-sm font-medium mb-3">Assigned work ({cards.length})</h2>
        <ul className="space-y-1.5">
          {cards.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
              <Link href={`/${locale}/admin/team/work`} className="hover:text-primary truncate">
                {c.title}
              </Link>
              <span className="text-xs text-muted shrink-0">{c.column.replace("_", " ")}</span>
            </li>
          ))}
          {cards.length === 0 && <li className="text-sm text-muted">Nothing assigned.</li>}
        </ul>
      </section>
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
        className="h-9 rounded-lg border border-white/60 bg-white/60 px-2 text-sm focus:outline-none">
        <option value="professional">Professional</option>
        <option value="personal">Personal</option>
      </select>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a goal…"
        className="flex-1 h-9 rounded-lg border border-white/60 bg-white/60 px-3 text-sm focus:border-foreground/40 focus:outline-none" />
      <button className="h-9 rounded-lg border border-white/60 px-3 text-sm font-medium hover:bg-white/40">Add</button>
    </form>
  );
}

function EditableText({
  value,
  editable,
  onChange,
  className = "",
  placeholder,
}: {
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  if (!editable) return <p className={className}>{value || placeholder || "—"}</p>;
  return <Field value={value} onChange={onChange} placeholder={placeholder} className={className} />;
}

function Field({
  value,
  onChange,
  className = "",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-transparent border-b border-transparent hover:border-white/60 focus:border-foreground/40 focus:outline-none ${className}`}
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
