"use client";

import { useMemo, useState } from "react";
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
import {
  WORK_COLUMNS,
  CARD_PRIORITIES,
  type Person,
  type WorkCard,
  type WorkColumn,
} from "@/lib/team";
import { PersonAvatar, AvatarStack } from "./person-chip";
import { CardDetail } from "./card-detail";

type GroupBy = "department" | "owner" | "initiative" | "none";
const GROUP_OPTIONS: { id: GroupBy; label: string }[] = [
  { id: "department", label: "Department" },
  { id: "owner", label: "Owner" },
  { id: "initiative", label: "Initiative" },
  { id: "none", label: "None" },
];

const NONE = "__none__";

type Lane = { id: string; label: string };

// Company-wide work board. Everything's visible at once (swimlanes), then you
// filter down. Cards drag between columns and across swimlanes (which reassigns
// the grouped dimension). Owners show as colored avatars.
export function CompanyBoard() {
  const { data, addCard, updateCard } = useTeam();
  const [groupBy, setGroupBy] = useState<GroupBy>("department");
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState<string[]>([]); // owner/tag filter
  const [deptFilter, setDeptFilter] = useState("");
  const [priority, setPriority] = useState("");
  const [openCard, setOpenCard] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const personById = useMemo(
    () => new Map(data.people.map((p) => [p.id, p])),
    [data.people],
  );

  // ---- filtering ----
  const q = search.trim().toLowerCase();
  const filtered = data.cards.filter((c) => {
    if (q && !c.title.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q))
      return false;
    if (deptFilter && c.departmentId !== deptFilter) return false;
    if (priority && c.priority !== priority) return false;
    if (people.length) {
      const onCard = new Set([...c.ownerIds, ...c.taggedIds]);
      if (!people.some((id) => onCard.has(id))) return false;
    }
    return true;
  });

  // ---- swimlanes ----
  const lanes: Lane[] = useMemo(() => {
    if (groupBy === "department")
      return data.departments.map((d) => ({ id: d.id, label: d.name }));
    if (groupBy === "owner")
      return [
        ...data.people.map((p) => ({ id: p.id, label: p.name })),
        { id: NONE, label: "Unassigned" },
      ];
    if (groupBy === "initiative")
      return [
        ...data.initiatives.map((i) => ({ id: i.id, label: i.title })),
        { id: NONE, label: "No initiative" },
      ];
    return [{ id: "__all__", label: "All work" }];
  }, [groupBy, data.departments, data.people, data.initiatives]);

  function laneOfCard(c: WorkCard): string {
    if (groupBy === "department") return c.departmentId;
    if (groupBy === "owner") return c.ownerIds[0] ?? NONE;
    if (groupBy === "initiative") return c.initiativeId ?? NONE;
    return "__all__";
  }

  // Only show lanes that have cards (after filtering), so the board stays tight —
  // except keep all department lanes for the company overview feel.
  const visibleLanes = lanes.filter(
    (l) => groupBy === "department" || filtered.some((c) => laneOfCard(c) === l.id),
  );

  function onDragEnd(e: DragEndEvent) {
    if (!e.over) return;
    const cardId = String(e.active.id);
    const [laneId, column] = String(e.over.id).split("::") as [string, WorkColumn];
    const card = data.cards.find((c) => c.id === cardId);
    if (!card) return;
    const patch: Partial<WorkCard> = { column };
    if (groupBy === "department" && laneId !== card.departmentId) patch.departmentId = laneId;
    if (groupBy === "owner") {
      const next = laneId === NONE ? [] : [laneId, ...card.ownerIds.filter((o) => o !== laneId)];
      patch.ownerIds = next;
    }
    if (groupBy === "initiative") patch.initiativeId = laneId === NONE ? null : laneId;
    updateCard(cardId, patch);
  }

  const togglePerson = (id: string) =>
    setPeople((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <div>
      {/* filter bar */}
      <div className="sticky top-0 z-20 -mx-1 mb-4 flex flex-wrap items-center gap-2 bg-background/90 px-1 py-2 backdrop-blur">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cards…"
          className="h-8 w-44 rounded-[6px] border border-border bg-surface px-2.5 text-sm focus:border-foreground/40 focus:outline-none"
        />
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-8 rounded-[6px] border border-border bg-surface px-2 text-sm focus:outline-none"
        >
          <option value="">All departments</option>
          {data.departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="h-8 rounded-[6px] border border-border bg-surface px-2 text-sm focus:outline-none"
        >
          <option value="">Any priority</option>
          {CARD_PRIORITIES.filter((p) => p.id !== "none").map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        {/* people filter — colored avatars you toggle */}
        <div className="flex items-center">
          {data.people.map((p, i) => (
            <button
              key={p.id}
              onClick={() => togglePerson(p.id)}
              title={p.name}
              style={{ marginLeft: i === 0 ? 0 : -6 }}
              className={`rounded-full transition-all ${
                people.includes(p.id)
                  ? "ring-2 ring-foreground"
                  : people.length
                    ? "opacity-40 hover:opacity-100"
                    : "hover:-translate-y-0.5"
              }`}
            >
              <PersonAvatar person={p} size={22} ring />
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {(search !== "" || deptFilter !== "" || priority !== "" || people.length > 0) && (
            <button
              onClick={() => {
                setSearch("");
                setDeptFilter("");
                setPriority("");
                setPeople([]);
              }}
              className="text-xs text-muted hover:text-foreground"
            >
              Clear
            </button>
          )}
          <div className="flex items-center gap-1 rounded-[6px] border border-border bg-surface p-0.5">
            <span className="px-1.5 text-[11px] text-muted">Group</span>
            {GROUP_OPTIONS.map((g) => (
              <button
                key={g.id}
                onClick={() => setGroupBy(g.id)}
                className={`rounded-[4px] px-2 py-1 text-xs transition-colors ${
                  groupBy === g.id
                    ? "bg-foreground text-background"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* board */}
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="space-y-4">
          {visibleLanes.map((lane) => (
            <Swimlane
              key={lane.id}
              lane={lane}
              leadPerson={groupBy === "owner" ? personById.get(lane.id) : undefined}
              cards={filtered.filter((c) => laneOfCard(c) === lane.id)}
              personById={personById}
              onOpen={setOpenCard}
              onAdd={(column, title) =>
                addCard(blankCard(title, column, lane, groupBy, data.departments[0]?.id ?? ""))
              }
            />
          ))}
          {visibleLanes.length === 0 && (
            <p className="py-12 text-center text-sm text-muted">
              No cards match these filters.
            </p>
          )}
        </div>
      </DndContext>

      {openCard && <CardDetail cardId={openCard} onClose={() => setOpenCard(null)} />}
    </div>
  );
}

function Swimlane({
  lane,
  leadPerson,
  cards,
  personById,
  onOpen,
  onAdd,
}: {
  lane: Lane;
  leadPerson?: Person;
  cards: WorkCard[];
  personById: Map<string, Person>;
  onOpen: (id: string) => void;
  onAdd: (column: WorkColumn, title: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <section className="rounded-md border border-border bg-surface/40">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <span className="text-muted">{collapsed ? "▸" : "▾"}</span>
        {leadPerson && <PersonAvatar person={leadPerson} size={18} />}
        <h3 className="text-sm font-medium">{lane.label}</h3>
        <span className="text-xs text-muted">{cards.length}</span>
      </button>
      {!collapsed && (
        <div className="grid gap-3 p-3 pt-0 md:grid-cols-2 xl:grid-cols-4">
          {WORK_COLUMNS.map((col) => (
            <ColumnCell
              key={col.id}
              laneId={lane.id}
              column={col.id}
              label={col.label}
              cards={cards.filter((c) => c.column === col.id)}
              personById={personById}
              onOpen={onOpen}
              onAdd={(title) => onAdd(col.id, title)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ColumnCell({
  laneId,
  column,
  label,
  cards,
  personById,
  onOpen,
  onAdd,
}: {
  laneId: string;
  column: WorkColumn;
  label: string;
  cards: WorkCard[];
  personById: Map<string, Person>;
  onOpen: (id: string) => void;
  onAdd: (title: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${laneId}::${column}` });
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  return (
    <div
      ref={setNodeRef}
      className={`rounded-md border p-2 transition-colors ${
        isOver ? "border-primary bg-warm/40" : "border-border/70 bg-background/40"
      }`}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted">{label}</span>
        <span className="text-[10px] text-muted">{cards.length}</span>
      </div>
      <div className="space-y-2">
        {cards.map((c) => (
          <BoardCard key={c.id} card={c} personById={personById} onOpen={() => onOpen(c.id)} />
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
          className="mt-1 w-full px-1 py-1 text-left text-[11px] text-muted hover:text-foreground"
        >
          + Add
        </button>
      )}
    </div>
  );
}

function BoardCard({
  card,
  personById,
  onOpen,
}: {
  card: WorkCard;
  personById: Map<string, Person>;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  });
  const owners = card.ownerIds.map((id) => personById.get(id)).filter((p): p is Person => !!p);
  const priority = CARD_PRIORITIES.find((p) => p.id === card.priority);
  const subDone = card.subtasks.filter((s) => s.done).length;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      className="touch-none cursor-pointer rounded-[6px] border border-border bg-surface px-2.5 py-2 active:cursor-grabbing"
    >
      <div className="flex items-start gap-1.5">
        {card.priority !== "none" && (
          <span
            className="mt-1 size-2 shrink-0 rounded-full"
            style={{ backgroundColor: priority?.color }}
            title={priority?.label}
          />
        )}
        <p className="text-sm font-medium leading-snug">{card.title}</p>
      </div>

      {card.labels.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {card.labels.map((l) => (
            <span
              key={l}
              className="rounded-full border border-border bg-background px-1.5 py-px text-[10px] text-muted"
            >
              {l}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] text-muted">
          {card.dueDate && <span>{card.dueDate}</span>}
          {card.subtasks.length > 0 && (
            <span>
              ✓ {subDone}/{card.subtasks.length}
            </span>
          )}
        </div>
        {owners.length > 0 && <AvatarStack people={owners} size={20} />}
      </div>
    </div>
  );
}

// A fresh card seeded so it lands in the lane it was created in.
function blankCard(
  title: string,
  column: WorkColumn,
  lane: Lane,
  groupBy: GroupBy,
  fallbackDept: string,
): Omit<WorkCard, "id"> {
  const departmentId =
    groupBy === "department" && lane.id !== "__all__" ? lane.id : fallbackDept;
  const ownerIds = groupBy === "owner" && lane.id !== NONE ? [lane.id] : [];
  const initiativeId = groupBy === "initiative" && lane.id !== NONE ? lane.id : null;
  return {
    departmentId,
    column,
    title,
    description: "",
    assigneeId: ownerIds[0] ?? null,
    ownerIds,
    taggedIds: [],
    initiativeId,
    priority: "none",
    labels: [],
    startDate: null,
    dueDate: null,
    subtasks: [],
    comments: [],
  };
}
