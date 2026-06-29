"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTeam } from "@/lib/team-store";
import { INITIATIVE_STATUSES, type InitiativeStatus } from "@/lib/team";

export default function InitiativeDetailPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const router = useRouter();
  const { data, updateInitiative, deleteInitiative } = useTeam();

  const initiative = data.initiatives.find((i) => i.id === id);
  if (!initiative) {
    return (
      <div>
        <Back locale={locale} />
        <p className="mt-6 text-muted">This initiative no longer exists.</p>
      </div>
    );
  }

  const linked = data.cards.filter((c) => c.initiativeId === initiative.id);
  const toggleDept = (deptId: string) => {
    const has = initiative.departmentIds.includes(deptId);
    updateInitiative(initiative.id, {
      departmentIds: has
        ? initiative.departmentIds.filter((x) => x !== deptId)
        : [...initiative.departmentIds, deptId],
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Back locale={locale} />

      <header className="rounded-md border border-border bg-surface p-5 space-y-4">
        <input
          value={initiative.title}
          onChange={(e) => updateInitiative(initiative.id, { title: e.target.value })}
          className="w-full bg-transparent font-serif text-2xl tracking-tight border-b border-transparent hover:border-border focus:border-foreground/40 focus:outline-none"
        />
        <textarea
          value={initiative.summary}
          onChange={(e) => updateInitiative(initiative.id, { summary: e.target.value })}
          placeholder="Summary…"
          rows={2}
          className="w-full rounded-[4px] border border-border bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
        />

        <div className="grid grid-cols-2 gap-4">
          <Labeled label="Owner">
            <select value={initiative.ownerId} onChange={(e) => updateInitiative(initiative.id, { ownerId: e.target.value })}
              className="h-8 w-full rounded-[4px] border border-border bg-background px-2 text-sm focus:outline-none">
              <option value="">Unassigned</option>
              {data.people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Labeled>
          <Labeled label="Status">
            <select value={initiative.status} onChange={(e) => updateInitiative(initiative.id, { status: e.target.value as InitiativeStatus })}
              className="h-8 w-full rounded-[4px] border border-border bg-background px-2 text-sm focus:outline-none">
              {INITIATIVE_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Labeled>
          <Labeled label="Target">
            <input value={initiative.targetDate} onChange={(e) => updateInitiative(initiative.id, { targetDate: e.target.value })}
              className="h-8 w-full rounded-[4px] border border-border bg-background px-2 text-sm focus:outline-none" />
          </Labeled>
          <Labeled label={`Progress: ${initiative.progress}%`}>
            <input type="range" min={0} max={100} value={initiative.progress}
              onChange={(e) => updateInitiative(initiative.id, { progress: Number(e.target.value) })}
              className="w-full" />
          </Labeled>
        </div>

        <Labeled label="Departments">
          <div className="flex flex-wrap gap-2">
            {data.departments.map((d) => {
              const on = initiative.departmentIds.includes(d.id);
              return (
                <button key={d.id} type="button" onClick={() => toggleDept(d.id)}
                  className={`text-xs rounded-full px-3 py-1 border transition-colors ${
                    on ? "bg-foreground text-background border-foreground" : "border-border text-muted hover:text-foreground"
                  }`}>
                  {d.name}
                </button>
              );
            })}
          </div>
        </Labeled>
      </header>

      <section className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-sm font-medium mb-3">Linked work ({linked.length})</h2>
        <ul className="space-y-1.5">
          {linked.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
              <Link href={`/${locale}/admin/team/boards?dept=${c.departmentId}`} className="hover:text-primary truncate">
                {c.title}
              </Link>
              <span className="text-xs text-muted shrink-0">{c.column.replace("_", " ")}</span>
            </li>
          ))}
          {linked.length === 0 && <li className="text-sm text-muted">No linked work yet — link cards from a board.</li>}
        </ul>
      </section>

      <button
        onClick={() => {
          deleteInitiative(initiative.id);
          router.push(`/${locale}/admin/team/initiatives`);
        }}
        className="text-sm text-primary hover:underline"
      >
        Delete initiative
      </button>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted mb-1">{label}</p>
      {children}
    </div>
  );
}

function Back({ locale }: { locale: string }) {
  return (
    <Link href={`/${locale}/admin/team/initiatives`} className="text-sm text-muted hover:text-foreground transition-colors">
      ← Initiatives
    </Link>
  );
}
