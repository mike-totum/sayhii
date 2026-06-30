// Team Tracking domain types, seed data, and pure selectors (admin module #2).
// Internal sayhii staff only. The live data + mutations are owned by the client
// store (team-store.tsx); this file holds types, the initial seed, and pure
// derivations. TODO(team-backend): seed/persist via sayhii-core endpoints.

export type Department = { id: string; name: string };

// Access role within the portal (distinct from `role`, which is a job title).
export type TeamRole = "admin" | "member";

export type Person = {
  id: string;
  name: string;
  email: string;
  role: string; // job title
  color: string; // hex; drives owner/tag chips across the board
  photoUrl?: string | null;
  departmentId: string;
  accessRole: TeamRole; // admin manages the team; member self-serves
  active: boolean; // deactivate instead of delete to keep history
};

// A spread of distinct, legible chip colors. New people cycle through these.
export const PERSON_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444",
  "#8b5cf6", "#14b8a6", "#f97316", "#06b6d4", "#84cc16", "#e11d48",
];

export type GoalType = "personal" | "professional";
export type GoalStatus = "on_track" | "done" | "missed";

export type WeeklyGoal = {
  id: string;
  personId: string;
  type: GoalType;
  text: string;
  status: GoalStatus; // on_track = set (this week); done = Hit; missed = Missed
  weekOf: string; // Monday of the goal's week, "YYYY-MM-DD"
};

export type InitiativeStatus = "not_started" | "on_track" | "at_risk" | "done";

export type Initiative = {
  id: string;
  title: string;
  ownerId: string;
  departmentIds: string[];
  status: InitiativeStatus;
  targetDate: string;
  progress: number; // 0-100
  summary: string;
};

