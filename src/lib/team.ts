// Team Tracking domain types, seed data, and pure selectors (admin module #2).
// Internal sayhii staff only. The live data + mutations are owned by the client
// store (team-store.tsx); this file holds types, the initial seed, and pure
// derivations. TODO(team-backend): seed/persist via sayhii-core endpoints.

export type Department = { id: string; name: string };

export type Person = {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string;
};

export type GoalType = "personal" | "professional";
export type GoalStatus = "on_track" | "done" | "missed";

export type WeeklyGoal = {
  id: string;
  personId: string;
  type: GoalType;
  text: string;
  status: GoalStatus;
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

export type WorkCard = {
  id: string;
  departmentId: string;
  column: WorkColumn;
  title: string;
  description: string;
  assigneeId: string | null;
  initiativeId: string | null;
  dueDate: string | null;
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

export const CURRENT_WEEK_LABEL = "Week of Jun 23";

// All the data the store holds.
export type TeamData = {
  departments: Department[];
  people: Person[];
  goals: WeeklyGoal[];
  initiatives: Initiative[];
  cards: WorkCard[];
};

// ---------------------------------------------------------------------------
// Seed (illustrative). The store uses this until localStorage / the API exists.
// ---------------------------------------------------------------------------

export const SEED_DEPARTMENTS: Department[] = [
  { id: "eng", name: "Engineering" },
  { id: "product", name: "Product & Design" },
  { id: "cs", name: "Customer Success" },
  { id: "gtm", name: "Go-to-Market" },
];

export const SEED_PEOPLE: Person[] = [
  { id: "p1", name: "Dana Lee", email: "dana@sayhii.io", role: "Eng Lead", departmentId: "eng" },
  { id: "p2", name: "Sam Rivera", email: "sam@sayhii.io", role: "Engineer", departmentId: "eng" },
  { id: "p3", name: "Wei Zhang", email: "wei@sayhii.io", role: "Engineer", departmentId: "eng" },
  { id: "p4", name: "Priya Nair", email: "priya@sayhii.io", role: "Product Lead", departmentId: "product" },
  { id: "p5", name: "Jordan Fox", email: "jordan@sayhii.io", role: "Designer", departmentId: "product" },
  { id: "p6", name: "Matthew Cole", email: "matthew@sayhii.io", role: "Customer Success", departmentId: "cs" },
  { id: "p7", name: "Tess Obi", email: "tess@sayhii.io", role: "CS Specialist", departmentId: "cs" },
  { id: "p8", name: "Chris Park", email: "chris@sayhii.io", role: "Account Exec", departmentId: "gtm" },
  { id: "p9", name: "Robin Diaz", email: "robin@sayhii.io", role: "Marketing", departmentId: "gtm" },
];

export const SEED_GOALS: WeeklyGoal[] = [
  { id: "g1", personId: "p1", type: "professional", text: "Ship the participation endpoint to dev", status: "done" },
  { id: "g2", personId: "p1", type: "personal", text: "Leave by 5pm three days this week", status: "on_track" },
  { id: "g3", personId: "p2", type: "professional", text: "Close out the notes table migration", status: "on_track" },
  { id: "g4", personId: "p4", type: "professional", text: "Finalize Team Tracking spec", status: "on_track" },
  { id: "g5", personId: "p4", type: "personal", text: "Run 3x", status: "missed" },
  { id: "g6", personId: "p6", type: "professional", text: "Onboard 2 new accounts", status: "on_track" },
  { id: "g7", personId: "p8", type: "professional", text: "Advance the Globex renewal", status: "missed" },
];

export const SEED_INITIATIVES: Initiative[] = [
  { id: "i1", title: "Internal admin portal", ownerId: "p1", departmentIds: ["eng", "cs"], status: "on_track", targetDate: "Aug 2026", progress: 55, summary: "Customer Lookup + Team Tracking modules." },
  { id: "i2", title: "k-anonymity reporting fix", ownerId: "p2", departmentIds: ["eng"], status: "at_risk", targetDate: "Jul 2026", progress: 30, summary: "Close the identity re-exposure in the reporting layer." },
  { id: "i3", title: "Q3 GTM push", ownerId: "p9", departmentIds: ["gtm"], status: "not_started", targetDate: "Sep 2026", progress: 0, summary: "Campaign + 5 target logos." },
  { id: "i4", title: "Mobile app launch", ownerId: "p4", departmentIds: ["product", "eng"], status: "on_track", targetDate: "Jul 2026", progress: 70, summary: "Expo build to the app stores." },
];

export const SEED_WORK_CARDS: WorkCard[] = [
  { id: "w1", departmentId: "eng", column: "in_progress", title: "Wire frontend to participation API", description: "", assigneeId: "p2", initiativeId: "i1", dueDate: "Jul 5" },
  { id: "w2", departmentId: "eng", column: "backlog", title: "Provision CustomerNote table", description: "", assigneeId: "p3", initiativeId: "i1", dueDate: null },
  { id: "w3", departmentId: "eng", column: "review", title: "Participation endpoint PR", description: "", assigneeId: "p1", initiativeId: "i1", dueDate: null },
  { id: "w4", departmentId: "eng", column: "done", title: "Strip demo portal", description: "", assigneeId: "p1", initiativeId: "i1", dueDate: null },
  { id: "w5", departmentId: "eng", column: "backlog", title: "Rotate leaked Power BI secret", description: "", assigneeId: "p2", initiativeId: "i2", dueDate: "Jul 1" },
  { id: "w6", departmentId: "cs", column: "in_progress", title: "Globex renewal call", description: "", assigneeId: "p6", initiativeId: null, dueDate: "Jul 2" },
  { id: "w7", departmentId: "cs", column: "backlog", title: "Draft onboarding checklist", description: "", assigneeId: "p7", initiativeId: null, dueDate: null },
  { id: "w8", departmentId: "product", column: "in_progress", title: "Mobile store assets", description: "", assigneeId: "p5", initiativeId: "i4", dueDate: "Jul 8" },
  { id: "w9", departmentId: "gtm", column: "backlog", title: "Q3 campaign brief", description: "", assigneeId: "p9", initiativeId: "i3", dueDate: null },
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
