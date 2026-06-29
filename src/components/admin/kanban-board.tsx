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
import { useTeam } from "@/lib/team-store";
import { WORK_COLUMNS, personName, type Person, type WorkCard, type WorkColumn } from "@/lib/team";

export function KanbanBoard({ departmentId }: { departmentId: string }) {
  const { data, addCard, updateCard, deleteCard } = useTeam();
  const [editing, setEditing] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const cards = data.cards.filter((c) => c.departmentId === departmentId);

  function onDragEnd(e: DragEndEvent) {
    const cardId = String(e.active.id);
    const col = e.over ? (String(e.over.id) as WorkColumn) : null;
    if (col) updateCard(cardId, { column: col });
  }

  const editingCard = cards.find((c) => c.id === editing) ?? null;

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {WORK_COLUMNS.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              label={col.label}
              cards={cards.filter((c) => c.column === col.id)}
              people={data.people}
              onOpen={setEditing}
              onAdd={(title) =>
                addCard({
                  departmentId,
                  column: col.id,
                  title,
                  description: "",
                  assigneeId: null,
                  initiativeId: null,
                  dueDate: null,
                })
              }
            />
          ))}
        </div>
      </DndContext>

      {editingCard && (
        <CardEditor
          card={editingCard}
          onClose={() => setEditing(null)}
          onChange={(patch) => updateCard(editingCard.id, patch)}
          onDelete={() => {
            deleteCard(editingCard.id);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function Column({
  id,
  label,
  cards,
  people,
  onOpen,
  onAdd,
}: {
  id: WorkColumn;
  label: string;
  cards: WorkCard[];
  people: Person[];
  onOpen: (id: string) => void;
  onAdd: (title: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
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
          <Card key={c.id} card={c} people={people} onOpen={() => onOpen(c.id)} />
        ))}
      </div>

      {adding ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim()) {
              onAdd(title.trim());
              setTitle("");
              setAdding(false);
            }
          }}
          className="mt-2"
        >
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => !title && setAdding(false)}
            placeholder="Card title…"
            className="w-full rounded-[4px] border border-border bg-background px-2 py-1.5 text-sm focus:border-foreground/40 focus:outline-none"
          />
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 w-full text-left text-xs text-muted hover:text-foreground px-2 py-1.5"
        >
          + Add card
        </button>
      )}
    </div>
  );
}

function Card({
  card,
  people,
  onOpen,
}: {
  card: WorkCard;
  people: Person[];
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      className="rounded-[6px] border border-border bg-background px-3 py-2.5 cursor-pointer active:cursor-grabbing touch-none"
    >
      <p className="text-sm font-medium leading-snug">{card.title}</p>
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted">
        <span>{personName(people, card.assigneeId)}</span>
        {card.dueDate && <span>{card.dueDate}</span>}
      </div>
    </div>
  );
}

function CardEditor({
  card,
  onClose,
  onChange,
  onDelete,
}: {
  card: WorkCard;
  onClose: () => void;
  onChange: (patch: Partial<WorkCard>) => void;
  onDelete: () => void;
}) {
  const { data } = useTeam();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-md border border-border bg-surface p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          value={card.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full bg-transparent font-medium text-lg border-b border-transparent hover:border-border focus:border-foreground/40 focus:outline-none"
        />
        <textarea
          value={card.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Description…"
          rows={3}
          className="w-full rounded-[4px] border border-border bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
        />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <L label="Assignee">
            <select value={card.assigneeId ?? ""} onChange={(e) => onChange({ assigneeId: e.target.value || null })}
              className="h-8 w-full rounded-[4px] border border-border bg-background px-2 focus:outline-none">
              <option value="">Unassigned</option>
              {data.people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </L>
          <L label="Initiative">
            <select value={card.initiativeId ?? ""} onChange={(e) => onChange({ initiativeId: e.target.value || null })}
              className="h-8 w-full rounded-[4px] border border-border bg-background px-2 focus:outline-none">
              <option value="">None</option>
              {data.initiatives.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
            </select>
          </L>
          <L label="Column">
            <select value={card.column} onChange={(e) => onChange({ column: e.target.value as WorkColumn })}
              className="h-8 w-full rounded-[4px] border border-border bg-background px-2 focus:outline-none">
              {WORK_COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </L>
          <L label="Due">
            <input value={card.dueDate ?? ""} onChange={(e) => onChange({ dueDate: e.target.value || null })} placeholder="e.g. Jul 5"
              className="h-8 w-full rounded-[4px] border border-border bg-background px-2 focus:outline-none" />
          </L>
        </div>
        <div className="flex items-center justify-between pt-1">
          <button onClick={onDelete} className="text-sm text-primary hover:underline">Delete</button>
          <button onClick={onClose} className="text-sm rounded-[4px] bg-foreground text-background px-4 py-1.5">Done</button>
        </div>
      </div>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted mb-1">{label}</p>
      {children}
    </div>
  );
}
