"use client";

import { useState } from "react";
import { useTeam } from "@/lib/team-store";
import {
  WORK_COLUMNS,
  CARD_PRIORITIES,
  type WorkCard,
  type WorkColumn,
  type CardPriority,
} from "@/lib/team";
import { PeoplePicker } from "./people-picker";
import { PersonAvatar } from "./person-chip";

// Full card detail: the rich work object. Owners + tagged people, priority,
// labels, department/initiative, dates, checklist, and a comment thread.
export function CardDetail({ cardId, onClose }: { cardId: string; onClose: () => void }) {
  const {
    data,
    updateCard,
    deleteCard,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addComment,
  } = useTeam();
  const card = data.cards.find((c) => c.id === cardId);
  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/30 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-3xl rounded-2xl glass shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start gap-3 border-b border-white/50 p-5">
          <PriorityPicker
            value={card.priority}
            onChange={(priority) => updateCard(card.id, { priority })}
          />
          <textarea
            value={card.title}
            onChange={(e) => updateCard(card.id, { title: e.target.value })}
            rows={1}
            className="flex-1 resize-none bg-transparent text-lg font-semibold leading-snug focus:outline-none"
          />
          <button onClick={onClose} className="text-muted hover:text-foreground" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-[1fr_15rem]">
          {/* main column */}
          <div className="space-y-5 min-w-0">
            <Field label="Description">
              <textarea
                value={card.description}
                onChange={(e) => updateCard(card.id, { description: e.target.value })}
                placeholder="Add more detail…"
                rows={3}
                className="w-full rounded-[4px] border border-border bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
              />
            </Field>

            <Subtasks
              card={card}
              onAdd={(t) => addSubtask(card.id, t)}
              onToggle={(sid, done) => toggleSubtask(card.id, sid, done)}
              onDelete={(sid) => deleteSubtask(card.id, sid)}
            />

            <Comments card={card} onAdd={(b) => addComment(card.id, b)} />
          </div>

          {/* sidebar */}
          <div className="space-y-4">
            <PeoplePicker
              label="Owners"
              people={data.people}
              selectedIds={card.ownerIds}
              onChange={(ownerIds) => updateCard(card.id, { ownerIds })}
            />
            <PeoplePicker
              label="Tagged"
              people={data.people}
              selectedIds={card.taggedIds}
              onChange={(taggedIds) => updateCard(card.id, { taggedIds })}
              faint
            />
            <Field label="Status">
              <Select
                value={card.column}
                onChange={(v) => updateCard(card.id, { column: v as WorkColumn })}
                options={WORK_COLUMNS.map((c) => ({ value: c.id, label: c.label }))}
              />
            </Field>
            <Field label="Department">
              <Select
                value={card.departmentId}
                onChange={(v) => updateCard(card.id, { departmentId: v })}
                options={data.departments.map((d) => ({ value: d.id, label: d.name }))}
              />
            </Field>
            <Field label="Initiative">
              <Select
                value={card.initiativeId ?? ""}
                onChange={(v) => updateCard(card.id, { initiativeId: v || null })}
                options={[
                  { value: "", label: "None" },
                  ...data.initiatives.map((i) => ({ value: i.id, label: i.title })),
                ]}
              />
            </Field>
            <Field label="Due date">
              <input
                value={card.dueDate ?? ""}
                onChange={(e) => updateCard(card.id, { dueDate: e.target.value || null })}
                placeholder="e.g. Jul 5"
                className="h-8 w-full rounded-[4px] border border-border bg-background px-2 text-sm focus:border-foreground/40 focus:outline-none"
              />
            </Field>
            <Labels
              labels={card.labels}
              onChange={(labels) => updateCard(card.id, { labels })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/50 p-4">
          <button
            onClick={() => {
              deleteCard(card.id);
              onClose();
            }}
            className="text-sm text-primary hover:underline"
          >
            Delete issue
          </button>
          <button
            onClick={onClose}
            className="rounded-[4px] bg-foreground px-4 py-1.5 text-sm text-background hover:bg-primary transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function PriorityPicker({
  value,
  onChange,
}: {
  value: CardPriority;
  onChange: (v: CardPriority) => void;
}) {
  const cur = CARD_PRIORITIES.find((p) => p.id === value) ?? CARD_PRIORITIES[0];
  return (
    <label className="mt-1 inline-flex cursor-pointer items-center" title={`Priority: ${cur.label}`}>
      <span
        className="inline-block size-3.5 rounded-full ring-2 ring-surface"
        style={{ backgroundColor: cur.color }}
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CardPriority)}
        className="ml-1 cursor-pointer bg-transparent text-xs text-muted focus:outline-none"
      >
        {CARD_PRIORITIES.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Subtasks({
  card,
  onAdd,
  onToggle,
  onDelete,
}: {
  card: WorkCard;
  onAdd: (text: string) => void;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [text, setText] = useState("");
  const done = card.subtasks.filter((s) => s.done).length;
  return (
    <Field
      label={`Checklist${card.subtasks.length ? `  ·  ${done}/${card.subtasks.length}` : ""}`}
    >
      {card.subtasks.length > 0 && (
        <div className="mb-2 h-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${(done / card.subtasks.length) * 100}%` }}
          />
        </div>
      )}
      <ul className="space-y-1">
        {card.subtasks.map((s) => (
          <li key={s.id} className="group flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={s.done}
              onChange={(e) => onToggle(s.id, e.target.checked)}
              className="size-3.5 accent-accent"
            />
            <span className={s.done ? "text-muted line-through" : ""}>{s.text}</span>
            <button
              onClick={() => onDelete(s.id)}
              className="ml-auto text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
              aria-label="Delete subtask"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) {
            onAdd(text.trim());
            setText("");
          }
        }}
        className="mt-1.5"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="+ Add a subtask"
          className="w-full rounded-[4px] border border-border bg-background px-2 py-1.5 text-sm focus:border-foreground/40 focus:outline-none"
        />
      </form>
    </Field>
  );
}

function Comments({ card, onAdd }: { card: WorkCard; onAdd: (body: string) => void }) {
  const [body, setBody] = useState("");
  return (
    <Field label="Comments">
      <div className="space-y-3">
        {card.comments.map((c) => (
          <div key={c.id} className="text-sm">
            <p className="text-xs text-muted">
              <span className="font-medium text-foreground">{c.authorName}</span> · {c.createdAtLabel}
            </p>
            <p className="mt-0.5 whitespace-pre-wrap leading-snug">{c.body}</p>
          </div>
        ))}
        {card.comments.length === 0 && (
          <p className="text-xs text-muted">No comments yet.</p>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) {
            onAdd(body.trim());
            setBody("");
          }
        }}
        className="mt-2"
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment…"
          rows={2}
          className="w-full rounded-[4px] border border-border bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
        />
        {body.trim() && (
          <button className="mt-1.5 rounded-[4px] bg-foreground px-3 py-1 text-xs text-background">
            Comment
          </button>
        )}
      </form>
    </Field>
  );
}

function Labels({
  labels,
  onChange,
}: {
  labels: string[];
  onChange: (labels: string[]) => void;
}) {
  const [text, setText] = useState("");
  return (
    <Field label="Labels">
      <div className="flex flex-wrap items-center gap-1.5">
        {labels.map((l) => (
          <span
            key={l}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-xs"
          >
            {l}
            <button
              onClick={() => onChange(labels.filter((x) => x !== l))}
              className="text-muted hover:text-foreground"
              aria-label={`Remove ${l}`}
            >
              ✕
            </button>
          </span>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = text.trim();
            if (v && !labels.includes(v)) onChange([...labels, v]);
            setText("");
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="+ label"
            className="h-6 w-20 rounded-full border border-dashed border-border bg-transparent px-2 text-xs focus:border-foreground/40 focus:outline-none"
          />
        </form>
      </div>
    </Field>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-muted">{label}</p>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full rounded-[4px] border border-border bg-background px-2 text-sm focus:border-foreground/40 focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// Re-export so the board can pull avatars without another import.
export { PersonAvatar };
