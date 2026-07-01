"use client";

import { useState } from "react";
import { useTeam } from "@/lib/team-store";
import { PERSON_COLORS, type TeamRole } from "@/lib/team";
import { OrgBuilder } from "@/components/admin/org-builder";

export default function TeamPeoplePage() {
  const { data, me, addDepartment, addPerson } = useTeam();
  const [adding, setAdding] = useState<"person" | "dept" | null>(null);
  const isAdmin = !!me?.isAdmin;

  // People is roster management (invite, assign roles, org structure) — admins
  // only. The tab is hidden for members; this guards direct navigation too.
  if (!isAdmin) {
    return (
      <div className="rounded-2xl glass px-6 py-12 text-center">
        <h1 className="font-serif text-2xl tracking-tight">Admins only</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          The people roster is managed by team admins. Ask an admin if you need to
          be added or moved.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl tracking-tight">People</h1>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdding(adding === "dept" ? null : "dept")}
              className="text-xs font-medium rounded-full glass px-3 py-1.5 hover:text-foreground transition-colors"
            >
              + Department
            </button>
            <button
              onClick={() => setAdding(adding === "person" ? null : "person")}
              className="text-xs font-medium rounded-full bg-foreground text-background px-3 py-1.5 hover:bg-primary transition-colors"
            >
              + Invite person
            </button>
          </div>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">
        {isAdmin
          ? "Invite teammates by email and assign a role. Drag people between departments."
          : "Your team. Ask an admin to add or move people."}
      </p>

      {isAdmin && adding === "dept" && (
        <AddDepartment
          onAdd={(name) => {
            addDepartment(name);
            setAdding(null);
          }}
        />
      )}
      {isAdmin && adding === "person" && (
        <AddPerson
          departments={data.departments}
          onAdd={(p) => {
            addPerson({
              ...p,
              color: PERSON_COLORS[data.people.length % PERSON_COLORS.length],
              active: true,
            });
            setAdding(null);
          }}
        />
      )}

      <div className="mt-5">
        <OrgBuilder />
      </div>
    </div>
  );
}

function AddDepartment({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onAdd(name.trim());
      }}
      className="mt-4 flex gap-2 rounded-2xl glass p-3"
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Department name"
        className="flex-1 h-9 rounded-[4px] border border-border bg-background px-3 text-sm focus:border-foreground/40 focus:outline-none"
      />
      <button className="h-9 rounded-[4px] bg-foreground text-background px-4 text-sm font-medium">
        Add
      </button>
    </form>
  );
}

function AddPerson({
  departments,
  onAdd,
}: {
  departments: { id: string; name: string }[];
  onAdd: (p: {
    name: string;
    email: string;
    role: string;
    departmentId: string;
    accessRole: TeamRole;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? "");
  const [accessRole, setAccessRole] = useState<TeamRole>("member");
  const input =
    "h-9 rounded-lg border border-white/60 bg-white/60 px-3 text-sm focus:border-foreground/40 focus:outline-none";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim() && email.trim())
          onAdd({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            role: role.trim(),
            departmentId,
            accessRole,
          });
      }}
      className="mt-4 grid gap-2 rounded-2xl glass p-3 sm:grid-cols-2"
    >
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={input} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email (@sayhii.io)" type="email" className={input} />
      <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Job title" className={input} />
      <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={input}>
        <option value="">No department</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <select value={accessRole} onChange={(e) => setAccessRole(e.target.value as TeamRole)} className={input}>
        <option value="member">Member — manages their own profile &amp; goals</option>
        <option value="admin">Admin — manages the whole team</option>
      </select>
      <div className="flex items-center justify-end gap-3">
        <span className="text-xs text-muted">They sign in with Google.</span>
        <button className="h-9 rounded-lg bg-foreground text-background px-4 text-sm font-medium">Invite</button>
      </div>
    </form>
  );
}
