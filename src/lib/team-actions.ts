"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
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
import { getStaff } from "./admin-auth";
import type { Department, Initiative, Person, WeeklyGoal, WorkCard } from "./team";

// Adds carry a client-generated uuid so optimistic UI and DB agree.

export async function createDepartment(d: Department) {
  await db.insert(departments).values({ id: d.id, name: d.name });
}
export async function renameDepartmentAction(id: string, name: string) {
  await db.update(departments).set({ name }).where(eq(departments.id, id));
}

export async function createPerson(p: Person) {
  await db.insert(people).values({
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role,
    color: p.color,
    departmentId: p.departmentId || null,
  });
}
export async function updatePersonAction(id: string, patch: Partial<Person>) {
  const set: Record<string, unknown> = {};
  if (patch.name !== undefined) set.name = patch.name;
  if (patch.email !== undefined) set.email = patch.email;
  if (patch.role !== undefined) set.role = patch.role;
  if (patch.color !== undefined) set.color = patch.color;
  if (patch.departmentId !== undefined) set.departmentId = patch.departmentId || null;
  if (Object.keys(set).length) await db.update(people).set(set).where(eq(people.id, id));
}
export async function deletePersonAction(id: string) {
  await db.delete(people).where(eq(people.id, id));
}

export async function createGoal(g: WeeklyGoal) {
  await db.insert(weeklyGoals).values({
    id: g.id,
    personId: g.personId,
    type: g.type,
    text: g.text,
    status: g.status,
  });
}
export async function updateGoalAction(id: string, patch: Partial<WeeklyGoal>) {
  const set: Record<string, unknown> = {};
  if (patch.text !== undefined) set.text = patch.text;
  if (patch.status !== undefined) set.status = patch.status;
  if (patch.type !== undefined) set.type = patch.type;
  if (Object.keys(set).length) await db.update(weeklyGoals).set(set).where(eq(weeklyGoals.id, id));
}
export async function deleteGoalAction(id: string) {
  await db.delete(weeklyGoals).where(eq(weeklyGoals.id, id));
}

export async function createInitiative(i: Initiative) {
  await db.insert(initiatives).values({
    id: i.id,
    title: i.title,
    ownerId: i.ownerId || null,
    status: i.status,
    targetDate: i.targetDate,
    progress: i.progress,
    summary: i.summary,
  });
  if (i.departmentIds.length) {
    await db
      .insert(initiativeDepartments)
      .values(i.departmentIds.map((departmentId) => ({ initiativeId: i.id, departmentId })));
  }
}
export async function updateInitiativeAction(id: string, patch: Partial<Initiative>) {
  const set: Record<string, unknown> = {};
  if (patch.title !== undefined) set.title = patch.title;
  if (patch.ownerId !== undefined) set.ownerId = patch.ownerId || null;
  if (patch.status !== undefined) set.status = patch.status;
  if (patch.targetDate !== undefined) set.targetDate = patch.targetDate;
  if (patch.progress !== undefined) set.progress = patch.progress;
  if (patch.summary !== undefined) set.summary = patch.summary;
  if (Object.keys(set).length) {
    await db.update(initiatives).set(set).where(eq(initiatives.id, id));
  }
  if (patch.departmentIds !== undefined) {
    await db.delete(initiativeDepartments).where(eq(initiativeDepartments.initiativeId, id));
    if (patch.departmentIds.length) {
      await db
        .insert(initiativeDepartments)
        .values(patch.departmentIds.map((departmentId) => ({ initiativeId: id, departmentId })));
    }
  }
}
export async function deleteInitiativeAction(id: string) {
  await db.delete(initiatives).where(eq(initiatives.id, id));
}

// ---- work cards -----------------------------------------------------------

export async function createCard(c: WorkCard) {
  await db.insert(workCards).values({
    id: c.id,
    departmentId: c.departmentId,
    column: c.column,
    title: c.title,
    description: c.description,
    assigneeId: c.ownerIds[0] ?? c.assigneeId ?? null,
    initiativeId: c.initiativeId,
    priority: c.priority,
    labels: c.labels,
    startDate: c.startDate,
    dueDate: c.dueDate,
  });
  await writeCardPeople(c.id, c.ownerIds, c.taggedIds);
}

export async function updateCardAction(id: string, patch: Partial<WorkCard>) {
  const set: Record<string, unknown> = {};
  if (patch.column !== undefined) set.column = patch.column;
  if (patch.title !== undefined) set.title = patch.title;
  if (patch.description !== undefined) set.description = patch.description;
  if (patch.initiativeId !== undefined) set.initiativeId = patch.initiativeId;
  if (patch.departmentId !== undefined) set.departmentId = patch.departmentId;
  if (patch.priority !== undefined) set.priority = patch.priority;
  if (patch.labels !== undefined) set.labels = patch.labels;
  if (patch.startDate !== undefined) set.startDate = patch.startDate;
  if (patch.dueDate !== undefined) set.dueDate = patch.dueDate;
  // Keep the legacy single assignee mirroring the first owner for old views.
  if (patch.ownerIds !== undefined) set.assigneeId = patch.ownerIds[0] ?? null;
  if (Object.keys(set).length) await db.update(workCards).set(set).where(eq(workCards.id, id));

  if (patch.ownerIds !== undefined || patch.taggedIds !== undefined) {
    await writeCardPeople(id, patch.ownerIds, patch.taggedIds);
  }
}

export async function deleteCardAction(id: string) {
  await db.delete(workCards).where(eq(workCards.id, id));
}

// Replace the owner and/or tagged sets for a card (only the roles provided).
async function writeCardPeople(cardId: string, ownerIds?: string[], taggedIds?: string[]) {
  if (ownerIds !== undefined) {
    await db
      .delete(workCardPeople)
      .where(and(eq(workCardPeople.cardId, cardId), eq(workCardPeople.role, "owner")));
    if (ownerIds.length) {
      await db.insert(workCardPeople).values(
        ownerIds.map((personId) => ({ cardId, personId, role: "owner" as const })),
      );
    }
  }
  if (taggedIds !== undefined) {
    await db
      .delete(workCardPeople)
      .where(and(eq(workCardPeople.cardId, cardId), eq(workCardPeople.role, "tagged")));
    if (taggedIds.length) {
      await db.insert(workCardPeople).values(
        taggedIds.map((personId) => ({ cardId, personId, role: "tagged" as const })),
      );
    }
  }
}

// ---- subtasks -------------------------------------------------------------

export async function addSubtaskAction(cardId: string, id: string, text: string, position: number) {
  await db.insert(workCardSubtasks).values({ id, cardId, text, position });
}
export async function updateSubtaskAction(id: string, patch: { text?: string; done?: boolean }) {
  const set: Record<string, unknown> = {};
  if (patch.text !== undefined) set.text = patch.text;
  if (patch.done !== undefined) set.done = patch.done;
  if (Object.keys(set).length) await db.update(workCardSubtasks).set(set).where(eq(workCardSubtasks.id, id));
}
export async function deleteSubtaskAction(id: string) {
  await db.delete(workCardSubtasks).where(eq(workCardSubtasks.id, id));
}

// ---- comments -------------------------------------------------------------

export async function addCommentAction(cardId: string, id: string, body: string) {
  const staff = await getStaff();
  if (!staff) return;
  await db.insert(workCardComments).values({
    id,
    cardId,
    authorName: staff.name,
    authorEmail: staff.email,
    body,
  });
}
export async function deleteCommentAction(id: string) {
  await db.delete(workCardComments).where(eq(workCardComments.id, id));
}
