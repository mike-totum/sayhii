"use client";

import { createContext, useContext, useState } from "react";
import type {
  Department,
  Initiative,
  Person,
  TeamData,
  WeeklyGoal,
  WorkCard,
} from "./team";
import type { TeamIdentity } from "./team-data";
import {
  createDepartment,
  renameDepartmentAction,
  createPerson,
  updatePersonAction,
  deletePersonAction,
  createGoal,
  updateGoalAction,
  deleteGoalAction,
  createInitiative,
  updateInitiativeAction,
  deleteInitiativeAction,
  createCard,
  updateCardAction,
  deleteCardAction,
  addSubtaskAction,
  updateSubtaskAction,
  deleteSubtaskAction,
  addCommentAction,
} from "./team-actions";

// Postgres-backed store: state is seeded from server data, mutations update
// optimistically and persist via server actions. The useTeam() API is
// unchanged from the prior localStorage version, so views didn't change.

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const persist = (p: Promise<unknown>) =>
  p.catch((e) => console.error("[team] persist failed", e));

type Ctx = {
  data: TeamData;
  me: TeamIdentity | null;
  ready: boolean;
  addDepartment: (name: string) => void;
  renameDepartment: (id: string, name: string) => void;
  addPerson: (p: Omit<Person, "id">) => void;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  addGoal: (g: Omit<WeeklyGoal, "id">) => void;
  updateGoal: (id: string, patch: Partial<WeeklyGoal>) => void;
  deleteGoal: (id: string) => void;
  addInitiative: (i: Omit<Initiative, "id">) => void;
  updateInitiative: (id: string, patch: Partial<Initiative>) => void;
  deleteInitiative: (id: string) => void;
  addCard: (c: Omit<WorkCard, "id">) => void;
  updateCard: (id: string, patch: Partial<WorkCard>) => void;
  deleteCard: (id: string) => void;
  addSubtask: (cardId: string, text: string) => void;
  toggleSubtask: (cardId: string, subtaskId: string, done: boolean) => void;
  updateSubtask: (cardId: string, subtaskId: string, text: string) => void;
  deleteSubtask: (cardId: string, subtaskId: string) => void;
  addComment: (cardId: string, body: string) => void;
};

const TeamContext = createContext<Ctx | null>(null);

