"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTeam } from "@/lib/team-store";
import { deptName, personName, type InitiativeStatus } from "@/lib/team";
import { DeptFilter } from "@/components/admin/dept-filter";

const STATUS_LABEL: Record<InitiativeStatus, string> = {
  not_started: "Not started",
  on_track: "On track",
  at_risk: "At risk",
  done: "Done",
};
const STATUS_TONE: Record<InitiativeStatus, string> = {
  not_started: "bg-border/70 text-muted",
  on_track: "bg-accent-soft/70 text-foreground border border-accent/40",
  at_risk: "bg-rose-100 text-foreground border border-rose-200",
  done: "bg-warm/70 text-foreground border border-primary/30",
};

export default function TeamInitiativesPage() {
  return (
    <Suspense>
      <InitiativesInner />
    </Suspense>
  );
}

function InitiativesInner() {
  const { locale } = useParams<{ locale: string }>();
  const dept = useSearchParams().get("dept") ?? "";
  const { data, addInitiative } = useTeam();
  const [adding, setAdding] = useState(false);

  const initiatives = data.initiatives.filter((i) =>
    dept ? i.departmentIds.includes(dept) : true,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl tracking-tight">Initiatives</h1>
        <div className="flex items-center gap-3">
          <DeptFilter value={dept} departments={data.departments} />
          <button
            onClick={() => setAdding((v) => !v)}
            className="text-xs font-medium rounded-[4px] bg-foreground text-background px-3 py-1.5 hover:bg-primary transition-colors"
          >
            + Initiative
          </button>
        </div>
      </div>

      {adding && (
        <AddInitiative
          people={data.people}
          onAdd={(title, ownerId) => {
            const owner = data.people.find((p) => p.id === ownerId);
            addInitiative({
              title,
              ownerId,
              departmentIds: owner ? [owner.departmentId] : [],
              status: "not_started",
              targetDate: "TBD",
              progress: 0,
              summary: "",
            });
            setAdding(false);
          }}
        />
      )}

      <div className="mt-5 space-y-3">
        {initiatives.map((i) => (
          <Link
            key={i.id}
            href={`/${locale}/admin/team/initiatives/${i.id}`}
            className="block rounded-md border border-border bg-surface p-5 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(17,17,23,0.4)] transition-all"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-serif text-lg tracking-tight">{i.title}</h2>
                <p className="mt-1 text-sm text-muted">{i.summary || "No summary yet."}</p>
              </div>
              <span className={`shrink-0 text-[11px] rounded-full px-2.5 py-0.5 ${STATUS_TONE[i.status]}`}>
                {STATUS_LABEL[i.status]}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
              <span>Owner: <span className="text-foreground">{personName(data.people, i.ownerId)}</span></span>
              <span>{i.departmentIds.map((d) => deptName(data.departments, d)).join(", ") || "—"}</span>
              <span>Target: {i.targetDate}</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${i.progress}%` }} />
              </div>
              <span className="text-xs tabular-nums text-muted">{i.progress}%</span>
            </div>
          </Link>
        ))}
        {initiatives.length === 0 && <p className="text-sm text-muted">No initiatives for this filter.</p>}
      </div>
    </div>
  );
}

function AddInitiative({
  people,
  onAdd,
}: {
  people: { id: string; name: string }[];
  onAdd: (title: string, ownerId: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [ownerId, setOwnerId] = useState(people[0]?.id ?? "");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (title.trim()) onAdd(title.trim(), ownerId);
      }}
      className="mt-4 flex flex-wrap gap-2 rounded-md border border-border bg-surface p-3"
    >
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Initiative title"
        className="flex-1 min-w-48 h-9 rounded-[4px] border border-border bg-background px-3 text-sm focus:border-foreground/40 focus:outline-none" />
      <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}
        className="h-9 rounded-[4px] border border-border bg-background px-2 text-sm focus:outline-none">
        {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <button className="h-9 rounded-[4px] bg-foreground text-background px-4 text-sm font-medium">Add</button>
    </form>
  );
}
