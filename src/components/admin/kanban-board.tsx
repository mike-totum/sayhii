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
import { WORK_COLUMNS, type WorkCard, type WorkColumn } from "@/lib/team";

// Drag cards between columns. Local-only until the backend exists.
// TODO(team-backend): persist via PATCH /team/cards/{id} { column }.
export function KanbanBoard({
  initialCards,
  nameById,
}: {
  initialCards: WorkCard[];
  nameById: Record<string, string>;
}) {
  const [cards, setCards] = useState(initialCards);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function onDragEnd(e: DragEndEvent) {
    const cardId = String(e.active.id);
    const col = e.over ? (String(e.over.id) as WorkColumn) : null;
    if (!col) return;
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, column: col } : c)));
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {WORK_COLUMNS.map((col) => (
          <Column
            key={col.id}
            id={col.id}
            label={col.label}
            cards={cards.filter((c) => c.column === col.id)}
            nameById={nameById}
          />
        ))}
      </div>
    </DndContext>
  );
}

function Column({
  id,
  label,
  cards,
  nameById,
}: {
  id: WorkColumn;
  label: string;
  cards: WorkCard[];
  nameById: Record<string, string>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-md border p-3 min-h-48 transition-colors ${
        isOver ? "border-primary bg-warm/40" : "border-border bg-surface/60"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-[0.18em] text-muted">{label}</h3>
        <span className="text-xs text-muted">{cards.length}</span>
      </div>
      <div className="space-y-2">
        {cards.map((c) => (
          <Card key={c.id} card={c} assignee={c.assigneeId ? nameById[c.assigneeId] : undefined} />
        ))}
      </div>
    </div>
  );
}

function Card({ card, assignee }: { card: WorkCard; assignee?: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: card.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
      }}
      {...listeners}
      {...attributes}
      className="rounded-[6px] border border-border bg-background px-3 py-2.5 cursor-grab active:cursor-grabbing touch-none"
    >
      <p className="text-sm font-medium leading-snug">{card.title}</p>
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted">
        <span>{assignee ?? "Unassigned"}</span>
        {card.dueDate && <span>{card.dueDate}</span>}
      </div>
    </div>
  );
}
