import "server-only";
import { db, isDbConfigured } from "@/db";
import {
  departments,
  people,
  weeklyGoals,
  initiatives,
  initiativeDepartments,
  workCards,
} from "@/db/schema";
import { SEED_DATA, type TeamData } from "./team";

// Loads the full Team Tracking dataset from Postgres. Falls back to seed data
// if the DB isn't configured (so the app still renders).
export async function getTeamData(): Promise<TeamData> {
  if (!isDbConfigured) return SEED_DATA;

  const [deps, ppl, goals, inits, initDeps, cards] = await Promise.all([
    db.select().from(departments),
    db.select().from(people),
    db.select().from(weeklyGoals),
    db.select().from(initiatives),
    db.select().from(initiativeDepartments),
    db.select().from(workCards),
  ]);

  const deptsByInit = new Map<string, string[]>();
  for (const row of initDeps) {
    const arr = deptsByInit.get(row.initiativeId) ?? [];
    arr.push(row.departmentId);
    deptsByInit.set(row.initiativeId, arr);
  }

  return {
    departments: deps.map((d) => ({ id: d.id, name: d.name })),
    people: ppl.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      role: p.role,
      departmentId: p.departmentId ?? "",
    })),
    goals: goals.map((g) => ({
      id: g.id,
      personId: g.personId,
      type: g.type,
      text: g.text,
      status: g.status,
    })),
    initiatives: inits.map((i) => ({
      id: i.id,
      title: i.title,
      ownerId: i.ownerId ?? "",
      departmentIds: deptsByInit.get(i.id) ?? [],
      status: i.status,
      targetDate: i.targetDate,
      progress: i.progress,
      summary: i.summary,
    })),
    cards: cards.map((c) => ({
      id: c.id,
      departmentId: c.departmentId,
      column: c.column,
      title: c.title,
      description: c.description,
      assigneeId: c.assigneeId,
      initiativeId: c.initiativeId,
      dueDate: c.dueDate,
    })),
  };
}
