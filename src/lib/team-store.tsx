"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  SEED_DATA,
  type Department,
  type Initiative,
  type Person,
  type TeamData,
  type WeeklyGoal,
  type WorkCard,
} from "./team";

// Client-side store for Team Tracking. Seeded from SEED_DATA, persisted to
// localStorage so adds/edits stick as you navigate.
// TODO(team-backend): swap the load/save for sayhii-core fetches; the action
// signatures below stay identical so views don't change.

const KEY = "sayhii-team-v1";
const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

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

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<TeamData>(SEED_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setData(JSON.parse(raw) as TeamData);
    } catch {
      // ignore corrupt storage
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // ignore quota/serialization errors
    }
  }, [data, ready]);

  const mut = (fn: (d: TeamData) => TeamData) => setData((prev) => fn(prev));

  const value: Ctx = {
    data,
    ready,
    addDepartment: (name) =>
      mut((d) => ({ ...d, departments: [...d.departments, { id: uid(), name }] })),
    renameDepartment: (id, name) =>
      mut((d) => ({
        ...d,
        departments: d.departments.map((x) => (x.id === id ? { ...x, name } : x)),
      })),
    addPerson: (p) => mut((d) => ({ ...d, people: [...d.people, { ...p, id: uid() }] })),
    updatePerson: (id, patch) =>
      mut((d) => ({
        ...d,
        people: d.people.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
    deletePerson: (id) =>
      mut((d) => ({
        ...d,
        people: d.people.filter((x) => x.id !== id),
        goals: d.goals.filter((g) => g.personId !== id),
        cards: d.cards.map((c) => (c.assigneeId === id ? { ...c, assigneeId: null } : c)),
        initiatives: d.initiatives.map((i) =>
          i.ownerId === id ? { ...i, ownerId: "" } : i,
        ),
      })),
    addGoal: (g) => mut((d) => ({ ...d, goals: [...d.goals, { ...g, id: uid() }] })),
    updateGoal: (id, patch) =>
      mut((d) => ({
        ...d,
        goals: d.goals.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
    deleteGoal: (id) => mut((d) => ({ ...d, goals: d.goals.filter((x) => x.id !== id) })),
    addInitiative: (i) =>
      mut((d) => ({ ...d, initiatives: [...d.initiatives, { ...i, id: uid() }] })),
    updateInitiative: (id, patch) =>
      mut((d) => ({
        ...d,
        initiatives: d.initiatives.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
    deleteInitiative: (id) =>
      mut((d) => ({
        ...d,
        initiatives: d.initiatives.filter((x) => x.id !== id),
        cards: d.cards.map((c) => (c.initiativeId === id ? { ...c, initiativeId: null } : c)),
      })),
    addCard: (c) => mut((d) => ({ ...d, cards: [...d.cards, { ...c, id: uid() }] })),
    updateCard: (id, patch) =>
      mut((d) => ({
        ...d,
        cards: d.cards.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
    deleteCard: (id) => mut((d) => ({ ...d, cards: d.cards.filter((x) => x.id !== id) })),
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam(): Ctx {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used within TeamProvider");
  return ctx;
}