export type WorkColumn = "backlog" | "in_progress" | "review" | "done";
export const WORK_COLUMNS: { id: WorkColumn; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "in_progress", label: "In progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

export type CardPriority = "none" | "low" | "medium" | "high" | "urgent";
export const CARD_PRIORITIES: { id: CardPriority; label: string; color: string }[] = [
  { id: "none", label: "No priority", color: "#9ca3af" },
  { id: "low", label: "Low", color: "#60a5fa" },
  { id: "medium", label: "Medium", color: "#f59e0b" },
  { id: "high", label: "High", color: "#f97316" },
  { id: "urgent", label: "Urgent", color: "#ef4444" },
];

export type Subtask = { id: string; text: string; done: boolean };
export type CardComment = {
  id: string;
  authorName: string;
  authorEmail: string;
  body: string;
  createdAtLabel: string;
};

export type WorkCard = {
  id: string;
  departmentId: string | null; // follows the owner's department; may be unset
  column: WorkColumn;
  title: string;
  description: string;
  assigneeId: string | null; // legacy; mirrors the first owner
  ownerIds: string[]; // responsible
  taggedIds: string[]; // collaborators / watchers / FYI
  initiativeId: string | null;
  priority: CardPriority;
  labels: string[];
  startDate: string | null;
  dueDate: string | null;
  subtasks: Subtask[];
  comments: CardComment[];
};

export const INITIATIVE_STATUSES: { id: InitiativeStatus; label: string }[] = [
  { id: "not_started", label: "Not started" },
  { id: "on_track", label: "On track" },
  { id: "at_risk", label: "At risk" },
  { id: "done", label: "Done" },
];

export const GOAL_STATUSES: { id: GoalStatus; label: string }[] = [
  { id: "on_track", label: "On track" },
  { id: "done", label: "Done" },
  { id: "missed", label: "Missed" },
];

// ---------------------------------------------------------------------------
// Week helpers. A "week" is keyed by its Monday as "YYYY-MM-DD". The weekly
// ritual: set this week's goals at the Monday meeting, grade last week's.
// ---------------------------------------------------------------------------

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function mondayOf(d: Date): string {
  const date = new Date(d);
  const day = date.getDay(); // 0 Sun .. 6 Sat
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  date.setHours(0, 0, 0, 0);
  return toISODate(date);
}

export function currentWeekMonday(): string {
  return mondayOf(new Date());
}

export function addWeeks(weekOf: string, n: number): string {
  const d = new Date(`${weekOf}T00:00:00`);
  d.setDate(d.getDate() + n * 7);
  return toISODate(d);
}

export function weekLabel(weekOf: string): string {
  const d = new Date(`${weekOf}T00:00:00`);
  return `Week of ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

// All the data the store holds.
export type TeamData = {
  departments: Department[];
  people: Person[];
  goals: WeeklyGoal[];
  initiatives: Initiative[];
  cards: WorkCard[];
};

// ---------------------------------------------------------------------------
// Seed (illustrative). Used only as a fallback when the DB isn't configured.
// ---------------------------------------------------------------------------

export const SEED_DEPARTMENTS: Department[] = [
  { id: "eng", name: "Engineering" },
  { id: "product", name: "Product & Design" },
  { id: "cs", name: "Customer Success" },
  { id: "gtm", name: "Go-to-Market" },
];

const seedPerson = (
  id: string, name: string, email: string, role: string, departmentId: string, i: number,
): Person => ({
  id, name, email, role, departmentId,
  color: PERSON_COLORS[i % PERSON_COLORS.length],
  accessRole: i === 0 ? "admin" : "member",
  active: true,
});

export const SEED_PEOPLE: Person[] = [
  seedPerson("p1", "Dana Lee", "dana@sayhii.io", "Eng Lead", "eng", 0),
  seedPerson("p2", "Sam Rivera", "sam@sayhii.io", "Engineer", "eng", 1),
  seedPerson("p3", "Wei Zhang", "wei@sayhii.io", "Engineer", "eng", 2),
  seedPerson("p4", "Priya Nair", "priya@sayhii.io", "Product Lead", "product", 3),
  seedPerson("p5", "Jordan Fox", "jordan@sayhii.io", "Designer", "product", 4),
  seedPerson("p6", "Matthew Cole", "matthew@sayhii.io", "Customer Success", "cs", 5),
  seedPerson("p7", "Tess Obi", "tess@sayhii.io", "CS Specialist", "cs", 6),
  seedPerson("p8", "Chris Park", "chris@sayhii.io", "Account Exec", "gtm", 7),
  seedPerson("p9", "Robin Diaz", "robin@sayhii.io", "Marketing", "gtm", 8),
];

const SEED_WK_NOW = currentWeekMonday();
const SEED_WK_PREV = addWeeks(SEED_WK_NOW, -1);
export const SEED_GOALS: WeeklyGoal[] = [
  // last week — graded
  { id: "g1", personId: "p1", type: "professional", text: "Ship the participation endpoint to dev", status: "done", weekOf: SEED_WK_PREV },
  { id: "g5", personId: "p4", type: "personal", text: "Run 3x", status: "missed", weekOf: SEED_WK_PREV },
  { id: "g7", personId: "p8", type: "professional", text: "Advance the Globex renewal", status: "missed", weekOf: SEED_WK_PREV },
  // this week — set
  { id: "g2", personId: "p1", type: "personal", text: "Leave by 5pm three days this week", status: "on_track", weekOf: SEED_WK_NOW },
  { id: "g3", personId: "p2", type: "professional", text: "Close out the notes table migration", status: "on_track", weekOf: SEED_WK_NOW },
  { id: "g4", personId: "p4", type: "professional", text: "Finalize Team Tracking spec", status: "on_track", weekOf: SEED_WK_NOW },
  { id: "g6", personId: "p6", type: "professional", text: "Onboard 2 new accounts", status: "on_track", weekOf: SEED_WK_NOW },
];

export const SEED_INITIATIVES: Initiative[] = [
  { id: "i1", title: "Internal admin portal", ownerId: "p1", departmentIds: ["eng", "cs"], status: "on_track", targetDate: "Aug 2026", progress: 55, summary: "Customer Lookup + Team Tracking modules." },
  { id: "i2", title: "k-anonymity reporting fix", ownerId: "p2", departmentIds: ["eng"], status: "at_risk", targetDate: "Jul 2026", progress: 30, summary: "Close the identity re-exposure in the reporting layer." },
  { id: "i3", title: "Q3 GTM push", ownerId: "p9", departmentIds: ["gtm"], status: "not_started", targetDate: "Sep 2026", progress: 0, summary: "Campaign + 5 target logos." },
  { id: "i4", title: "Mobile app launch", ownerId: "p4", departmentIds: ["product", "eng"], status: "on_track", targetDate: "Jul 2026", progress: 70, summary: "Expo build to the app stores." },
];

const seedCard = (c: Omit<WorkCard, "ownerIds" | "taggedIds" | "priority" | "labels" | "startDate" | "subtasks" | "comments"> &
  Partial<Pick<WorkCard, "ownerIds" | "taggedIds" | "priority" | "labels" | "subtasks">>): WorkCard => ({
  ownerIds: c.assigneeId ? [c.assigneeId] : [],
  taggedIds: [],
  priority: "none",
  labels: [],
  startDate: null,
  subtasks: [],
  comments: [],
  ...c,
});

export const SEED_WORK_CARDS: WorkCard[] = [
  seedCard({ id: "w1", departmentId: "eng", column: "in_progress", title: "Wire frontend to participation API", description: "", assigneeId: "p2", ownerIds: ["p2", "p1"], taggedIds: ["p4"], priority: "high", labels: ["backend"], initiativeId: "i1", dueDate: "Jul 5", subtasks: [{ id: "s1", text: "Add core-api client", done: true }, { id: "s2", text: "Wire detail card", done: false }] }),
  seedCard({ id: "w2", departmentId: "eng", column: "backlog", title: "Provision CustomerNote table", description: "", assigneeId: "p3", priority: "medium", initiativeId: "i1", dueDate: null }),
  seedCard({ id: "w3", departmentId: "eng", column: "review", title: "Participation endpoint PR", description: "", assigneeId: "p1", initiativeId: "i1", dueDate: null }),
  seedCard({ id: "w4", departmentId: "eng", column: "done", title: "Strip demo portal", description: "", assigneeId: "p1", initiativeId: "i1", dueDate: null }),
  seedCard({ id: "w5", departmentId: "eng", column: "backlog", title: "Rotate leaked Power BI secret", description: "", assigneeId: "p2", priority: "urgent", labels: ["security"], initiativeId: "i2", dueDate: "Jul 1" }),
  seedCard({ id: "w6", departmentId: "cs", column: "in_progress", title: "Globex renewal call", description: "", assigneeId: "p6", taggedIds: ["p8"], priority: "high", initiativeId: null, dueDate: "Jul 2" }),
  seedCard({ id: "w7", departmentId: "cs", column: "backlog", title: "Draft onboarding checklist", description: "", assigneeId: "p7", initiativeId: null, dueDate: null }),
  seedCard({ id: "w8", departmentId: "product", column: "in_progress", title: "Mobile store assets", description: "", assigneeId: "p5", taggedIds: ["p4"], initiativeId: "i4", dueDate: "Jul 8" }),
  seedCard({ id: "w9", departmentId: "gtm", column: "backlog", title: "Q3 campaign brief", description: "", assigneeId: "p9", initiativeId: "i3", dueDate: null }),
];

export const SEED_DATA: TeamData = {
  departments: SEED_DEPARTMENTS,
  people: SEED_PEOPLE,
  goals: SEED_GOALS,
  initiatives: SEED_INITIATIVES,
  cards: SEED_WORK_CARDS,
};

// ---------------------------------------------------------------------------
// Pure selectors
// ---------------------------------------------------------------------------

export function deptName(departments: Department[], id: string): string {
  return departments.find((d) => d.id === id)?.name ?? "—";
}

export function personName(people: Person[], id: string | null): string {
  if (!id) return "Unassigned";
  return people.find((p) => p.id === id)?.name ?? "—";
}

export function personById(people: Person[], id: string): Person | undefined {
  return people.find((p) => p.id === id);
}

export type DeptOverview = {
  department: Department;
  headcount: number;
  goalCompletionPct: number | null;
  initiativesAtRisk: number;
  initiativesTotal: number;
  openWork: number;
};

export function computeOverview(data: TeamData): DeptOverview[] {
  return data.departments.map((department) => {
    const people = data.people.filter((p) => p.departmentId === department.id);
    const personIds = new Set(people.map((p) => p.id));
    const goals = data.goals.filter((g) => personIds.has(g.personId));
    const done = goals.filter((g) => g.status === "done").length;
    const inits = data.initiatives.filter((i) => i.departmentIds.includes(department.id));
    const openWork = data.cards.filter((c) => c.departmentId === department.id && c.column !== "done").length;
    return {
      department,
      headcount: people.length,
      goalCompletionPct: goals.length ? Math.round((done / goals.length) * 100) : null,
      initiativesAtRisk: inits.filter((i) => i.status === "at_risk").length,
      initiativesTotal: inits.length,
      openWork,
    };
  });
}
