"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTeam } from "@/lib/team-store";
import {
  addWeeks,
  currentWeekMonday,
  weekLabel,
  deptName,
  WORK_COLUMNS,
  CARD_PRIORITIES,
  type GoalStatus,
  type GoalType,
  type WeeklyGoal,
  type WorkCard,
} from "@/lib/team";
import { PersonAvatar } from "@/components/admin/person-chip";
import { SetCell, GradeButtons, StreakStrip } from "@/components/admin/goal-cells";
import { CardDetail } from "@/components/admin/card-detail";

// DASHBOARD — each person's home. Ties their weekly goals to the work assigned
// to them. Scoped to the signed-in user (me.personId).

export default function DashboardPage() {
  const { locale } = useParams<{ locale: string }>();
  const { data, me, addGoal, updateGoal, updatePerson } = useTeam();
  const [burstId, setBurstId] = useState<string | null>(null);
  const [openCard, setOpenCard] = useState<string | null>(null);

  const meId = me?.personId ?? null;
  const person = meId ? data.people.find((p) => p.id === meId) : undefined;

  if (!person) {
    return (
      <div className="rounded-2xl glass px-6 py-12 text-center">
        <h1 className="font-serif text-2xl tracking-tight">No profile yet</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          You&apos;re signed in as {me?.email ?? "your account"} but don&apos;t have a person
          record yet.{" "}
          {me?.isAdmin ? (
            <Link href={`/${locale}/admin/team/people`} className="text-foreground underline">
              Add yourself on Manage
            </Link>
          ) : (
            "Ask an admin to add you."
          )}
        </p>
      </div>
    );
  }

  const thisWeek = currentWeekMonday();
  const lastWeek = addWeeks(thisWeek, -1);
  const myGoals = data.goals.filter((g) => g.personId === person.id);
  const goalOf = (type: GoalType, week: string) =>
    myGoals.find((g) => g.type === type && g.weekOf === week);

  const myCards = data.cards.filter((c) => c.ownerIds.includes(person.id));
  const openCount = myCards.filter((c) => c.column !== "done").length;
  const myEpics = data.initiatives.filter((i) => i.ownerId === person.id);

  function grade(goal: WeeklyGoal, status: GoalStatus) {
    if (status === "done" && goal.status !== "done") {
      setBurstId(goal.id);
      setTimeout(() => setBurstId((id) => (id === goal.id ? null : id)), 1100);
    }
    updateGoal(goal.id, { status });
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = person.name.split(" ")[0];

  // The collective result, delivered to the person (mirrors Pulse's rollup).
  const activePeople = data.people.filter((p) => p.active);
  const teamSet = activePeople.filter((p) =>
    data.goals.some((g) => g.personId === p.id && g.weekOf === thisWeek),
  ).length;
  const teamLastWeek = data.goals.filter(
    (g) => g.weekOf === lastWeek && activePeople.some((p) => p.id === g.personId),
  );
  const teamGraded = teamLastWeek.filter((g) => g.status !== "on_track");
  const teamHits = teamGraded.filter((g) => g.status === "done").length;
  const teamHitRate = teamGraded.length
    ? Math.round((teamHits / teamGraded.length) * 100)
    : null;

  return (
    <div className="space-y-5">
      {/* profile header */}
      <header className="glass rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <PersonAvatar person={person} size={56} />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">{greeting}, {firstName}</p>
            <input
              value={person.name}
              onChange={(e) => updatePerson(person.id, { name: e.target.value })}
              className="w-full bg-transparent font-serif text-2xl tracking-tight border-b border-transparent hover:border-white/60 focus:border-foreground/40 focus:outline-none"
            />
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
              <input
                value={person.role}
                placeholder="Add your title"
                onChange={(e) => updatePerson(person.id, { role: e.target.value })}
                className="bg-transparent border-b border-transparent hover:border-white/60 focus:border-foreground/40 focus:outline-none"
              />
              {person.departmentId && (
                <>
                  <span>·</span>
                  <span>{deptName(data.departments, person.departmentId)}</span>
                </>
              )}
            </div>
          </div>
          <div className="hidden flex-col items-end gap-2 sm:flex">
            <StreakStrip goals={myGoals} endWeek={lastWeek} label="your last 6 weeks" />
            <Link
              href={`/${locale}/admin/team/people/${person.id}`}
              className="text-xs text-muted hover:text-foreground"
            >
              Full profile →
            </Link>
          </div>
        </div>
      </header>

      {/* team pulse strip — the "get" that comes to you */}
      {activePeople.length > 1 && (
        <Link
          href={`/${locale}/admin/team/pulse`}
          className="group flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl glass-well px-5 py-3"
        >
          <p className="text-sm">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted mr-3">
              Team pulse
            </span>
            <span className="font-medium tabular-nums">{teamSet}/{activePeople.length}</span>
            <span className="text-muted"> set this week</span>
            <span className="text-muted"> · </span>
            <span className="font-medium tabular-nums text-accent">
              {teamHitRate === null ? "—" : `${teamHitRate}%`}
            </span>
            <span className="text-muted"> hit last week</span>
          </p>
          <span className="text-xs text-muted group-hover:text-foreground transition-colors">
            Open Pulse →
          </span>
        </Link>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* my week */}
        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg tracking-tight">My week</h2>
            <Link href={`/${locale}/admin/team/pulse`} className="text-xs text-muted hover:text-foreground">
              Team pulse →
            </Link>
          </div>

          {/* This week — the active focus */}
          <div className="mt-4 rounded-xl glass p-3 ring-1 ring-primary/25">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-primary">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              This week · {weekLabel(thisWeek).replace("Week of ", "")}
            </p>
            {(["professional", "personal"] as GoalType[]).map((type) => (
              <div key={type} className="mb-2 last:mb-0">
                <p className="text-[10px] uppercase tracking-wide text-muted/70">{type}</p>
                <SetCell
                  goal={goalOf(type, thisWeek)}
                  canEdit
                  placeholder={`Set your ${type} goal…`}
                  onSet={(text) => addGoal({ personId: person.id, type, text, status: "on_track", weekOf: thisWeek })}
                  onEdit={(text) => {
                    const g = goalOf(type, thisWeek);
                    if (g) updateGoal(g.id, { text });
                  }}
                />
              </div>
            ))}
          </div>

          {/* Last week — recessed, to grade */}
          <div className="mt-3 rounded-xl border border-border/70 bg-foreground/[0.035] p-3">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted">
              <span className="size-1.5 rounded-full bg-muted/50" aria-hidden />
              Last week · grade it
            </p>
            {(["professional", "personal"] as GoalType[]).map((type) => {
              const goal = goalOf(type, lastWeek);
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
                      <GradeButtons value={goal.status} onChange={(s) => grade(goal, s)} />
                    </div>
                  ) : (
                    <p className="mt-0.5 text-sm text-muted/60">No goal set last week.</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* my work */}
        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg tracking-tight">My work</h2>
            <Link href={`/${locale}/admin/team/work`} className="text-xs text-muted hover:text-foreground">
              Open board →
            </Link>
          </div>
          <p className="mt-1 text-xs text-muted">{openCount} open · {myCards.length} total</p>

          <div className="mt-4 space-y-3">
            {WORK_COLUMNS.map((col) => {
              const inCol = myCards.filter((c) => c.column === col.id);
              if (inCol.length === 0) return null;
              return (
                <div key={col.id}>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-muted">
                    {col.label} · {inCol.length}
                  </p>
                  <div className="space-y-1.5">
                    {inCol.map((c) => (
                      <IssueRow key={c.id} card={c} onOpen={() => setOpenCard(c.id)} />
                    ))}
                  </div>
                </div>
              );
            })}
            {myCards.length === 0 && (
              <p className="text-sm text-muted">Nothing assigned to you yet.</p>
            )}
          </div>

          {myEpics.length > 0 && (
            <div className="mt-5 border-t border-white/50 pt-4">
              <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted">Epics you own</p>
              <div className="space-y-2">
                {myEpics.map((i) => (
                  <Link
                    key={i.id}
                    href={`/${locale}/admin/team/initiatives/${i.id}`}
                    className="block glass-well rounded-xl px-3 py-2 hover:text-primary"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm">{i.title}</span>
                      <span className="shrink-0 text-xs tabular-nums text-muted">{i.progress}%</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/50">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${i.progress}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {openCard && <CardDetail cardId={openCard} onClose={() => setOpenCard(null)} />}
    </div>
  );
}

function IssueRow({ card, onOpen }: { card: WorkCard; onOpen: () => void }) {
  const priority = CARD_PRIORITIES.find((p) => p.id === card.priority);
  const subDone = card.subtasks.filter((s) => s.done).length;
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-2 glass-well rounded-xl px-3 py-2 text-left hover:bg-white/50"
    >
      {card.priority !== "none" ? (
        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: priority?.color }} title={priority?.label} />
      ) : (
        <span className="size-2 shrink-0" />
      )}
      <span className="min-w-0 flex-1 truncate text-sm">{card.title}</span>
      {card.subtasks.length > 0 && (
        <span className="shrink-0 text-[11px] text-muted">✓ {subDone}/{card.subtasks.length}</span>
      )}
      {card.dueDate && <span className="shrink-0 text-[11px] text-muted">{card.dueDate}</span>}
    </button>
  );
}
