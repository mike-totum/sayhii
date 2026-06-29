"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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
import { useTeam } from "@/lib/team-store";
import type { Department, Person } from "@/lib/team";

export function OrgBuilder() {
  const { data, updatePerson } = useTeam();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function onDragEnd(e: DragEndEvent) {
    const personId = String(e.active.id);
    const deptId = e.over ? String(e.over.id) : null;
    if (deptId) updatePerson(personId, { departmentId: deptId });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.departments.map((d) => (
          <DeptColumn
            key={d.id}
            dept={d}
            members={data.people.filter((p) => p.departmentId === d.id)}
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
  const { locale } = useParams<{ locale: string }>();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: person.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-center justify-between gap-2 rounded-[6px] border border-border bg-background px-3 py-2 touch-none"
    >
      <div {...listeners} {...attributes} className="min-w-0 flex-1 cursor-grab active:cursor-grabbing">
        <p className="text-sm font-medium leading-tight truncate">{person.name}</p>
        <p className="text-xs text-muted truncate">{person.role}</p>
      </div>
      <Link
        href={`/${locale}/admin/team/people/${person.id}`}
        onPointerDown={(e) => e.stopPropagation()}
        className="shrink-0 text-muted hover:text-foreground transition-colors text-sm px-1"
        aria-label={`Open ${person.name}`}
      >
        ›
      </Link>
    </div>
  );
}
