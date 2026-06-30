"use client";

import { useState } from "react";
import { useTeam } from "@/lib/team-store";
import { PERSON_COLORS } from "@/lib/team";
import { OrgBuilder } from "@/components/admin/org-builder";

export default function TeamPeoplePage() {
  const { data, addDepartment, addPerson } = useTeam();
  const [adding, setAdding] = useState<"person" | "dept" | null>(null);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl tracking-tight">People &amp; departments</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdding(adding === "dept" ? null : "dept")}
            className="text-xs font-medium rounded-[4px] border border-border px-3 py-1.5 hover:bg-background transition-colors"
          >
            + Department
          </button>
          <button
            onClick={() => setAdding(adding === "person" ? null : "person")}
            className="text-xs font-medium rounded-[4px] bg-foreground text-background px-3 py-1.5 hover:bg-primary transition-colors"
          >
            + Person
          </button>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted">
        Drag people between departments. Saved in your browser for now (not yet on the server).
      </p>

      {adding === "dept" && (
        <AddDepartment
          onAdd={(name) => {
            addDepartment(name);
            setAdding(null);
          }}
        />
      )}
      {adding === "person" && (
        <AddPerson
          departments={data.departments}
          onAdd={(p) => {
            addPerson({
              ...p,
              color: PERSON_COLORS[data.people.length % PERSON_COLORS.length],
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
      className="mt-4 flex gap-2 rounded-md border border-border bg-surface p-3"
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
  onAdd: (p: { name: string; email: string; role: string; departmentId: string }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? "");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onAdd({ name: name.trim(), email: email.trim(), role: role.trim(), departmentId });
      }}
      className="mt-4 grid gap-2 rounded-md border border-border bg-surface p-3 sm:grid-cols-2"
    >
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Name"
        className="h-9 rounded-[4px] border border-border bg-background px-3 text-sm focus:border-foreground/40 focus:outline-none" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email"
        className="h-9 rounded-[4px] border border-border bg-background px-3 text-sm focus:border-foreground/40 focus:outline-none" />
      <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role"
        className="h-9 rounded-[4px] border border-border bg-background px-3 text-sm focus:border-foreground/40 focus:outline-none" />
      <div className="flex gap-2">
        <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
          className="h-9 flex-1 rounded-[4px] border border-border bg-background px-3 text-sm focus:border-foreground/40 focus:outline-none">
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <button className="h-9 rounded-[4px] bg-foreground text-background px-4 text-sm font-medium">Add</button>
      </div>
    </form>
  );
}