export function TeamProvider({
  initialData,
  me = null,
  children,
}: {
  initialData: TeamData;
  me?: TeamIdentity | null;
  children: React.ReactNode;
}) {
  const [data, setData] = useState<TeamData>(initialData);
  const mut = (fn: (d: TeamData) => TeamData) => setData((prev) => fn(prev));

  const value: Ctx = {
    data,
    me,
    ready: true,

    addDepartment: (name) => {
      const dep: Department = { id: uid(), name };
      mut((d) => ({ ...d, departments: [...d.departments, dep] }));
      persist(createDepartment(dep));
    },
    renameDepartment: (id, name) => {
      mut((d) => ({
        ...d,
        departments: d.departments.map((x) => (x.id === id ? { ...x, name } : x)),
      }));
      persist(renameDepartmentAction(id, name));
    },

    addPerson: (p) => {
      const person: Person = { ...p, id: uid() };
      mut((d) => ({ ...d, people: [...d.people, person] }));
      persist(createPerson(person));
    },
    updatePerson: (id, patch) => {
      mut((d) => ({
        ...d,
        people: d.people.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      }));
      persist(updatePersonAction(id, patch));
    },
    deletePerson: (id) => {
      mut((d) => ({
        ...d,
        people: d.people.filter((x) => x.id !== id),
        goals: d.goals.filter((g) => g.personId !== id),
        cards: d.cards.map((c) => ({
          ...c,
          assigneeId: c.assigneeId === id ? null : c.assigneeId,
          ownerIds: c.ownerIds.filter((o) => o !== id),
          taggedIds: c.taggedIds.filter((t) => t !== id),
        })),
        initiatives: d.initiatives.map((i) => (i.ownerId === id ? { ...i, ownerId: "" } : i)),
      }));
      persist(deletePersonAction(id));
    },

    addGoal: (g) => {
      const goal: WeeklyGoal = { ...g, id: uid() };
      mut((d) => ({ ...d, goals: [...d.goals, goal] }));
      persist(createGoal(goal));
    },
    updateGoal: (id, patch) => {
      mut((d) => ({
        ...d,
        goals: d.goals.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      }));
      persist(updateGoalAction(id, patch));
    },
    deleteGoal: (id) => {
      mut((d) => ({ ...d, goals: d.goals.filter((x) => x.id !== id) }));
      persist(deleteGoalAction(id));
    },

    addInitiative: (i) => {
      const initiative: Initiative = { ...i, id: uid() };
      mut((d) => ({ ...d, initiatives: [...d.initiatives, initiative] }));
      persist(createInitiative(initiative));
    },
    updateInitiative: (id, patch) => {
      mut((d) => ({
        ...d,
        initiatives: d.initiatives.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      }));
      persist(updateInitiativeAction(id, patch));
    },
    deleteInitiative: (id) => {
      mut((d) => ({
        ...d,
        initiatives: d.initiatives.filter((x) => x.id !== id),
        cards: d.cards.map((c) => (c.initiativeId === id ? { ...c, initiativeId: null } : c)),
      }));
      persist(deleteInitiativeAction(id));
    },

    addCard: (c) => {
      const card: WorkCard = { ...c, id: uid() };
      mut((d) => ({ ...d, cards: [...d.cards, card] }));
      persist(createCard(card));
    },
    updateCard: (id, patch) => {
      mut((d) => ({
        ...d,
        cards: d.cards.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      }));
      persist(updateCardAction(id, patch));
    },
    deleteCard: (id) => {
      mut((d) => ({ ...d, cards: d.cards.filter((x) => x.id !== id) }));
      persist(deleteCardAction(id));
    },

    addSubtask: (cardId, text) => {
      const sub = { id: uid(), text, done: false };
      let position = 0;
      mut((d) => ({
        ...d,
        cards: d.cards.map((c) => {
          if (c.id !== cardId) return c;
          position = c.subtasks.length;
          return { ...c, subtasks: [...c.subtasks, sub] };
        }),
      }));
      persist(addSubtaskAction(cardId, sub.id, text, position));
    },
    toggleSubtask: (cardId, subtaskId, done) => {
      mut((d) => ({
        ...d,
        cards: d.cards.map((c) =>
          c.id === cardId
            ? { ...c, subtasks: c.subtasks.map((s) => (s.id === subtaskId ? { ...s, done } : s)) }
            : c,
        ),
      }));
      persist(updateSubtaskAction(subtaskId, { done }));
    },
    updateSubtask: (cardId, subtaskId, text) => {
      mut((d) => ({
        ...d,
        cards: d.cards.map((c) =>
          c.id === cardId
            ? { ...c, subtasks: c.subtasks.map((s) => (s.id === subtaskId ? { ...s, text } : s)) }
            : c,
        ),
      }));
      persist(updateSubtaskAction(subtaskId, { text }));
    },
    deleteSubtask: (cardId, subtaskId) => {
      mut((d) => ({
        ...d,
        cards: d.cards.map((c) =>
          c.id === cardId
            ? { ...c, subtasks: c.subtasks.filter((s) => s.id !== subtaskId) }
            : c,
        ),
      }));
      persist(deleteSubtaskAction(subtaskId));
    },
    addComment: (cardId, body) => {
      const comment = {
        id: uid(),
        authorName: "You",
        authorEmail: "",
        body,
        createdAtLabel: "now",
      };
      mut((d) => ({
        ...d,
        cards: d.cards.map((c) =>
          c.id === cardId ? { ...c, comments: [...c.comments, comment] } : c,
        ),
      }));
      persist(addCommentAction(cardId, comment.id, body));
    },
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam(): Ctx {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used within TeamProvider");
  return ctx;
}
