"use client";

import { useMemo, useState } from "react";
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
import {
  WORK_COLUMNS,
  CARD_PRIORITIES,
  INITIATIVE_STATUSES,
  type Initiative,
  type InitiativeStatus,
  type Person,
  type WorkCard,
  type WorkColumn,
} from "@/lib/team";
import { PersonAvatar, AvatarStack } from "./person-chip";
import { CardDetail } from "./card-detail";

// WORK — epics ▸ issues, with a Trello twist. Pick an epic to focus, then work
// the issues as a Board (drag across columns) or a List (dense, Jira-style).

type GroupBy = "initiative" | "department" | "owner" | "none";
const GROUP_OPTIONS: { id: GroupBy; label: string }[] = [
  { id: "owner", label: "Person" },
  { id: "initiative", label: "Epic" },
  { id: "department", label: "Department" },
  { id: "none", label: "None" },
];
const NONE = "__none__";
type View = "board" | "list";
type Lane = { id: string; label: string };

const STATUS_TONE: Record<InitiativeStatus, string> = {
  not_started: "bg-white/50 text-muted",
  on_track: "bg-accent-soft/80 text-accent",
  at_risk: "bg-primary/12 text-primary",
  done: "bg-warm/80 text-foreground",
};

export function WorkBoard() {
  const { locale } = useParams<{ locale: string }>();
  const { data, me, addCard, updateCard, addInitiative } = useTeam();
  const myId = me?.personId ?? null;
  const isAdmin = !!me?.isAdmin;
  const [view, setView] = useState<View>("board");
  const [groupBy, setGroupBy] = useState<GroupBy>("owner");
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState<string[]>([]);
  const [deptFilter, setDeptFilter] = useState("");
  const [priority, setPriority] = useState("");
  const [epicFocus, setEpicFocus] = useState<string | null>(null);
  const [openCard, setOpenCard] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const personById = useMemo(
    () => new Map(data.people.map((p) => [p.id, p])),
    [data.people],
  );

  // A task's department follows its owner (the person), falling back to any
  // stored department. So filtering by dept catches everyone in that dept.
  const deptOfCard = (c: WorkCard): string | null => {
    const owner = c.ownerIds[0] ? personById.get(c.ownerIds[0]) : undefined;
    return owner?.departmentId || c.departmentId || null;
  };

  const q = search.trim().toLowerCase();
  const filtered = data.cards.filter((c) => {
    if (epicFocus && c.initiativeId !== epicFocus) return false;
    if (q && !c.title.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q))
      return false;
    if (deptFilter && deptOfCard(c) !== deptFilter) return false;
    if (priority && c.priority !== priority) return false;
    if (people.length) {
      const onCard = new Set([...c.ownerIds, ...c.taggedIds]);
      if (!people.some((id) => onCard.has(id))) return false;
    }
    return true;
  });

  // When focused on one epic, drop the swimlanes — show a single flat lane.
  const effectiveGroup: GroupBy = epicFocus ? "none" : groupBy;

  const lanes: Lane[] = useMemo(() => {
    if (effectiveGroup === "department")
      return [
        ...data.departments.map((d) => ({ id: d.id, label: d.name })),
        { id: NONE, label: "No department" },
      ];
    if (effectiveGroup === "owner")
      return [
        ...data.people.filter((p) => p.active).map((p) => ({ id: p.id, label: p.name })),
        { id: NONE, label: "Unassigned" },
      ];
    if (effectiveGroup === "initiative")
      return [
        ...data.initiatives.map((i) => ({ id: i.id, label: i.title })),
        { id: NONE, label: "No epic" },
      ];
    return [{ id: "__all__", label: "All issues" }];
  }, [effectiveGroup, data.departments, data.people, data.initiatives]);

  function laneOfCard(c: WorkCard): string {
    if (effectiveGroup === "department") return deptOfCard(c) ?? NONE;
    if (effectiveGroup === "owner") return c.ownerIds[0] ?? NONE;
    if (effectiveGroup === "initiative") return c.initiativeId ?? NONE;
    return "__all__";
  }

  // Person + epic groupings always show every lane (so everyone has a lane);
  // the catch-all NONE lane only shows when it actually holds cards.
  const visibleLanes = lanes.filter((l) => {
    if (l.id === NONE) return filtered.some((c) => laneOfCard(c) === l.id);
    if (effectiveGroup === "owner" || effectiveGroup === "initiative") return true;
    return filtered.some((c) => laneOfCard(c) === l.id);
  });

  function onDragEnd(e: DragEndEvent) {
    if (!e.over) return;
    const cardId = String(e.active.id);
    const [laneId, column] = String(e.over.id).split("::") as [string, WorkColumn];
    const card = data.cards.find((c) => c.id === cardId);
    if (!card) return;
    const patch: Partial<WorkCard> = { column };
    if (effectiveGroup === "department") patch.departmentId = laneId === NONE ? null : laneId;
    if (effectiveGroup === "owner")
      patch.ownerIds = laneId === NONE ? [] : [laneId, ...card.ownerIds.filter((o) => o !== laneId)];
    if (effectiveGroup === "initiative") patch.initiativeId = laneId === NONE ? null : laneId;
    updateCard(cardId, patch);
  }

  const togglePerson = (id: string) =>
    setPeople((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const focusedEpic = epicFocus ? data.initiatives.find((i) => i.id === epicFocus) : null;
  const filtersActive =
    search !== "" || deptFilter !== "" || priority !== "" || people.length > 0;

  // Who can add into a lane: in the person view you add to your own lane (admins
  // anywhere); other groupings are admin-only.
  function canAddToLane(lane: Lane): boolean {
    if (effectiveGroup === "owner") return isAdmin || lane.id === myId;
    return isAdmin;
  }

  // A new task is owned by the lane's person (or you), and its department
  // follows that person — no need to pick an owner or a department.
  function newIssue(column: WorkColumn, lane: Lane) {
    let ownerIds: string[] = [];
    if (effectiveGroup === "owner" && lane.id !== NONE) ownerIds = [lane.id];
    else if (myId) ownerIds = [myId];

    const ownerDept = ownerIds[0] ? personById.get(ownerIds[0])?.departmentId || null : null;
    const departmentId =
      effectiveGroup === "department" && lane.id !== NONE && lane.id !== "__all__"
        ? lane.id
        : ownerDept;
    const initiativeId =
      epicFocus ?? (effectiveGroup === "initiative" && lane.id !== NONE ? lane.id : null);

    addCard({
      departmentId,
      column,
      title: "New task",
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
    });
  }

  return (
    <div>
      {/* ---- Epics rail ---- */}
      <EpicsRail
        initiatives={data.initiatives}
        cards={data.cards}
        personById={personById}
        focus={epicFocus}
        onFocus={(id) => setEpicFocus((cur) => (cur === id ? null : id))}
        onAdd={() =>
          addInitiative({
            title: "New epic",
            ownerId: data.people[0]?.id ?? "",
            departmentIds: [],
            status: "not_started",
            targetDate: "TBD",
            progress: 0,
            summary: "",
          })
        }
      />

      {focusedEpic && (
        <FocusedEpicHeader epic={focusedEpic} personById={personById} onClear={() => setEpicFocus(null)} />
      )}

      {/* ---- Toolbar ---- */}
      <div className="sticky top-0 z-20 -mx-1 mt-4 mb-4 flex flex-wrap items-center gap-2 rounded-xl px-1 py-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search issues…"
          className="h-8 w-44 rounded-full glass px-3 text-sm focus:outline-none"
        />
        <Select value={deptFilter} onChange={setDeptFilter}>
          <option value="">All departments</option>
          {data.departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
        <Select value={priority} onChange={setPriority}>
          <option value="">Any priority</option>
          {CARD_PRIORITIES.filter((p) => p.id !== "none").map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>

        <div className="flex items-center">
          {data.people.filter((p) => p.active).map((p, i) => (
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
          {filtersActive && (
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
          {!epicFocus && (
            <div className="flex items-center gap-1 rounded-full glass p-0.5">
              <span className="px-1.5 text-[11px] text-muted">Group</span>
              {GROUP_OPTIONS.map((g) => (
                <Seg key={g.id} active={groupBy === g.id} onClick={() => setGroupBy(g.id)}>
                  {g.label}
                </Seg>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1 rounded-full glass p-0.5">
            <Seg active={view === "board"} onClick={() => setView("board")}>
              Board
            </Seg>
            <Seg active={view === "list"} onClick={() => setView("list")}>
              List
            </Seg>
          </div>
        </div>
      </div>

      {/* ---- Issues ---- */}
      {data.people.filter((p) => p.active).length === 0 ? (
        <div className="rounded-2xl glass px-5 py-10 text-center">
          <p className="text-sm text-muted">
            Add people on the{" "}
            <Link href={`/${locale}/admin/team/people`} className="text-foreground underline">
              People
            </Link>{" "}
            tab first — each person gets their own lane.
          </p>
        </div>
      ) : view === "board" ? (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="space-y-4">
            {visibleLanes.map((lane) => (
              <Swimlane
                key={lane.id}
                lane={lane}
                leadPerson={effectiveGroup === "owner" ? personById.get(lane.id) : undefined}
                cards={filtered.filter((c) => laneOfCard(c) === lane.id)}
                personById={personById}
                canAdd={canAddToLane(lane)}
                onOpen={setOpenCard}
                onAdd={(column) => newIssue(column, lane)}
              />
            ))}
            {visibleLanes.length === 0 && <Empty />}
          </div>
        </DndContext>
      ) : (
        <ListView
          lanes={visibleLanes}
          group={effectiveGroup}
          cards={filtered}
          laneOfCard={laneOfCard}
          personById={personById}
          canAdd={canAddToLane}
          onOpen={setOpenCard}
          onStatus={(id, column) => updateCard(id, { column })}
          onAdd={(lane) => newIssue("backlog", lane)}
        />
      )}

      {openCard && <CardDetail cardId={openCard} onClose={() => setOpenCard(null)} />}
    </div>
  );
}

// ---- Epics rail -----------------------------------------------------------

function EpicsRail({
  initiatives,
  cards,
  personById,
  focus,
  onFocus,
  onAdd,
}: {
  initiatives: Initiative[];
  cards: WorkCard[];
  personById: Map<string, Person>;
  focus: string | null;
  onFocus: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-muted">Epics</h2>
        <button onClick={onAdd} className="text-xs text-muted hover:text-foreground">
          + Epic
        </button>
      </div>
      <div className="fade-x -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {initiatives.map((i) => {
          const owner = personById.get(i.ownerId);
          const issues = cards.filter((c) => c.initiativeId === i.id);
          const open = issues.filter((c) => c.column !== "done").length;
          const active = focus === i.id;
          return (
            <button
              key={i.id}
              onClick={() => onFocus(i.id)}
              className={`glass glass-hover w-60 shrink-0 rounded-2xl p-4 text-left ${
                active ? "ring-2 ring-foreground" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif text-base leading-tight tracking-tight">{i.title}</h3>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${STATUS_TONE[i.status]}`}>
                  {INITIATIVE_STATUSES.find((s) => s.id === i.status)?.label}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/50">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${i.progress}%` }} />
                </div>
                <span className="text-[11px] tabular-nums text-muted">{i.progress}%</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                <span className="flex items-center gap-1.5">
                  {owner ? <PersonAvatar person={owner} size={16} /> : null}
                  {owner?.name ?? "Unassigned"}
                </span>
                <span>{open} open</span>
              </div>
            </button>
          );
        })}
        {initiatives.length === 0 && (
          <p className="px-1 py-4 text-sm text-muted">No epics yet — add one to group issues.</p>
        )}
      </div>
    </div>
  );
}

function FocusedEpicHeader({
  epic,
  personById,
  onClear,
}: {
  epic: Initiative;
  personById: Map<string, Person>;
  onClear: () => void;
}) {
  const { locale } = useParams<{ locale: string }>();
  const owner = personById.get(epic.ownerId);
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl glass px-5 py-3">
      <div className="flex items-center gap-3">
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Epic</span>
        <h2 className="font-serif text-xl tracking-tight">{epic.title}</h2>
        {owner && (
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <PersonAvatar person={owner} size={16} /> {owner.name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs">
        <Link
          href={`/${locale}/admin/team/initiatives/${epic.id}`}
          className="text-muted hover:text-foreground"
        >
          Open epic →
        </Link>
        <button onClick={onClear} className="text-muted hover:text-foreground">
          ✕ Clear focus
        </button>
      </div>
    </div>
  );
}

// ---- Board (swimlanes) ----------------------------------------------------

function Swimlane({
  lane,
  leadPerson,
  cards,
  personById,
  canAdd,
  onOpen,
  onAdd,
}: {
  lane: Lane;
  leadPerson?: Person;
  cards: WorkCard[];
  personById: Map<string, Person>;
  canAdd: boolean;
  onOpen: (id: string) => void;
  onAdd: (column: WorkColumn) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <section className="rounded-2xl glass-well">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left"
      >
        <span className="text-muted">{collapsed ? "▸" : "▾"}</span>
        {leadPerson && <PersonAvatar person={leadPerson} size={18} />}
        <h3 className="text-sm font-medium">{lane.label}</h3>
        <span className="rounded-full bg-white/50 px-1.5 text-xs text-muted">{cards.length}</span>
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
              canAdd={canAdd}
              onOpen={onOpen}
              onAdd={() => onAdd(col.id)}
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
  canAdd,
  onOpen,
  onAdd,
}: {
  laneId: string;
  column: WorkColumn;
  label: string;
  cards: WorkCard[];
  personById: Map<string, Person>;
  canAdd: boolean;
  onOpen: (id: string) => void;
  onAdd: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${laneId}::${column}` });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-2 transition-colors ${
        isOver ? "bg-warm/60 ring-1 ring-primary/40" : "bg-white/30"
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
      {canAdd && (
        <button
          onClick={onAdd}
          className="mt-1 w-full px-1 py-1 text-left text-[11px] text-muted hover:text-foreground"
        >
          + Add task
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
      className="glass glass-hover touch-none cursor-pointer rounded-xl px-3 py-2.5 active:cursor-grabbing"
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
              className="rounded-full bg-white/60 px-1.5 py-px text-[10px] text-muted"
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

// ---- List view ------------------------------------------------------------

function ListView({
  lanes,
  group,
  cards,
  laneOfCard,
  personById,
  canAdd,
  onOpen,
  onStatus,
  onAdd,
}: {
  lanes: Lane[];
  group: GroupBy;
  cards: WorkCard[];
  laneOfCard: (c: WorkCard) => string;
  personById: Map<string, Person>;
  canAdd: (lane: Lane) => boolean;
  onOpen: (id: string) => void;
  onStatus: (id: string, column: WorkColumn) => void;
  onAdd: (lane: Lane) => void;
}) {
  if (!cards.length) return <Empty />;
  return (
    <div className="space-y-4">
      {lanes.map((lane) => {
        const rows = cards.filter((c) => laneOfCard(c) === lane.id);
        if (group !== "initiative" && rows.length === 0) return null;
        return (
          <section key={lane.id} className="overflow-hidden rounded-2xl glass">
            <div className="flex items-center justify-between border-b border-white/50 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">{lane.label}</h3>
                <span className="rounded-full bg-white/50 px-1.5 text-xs text-muted">{rows.length}</span>
              </div>
              {canAdd(lane) && (
                <button onClick={() => onAdd(lane)} className="text-xs text-muted hover:text-foreground">
                  + Task
                </button>
              )}
            </div>
            <div className="divide-y divide-white/40">
              {rows.map((c) => (
                <ListRow
                  key={c.id}
                  card={c}
                  personById={personById}
                  onOpen={() => onOpen(c.id)}
                  onStatus={(col) => onStatus(c.id, col)}
                />
              ))}
              {rows.length === 0 && (
                <p className="px-4 py-3 text-xs text-muted">No issues.</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ListRow({
  card,
  personById,
  onOpen,
  onStatus,
}: {
  card: WorkCard;
  personById: Map<string, Person>;
  onOpen: () => void;
  onStatus: (col: WorkColumn) => void;
}) {
  const owners = card.ownerIds.map((id) => personById.get(id)).filter((p): p is Person => !!p);
  const priority = CARD_PRIORITIES.find((p) => p.id === card.priority);
  return (
    <div className="flex items-center gap-3 px-4 py-2 hover:bg-white/40">
      {card.priority !== "none" ? (
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: priority?.color }}
          title={priority?.label}
        />
      ) : (
        <span className="size-2 shrink-0" />
      )}
      <button onClick={onOpen} className="min-w-0 flex-1 truncate text-left text-sm hover:text-primary">
        {card.title}
      </button>
      {card.dueDate && <span className="hidden shrink-0 text-xs text-muted sm:inline">{card.dueDate}</span>}
      {owners.length > 0 && <AvatarStack people={owners} size={18} />}
      <select
        value={card.column}
        onChange={(e) => onStatus(e.target.value as WorkColumn)}
        onClick={(e) => e.stopPropagation()}
        className="h-7 shrink-0 rounded-full border border-white/60 bg-white/50 px-2 text-xs focus:outline-none"
      >
        {WORK_COLUMNS.map((col) => (
          <option key={col.id} value={col.id}>
            {col.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ---- bits -----------------------------------------------------------------

function Empty() {
  return <p className="py-12 text-center text-sm text-muted">No issues match these filters.</p>;
}

function Seg({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
        active ? "bg-foreground text-background" : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-full glass px-3 text-sm focus:outline-none"
    >
      {children}
    </select>
  );
}

