"use client";

import { useState } from "react";
import type { Person } from "@/lib/team";
import { PersonAvatar, PersonPill } from "./person-chip";

// Multi-select people picker. Shows the current selection as removable pills and
// a searchable dropdown to add more. Used for both owners and tagged people.
export function PeoplePicker({
  label,
  people,
  selectedIds,
  onChange,
  faint = false,
}: {
  label: string;
  people: Person[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  faint?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const selected = selectedIds
    .map((id) => people.find((p) => p.id === id))
    .filter((p): p is Person => !!p);
  const available = people.filter(
    (p) =>
      !selectedIds.includes(p.id) &&
      (p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.role.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div>
      <p className="text-xs text-muted mb-1.5">{label}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {selected.map((p) => (
          <PersonPill
            key={p.id}
            person={p}
            faint={faint}
            onRemove={() => onChange(selectedIds.filter((id) => id !== p.id))}
          />
        ))}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-6 items-center gap-1 rounded-full border border-dashed border-border px-2 text-xs text-muted hover:text-foreground hover:border-foreground/40"
          >
            + Add
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute z-50 mt-1 w-56 rounded-md border border-border bg-surface p-1.5 shadow-lg">
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search people…"
                  className="mb-1.5 w-full rounded-[4px] border border-border bg-background px-2 py-1 text-xs focus:border-foreground/40 focus:outline-none"
                />
                <div className="max-h-52 overflow-y-auto">
                  {available.length === 0 && (
                    <p className="px-2 py-2 text-xs text-muted">No matches</p>
                  )}
                  {available.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onChange([...selectedIds, p.id]);
                        setQ("");
                      }}
                      className="flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left text-sm hover:bg-background"
                    >
                      <PersonAvatar person={p} size={18} />
                      <span className="min-w-0 flex-1 truncate">{p.name}</span>
                      <span className="truncate text-[11px] text-muted">{p.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
