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
import type { Person } from "@/lib/team";
import { PersonAvatar } from "./person-chip";

const UNASSIGNED = "__unassigned__";

export function OrgBuilder() {
  const { data, me, updatePerson, deleteDepartment } = useTeam();
  const isAdmin = !!me?.isAdmin;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function onDragEnd(e: DragEndEvent) {
    if (!isAdmin) return;
    const personId = String(e.active.id);
    const target = e.over ? String(e.over.id) : null;
    if (target) updatePerson(personId, { departmentId: target === UNASSIGNED ? "" : target });
  }

  const active = data.people.filter((p) => p.active);
  const deptIds = new Set(data.departments.map((d) => d.id));
  const unassigned = active.filter((p) => !p.departmentId || !deptIds.has(p.departmentId));

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.departments.map((d) => {
          const members = active.filter((p) => p.departmentId === d.id);
          return (
            <DeptColumn
              key={d.id}
              id={d.id}
              name={d.name}
              members={members}
              draggable={isAdmin}
              onDelete={
                isAdmin
                  ? () => {
                      const msg =
                        members.length > 0
                          ? `Delete "${d.name}"? Its ${members.length} member${
                              members.length === 1 ? "" : "s"
                            } will move to Unassigned.`
                          : `Delete "${d.name}"?`;
                      if (confirm(msg)) deleteDepartment(d.id);
                    }
                  : undefined
              }
            />
          );
        })}
        {(unassigned.length > 0 || isAdmin) && (
          <DeptColumn id={UNASSIGNED} name="Unassigned" members={unassigned} draggable={isAdmin} />
        )}
      </div>
    </DndContext>
  );
}

function DeptColumn({
  id,
  name,
  members,
  draggable,
  onDelete,
}: {
  id: string;
  name: string;
  members: Person[];
  draggable: boolean;
  onDelete?: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl glass-well p-3 min-h-44 transition-colors ${
        isOver ? "ring-2 ring-primary/50 bg-warm/50" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">{name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{members.length}</span>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-muted hover:text-red-600 transition-colors text-sm leading-none"
              aria-label={`Delete ${name}`}
              title={`Delete ${name}`}
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {members.map((p) => (
          <PersonCard key={p.id} person={p} draggable={draggable} />
        ))}
        {members.length === 0 && (
          <p className="text-xs text-muted py-6 text-center">
            {draggable ? "Drop people here" : "No one yet"}
          </p>
        )}
      </div>
    </div>
  );
}

function PersonCard({ person, draggable }: { person: Person; draggable: boolean }) {
  const { locale } = useParams<{ locale: string }>();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: person.id,
    disabled: !draggable,
  });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-center justify-between gap-2 rounded-xl glass px-3 py-2 touch-none"
    >
      <div
        {...listeners}
        {...attributes}
        className={`flex min-w-0 flex-1 items-center gap-2 ${
          draggable ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        <PersonAvatar person={person} size={26} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium leading-tight">
            <span className="truncate">{person.name}</span>
            {person.accessRole === "admin" && (
              <span className="rounded-full bg-foreground px-1.5 text-[9px] uppercase tracking-wide text-background">
                Admin
              </span>
            )}
          </p>
          <p className="text-xs text-muted truncate">{person.role || "—"}</p>
        </div>
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
