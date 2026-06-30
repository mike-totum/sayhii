"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTeam } from "@/lib/team-store";
import {
  CURRENT_WEEK_LABEL,
  type GoalStatus,
  type GoalType,
  type Person,
  type WeeklyGoal,
} from "@/lib/team";
import { PersonAvatar } from "@/components/admin/person-chip";

// PULSE — the sayhii layer. Everyone's weekly personal + professional intention,
// a manager rollup in the header, and a little recognition when a goal lands.

export default function PulsePage() {
  const { locale } = useParams<{ locale: string }>();
  const { data, me, addGoal, updateGoal, deleteGoal } = useTeam();
  const [dept, setDept] = useState("");
  const [recognized, setRecognized] = useState<Record<string, number>>({});
  const [burstId, setBurstId] = useState<string | null>(null);

  const people = data.people.filter(
    (p) => p.active && (dept ? p.departmentId === dept : true),
  );
  const peopleIds = useMemo(() => new Set(people.map((p) => p.id)), [people]);
  const goals = data.goals.filter((g) => peopleIds.has(g.personId));

  const done = goals.filter((g) => g.status === "done").length;
  const onTrack = goals.filter((g) => g.status === "on_track").length;
  const missed = goals.filter((g) => g.status === "missed").length;
  const health = goals.length ? Math.round(((done + onTrack) / goals.length) * 100) : null;

  function setStatus(goal: WeeklyGoal, status: GoalStatus) {
    if (status === "done" && goal.status !== "done") {
      setRecognized((r) => ({ ...r, [goal.personId]: (r[goal.personId] ?? 0) + 1 }));
      setBurstId(goal.id);
      setTimeout(() => setBurstId((id) => (id === goal.id ? null : id)), 1100);
    }
    updateGoal(goal.id, { status });
  }

  return (
    <div>
      {/* header + rollup */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">This week</h1>
          <p className="mt-1 text-sm text-muted">{CURRENT_WEEK_LABEL}</p>
        </div>
        <div className="flex items-center gap-3">
          <Rollup label="People" value={`${people.length}`} />
          <Rollup label="On track" value={health === null ? "—" : `${health}%`} accent />
          <Rollup label="Done" value={`${done}`} />
          {missed > 0 && <Rollup label="Missed" value={`${missed}`} warn />}
        </div>
      </div>

      {/* department chips */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        <Chip active={dept === ""} onClick={() => setDept("")}>
          All
        </Chip>
        {data.departments.map((d) => (
          <Chip key={d.id} active={dept === d.id} onClick={() => setDept(d.id)}>
            {d.name}
          </Chip>
        ))}
      </div>

      {/* pulse grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {people.map((person) => (
          <PersonPulse
            key={person.id}
            locale={locale}
            person={person}
            goals={data.goals.filter((g) => g.personId === person.id)}
            recognized={recognized[person.id] ?? 0}
            burstId={burstId}
            canEdit={!!me?.isAdmin || me?.personId === person.id}
            onStatus={setStatus}
            onAdd={(type, text) => addGoal({ personId: person.id, type, text, status: "on_track" })}
            onDelete={deleteGoal}
          />
        ))}
        {people.length === 0 && (
          <p className="py-12 text-center text-sm text-muted sm:col-span-2 xl:col-span-3">
            No one in this department yet.
          </p>
        )}
      </div>
    </div>
  );
}

function PersonPulse({
  locale,
  person,
  goals,
  recognized,
  burstId,
  canEdit,
  onStatus,
  onAdd,
  onDelete,
}: {
  locale: string;
  person: Person;
  goals: WeeklyGoal[];
  recognized: number;
  burstId: string | null;
  canEdit: boolean;
  onStatus: (goal: WeeklyGoal, status: GoalStatus) => void;
  onAdd: (type: GoalType, text: string) => void;
  onDelete: (id: string) => void;
}) {
  const professional = goals.find((g) => g.type === "professional");
  const personal = goals.find((g) => g.type === "personal");

  return (
    <div className="glass glass-hover rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <PersonAvatar person={person} size={36} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/${locale}/admin/team/people/${person.id}`}
            className="block truncate text-sm font-semibold hover:text-primary"
          >
            {person.name}
          </Link>
          <p className="truncate text-xs text-muted">{person.role || "—"}</p>
        </div>
        {recognized > 0 && (
          <span
            className="rounded-full bg-warm/80 px-2 py-0.5 text-[11px] font-medium text-foreground"
            title={`${recognized} recognized this week`}
          >
            ✨ {recognized}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <GoalRow
          type="professional"
          goal={professional}
          burstId={burstId}
          canEdit={canEdit}
          onStatus={onStatus}
          onAdd={(text) => onAdd("professional", text)}
          onDelete={onDelete}
        />
        <GoalRow
          type="personal"
          goal={personal}
          burstId={burstId}
          canEdit={canEdit}
          onStatus={onStatus}
          onAdd={(text) => onAdd("personal", text)}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

function GoalRow({
  type,
  goal,
  burstId,
  canEdit,
  onStatus,
  onAdd,
  onDelete,
}: {
  type: GoalType;
  goal?: WeeklyGoal;
  burstId: string | null;
  canEdit: boolean;
  onStatus: (goal: WeeklyGoal, status: GoalStatus) => void;
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
}) {
  const [text, setText] = useState("");

  return (
    <div className="glass-well rounded-xl px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{type}</p>
      {goal ? (
        <div className="group mt-1 flex items-start gap-2">
          <p
            className={`relative flex-1 text-sm leading-snug ${
              goal.status === "done" ? "text-muted line-through" : ""
            }`}
          >
            {goal.text}
            {burstId === goal.id && (
              <span className="animate-recognize pointer-events-none absolute -top-3 left-0 text-base">
                ✨🎉
              </span>
            )}
          </p>
          {canEdit && (
            <button
              onClick={() => onDelete(goal.id)}
              className="text-muted opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
              aria-label="Delete goal"
            >
              ×
            </button>
          )}
        </div>
      ) : canEdit ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) {
              onAdd(text.trim());
              setText("");
            }
          }}
          className="mt-1"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`+ add a ${type} goal`}
            className="w-full bg-transparent text-sm placeholder:text-muted/70 focus:outline-none"
          />
        </form>
      ) : (
        <p className="mt-1 text-sm text-muted/70">No goal set yet.</p>
      )}

      {goal && (
        <div className="mt-2">
          {canEdit ? (
            <StatusToggle value={goal.status} onChange={(s) => onStatus(goal, s)} />
          ) : (
            <StatusBadge value={goal.status} />
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ value }: { value: GoalStatus }) {
  const seg = STATUS_SEGMENTS.find((s) => s.id === value);
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] ${seg?.tone}`}>
      {seg?.label}
    </span>
  );
}

const STATUS_SEGMENTS: { id: GoalStatus; label: string; tone: string }[] = [
  { id: "on_track", label: "On track", tone: "bg-foreground text-background" },
  { id: "done", label: "Done", tone: "bg-accent text-white" },
  { id: "missed", label: "Missed", tone: "bg-primary text-white" },
];

function StatusToggle({
  value,
  onChange,
}: {
  value: GoalStatus;
  onChange: (s: GoalStatus) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/60 bg-white/40 p-0.5">
      {STATUS_SEGMENTS.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`rounded-full px-2.5 py-0.5 text-[11px] transition-colors ${
            value === s.id ? s.tone : "text-muted hover:text-foreground"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function Rollup({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="glass rounded-xl px-3.5 py-2 text-center">
      <p
        className={`font-serif text-xl tabular-nums leading-none ${
          accent ? "text-accent" : warn ? "text-primary" : ""
        }`}
      >
        {value}
      </p>
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
        active
          ? "bg-foreground text-background"
          : "glass text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
