"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Department, Person } from "@/lib/team";

// Drag people between departments to configure who belongs where.
// TODO(team-backend): persist moves via PATCH /team/people/{id} { departmentId }.
export function OrgBuilder({
  departments,
  initialPeople,
}: {
  departments: Department[];
  initialPeople: Person[];
}) {
  const [people, setPeople] = useState(initialPeople);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function onDragEnd(e: DragEndEvent) {
    const personId = String(e.active.id);
    const deptId = e.over ? String(e.over.id) : null;
    if (!deptId) return;
    setPeople((prev) =>
      prev.map((p) => (p.id === personId ? { ...p, departmentId: deptId } : p)),
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {departments.map((d) => (
          <DeptColumn
            key={d.id}
            dept={d}
            members={people.filter((p) => p.departmentId === d.id)}
          />
        ))}
      </div>
    </DndContext>
  );
}

function DeptColumn({ dept, members }: { dept: Department; members: Person[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: dept.id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-md border p-3 min-h-44 transition-colors ${
        isOver ? "border-primary bg-warm/40" : "border-border bg-surface"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">{dept.name}</h3>
        <span className="text-xs text-muted">{members.length}</span>
      </div>
      <div className="space-y-2">
        {members.map((p) => (
          <PersonCard key={p.id} person={p} />
        ))}
        {members.length === 0 && (
          <p className="text-xs text-muted py-6 text-center">Drop people here</p>
        )}
      </div>
    </div>
  );
}

function PersonCard({ person }: { person: Person }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: person.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
      }}
      {...listeners}
      {...attributes}
      className="rounded-[6px] border border-border bg-background px-3 py-2 cursor-grab active:cursor-grabbing touch-none"
    >
      <p className="text-sm font-medium leading-tight">{person.name}</p>
      <p className="text-xs text-muted">{person.role}</p>
    </div>
  );
}
