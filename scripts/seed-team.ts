// One-off seed for Team Tracking demo data. Run:
//   npx dotenv-cli -e .env.local -- npx tsx scripts/seed-team.ts
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  departments,
  people,
  weeklyGoals,
  initiatives,
  initiativeDepartments,
  workCards,
} from "../src/db/schema";
import { SEED_DATA } from "../src/lib/team";

const db = drizzle(neon(process.env.DATABASE_URL!));

async function main() {
  const dep = new Map(SEED_DATA.departments.map((d) => [d.id, randomUUID()]));
  const per = new Map(SEED_DATA.people.map((p) => [p.id, randomUUID()]));
  const ini = new Map(SEED_DATA.initiatives.map((i) => [i.id, randomUUID()]));

  await db.insert(departments).values(
    SEED_DATA.departments.map((d) => ({ id: dep.get(d.id)!, name: d.name })),
  );
  await db.insert(people).values(
    SEED_DATA.people.map((p) => ({
      id: per.get(p.id)!,
      name: p.name,
      email: p.email,
      role: p.role,
      departmentId: dep.get(p.departmentId) ?? null,
    })),
  );
  await db.insert(weeklyGoals).values(
    SEED_DATA.goals.map((g) => ({
      id: randomUUID(),
      personId: per.get(g.personId)!,
      type: g.type,
      text: g.text,
      status: g.status,
    })),
  );
  await db.insert(initiatives).values(
    SEED_DATA.initiatives.map((i) => ({
      id: ini.get(i.id)!,
      title: i.title,
      ownerId: per.get(i.ownerId) ?? null,
      status: i.status,
      targetDate: i.targetDate,
      progress: i.progress,
      summary: i.summary,
    })),
  );
  const links = SEED_DATA.initiatives.flatMap((i) =>
    i.departmentIds.map((d) => ({ initiativeId: ini.get(i.id)!, departmentId: dep.get(d)! })),
  );
  if (links.length) await db.insert(initiativeDepartments).values(links);
  await db.insert(workCards).values(
    SEED_DATA.cards.map((c) => ({
      id: randomUUID(),
      departmentId: dep.get(c.departmentId)!,
      column: c.column,
      title: c.title,
      description: c.description,
      assigneeId: c.assigneeId ? per.get(c.assigneeId) ?? null : null,
      initiativeId: c.initiativeId ? ini.get(c.initiativeId) ?? null : null,
      dueDate: c.dueDate,
    })),
  );

  console.log("seeded:", {
    departments: SEED_DATA.departments.length,
    people: SEED_DATA.people.length,
    goals: SEED_DATA.goals.length,
    initiatives: SEED_DATA.initiatives.length,
    cards: SEED_DATA.cards.length,
  });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
