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
};

const TeamContext = createContext<Ctx | null>(null);

export function TeamProvider({
  initialData,
  children,
}: {
  initialData: TeamData;
  children: React.ReactNode;
}) {
  const [data, setData] = useState<TeamData>(initialData);
  const mut = (fn: (d: TeamData) => TeamData) => setData((prev) => fn(prev));

  const value: Ctx = {
    data,
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
        cards: d.cards.map((c) => (c.assigneeId === id ? { ...c, assigneeId: null } : c)),
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
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam(): Ctx {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used within TeamProvider");
  return ctx;
}
