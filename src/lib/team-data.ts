import "server-only";
import { asc } from "drizzle-orm";
import { db, isDbConfigured } from "@/db";
import {
  departments,
  people,
  weeklyGoals,
  initiatives,
  initiativeDepartments,
  workCards,
  workCardPeople,
  workCardSubtasks,
  workCardComments,
} from "@/db/schema";
import { SEED_DATA, type TeamData, type Subtask, type CardComment, type Person, type TeamRole } from "./team";
import { getStaff } from "./admin-auth";

// Always-admins, independent of any people row, so the team can be bootstrapped
// before anyone has been added. Lowercase emails.
const BOOTSTRAP_ADMINS = new Set(["michael.bomhoff@sayhii.io", "dev@sayhii.io"]);

export type TeamIdentity = {
  email: string;
  name: string;
  personId: string | null; // the people row that is "me", if any
  role: TeamRole;
  isAdmin: boolean;
};

// Resolves the signed-in staffer to their Team Tracking person + role.
export async function getTeamIdentity(people: Person[]): Promise<TeamIdentity | null> {
  const staff = await getStaff();
  if (!staff) return null;
  const email = staff.email.toLowerCase();
  const row = people.find((p) => p.email.toLowerCase() === email && p.active);
  const bootstrap = BOOTSTRAP_ADMINS.has(email);
  const role: TeamRole = bootstrap ? "admin" : row?.accessRole ?? "member";
  return {
    email,
    name: row?.name ?? staff.name,
    personId: row?.id ?? null,
    role,
    isAdmin: role === "admin",
  };
}

// Loads the full Team Tracking dataset from Postgres. Falls back to seed data
// if the DB isn't configured (so the app still renders).
export async function getTeamData(): Promise<TeamData> {
  if (!isDbConfigured) return SEED_DATA;

  const [deps, ppl, goals, inits, initDeps, cards, cardPeople, subtasks, comments] =
    await Promise.all([
      db.select().from(departments),
      db.select().from(people),
      db.select().from(weeklyGoals),
      db.select().from(initiatives),
      db.select().from(initiativeDepartments),
      db.select().from(workCards),
      db.select().from(workCardPeople),
      db.select().from(workCardSubtasks).orderBy(asc(workCardSubtasks.position)),
      db.select().from(workCardComments).orderBy(asc(workCardComments.createdAt)),
    ]);

  const deptsByInit = new Map<string, string[]>();
  for (const row of initDeps) {
    const arr = deptsByInit.get(row.initiativeId) ?? [];
    arr.push(row.departmentId);
    deptsByInit.set(row.initiativeId, arr);
  }

  const ownersByCard = new Map<string, string[]>();
  const taggedByCard = new Map<string, string[]>();
  for (const row of cardPeople) {
    const map = row.role === "tagged" ? taggedByCard : ownersByCard;
    const arr = map.get(row.cardId) ?? [];
    arr.push(row.personId);
    map.set(row.cardId, arr);
  }

  const subtasksByCard = new Map<string, Subtask[]>();
  for (const s of subtasks) {
    const arr = subtasksByCard.get(s.cardId) ?? [];
    arr.push({ id: s.id, text: s.text, done: s.done });
    subtasksByCard.set(s.cardId, arr);
  }

  const commentsByCard = new Map<string, CardComment[]>();
  for (const c of comments) {
    const arr = commentsByCard.get(c.cardId) ?? [];
    arr.push({
      id: c.id,
      authorName: c.authorName,
      authorEmail: c.authorEmail,
      body: c.body,
      createdAtLabel: c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
    commentsByCard.set(c.cardId, arr);
  }

  return {
    departments: deps.map((d) => ({ id: d.id, name: d.name })),
    people: ppl.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      role: p.role,
      color: p.color,
      photoUrl: p.photoUrl,
      departmentId: p.departmentId ?? "",
      accessRole: p.accessRole,
      active: p.active,
    })),
    goals: goals.map((g) => ({
      id: g.id,
      personId: g.personId,
      type: g.type,
      text: g.text,
      status: g.status,
      weekOf: g.weekOf,
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
    cards: cards.map((c) => {
      const ownerIds = ownersByCard.get(c.id) ?? (c.assigneeId ? [c.assigneeId] : []);
      return {
        id: c.id,
        departmentId: c.departmentId,
        column: c.column,
        title: c.title,
        description: c.description,
        assigneeId: c.assigneeId,
        ownerIds,
        taggedIds: taggedByCard.get(c.id) ?? [],
        initiativeId: c.initiativeId,
        priority: c.priority,
        labels: c.labels,
        startDate: c.startDate,
        dueDate: c.dueDate,
        subtasks: subtasksByCard.get(c.id) ?? [],
        comments: commentsByCard.get(c.id) ?? [],
      };
    }),
  };
}
