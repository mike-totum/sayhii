// Team Tracking data layer (admin module #2). Internal sayhii staff only.
//
// TODO(team-backend): replace stubs with sayhii-core endpoints + small DynamoDB
// tables (Person, Department, WeeklyGoal, Initiative, WorkCard). All functions
// are async so the swap to fetch() is transparent. Drag-and-drop mutations are
// local-only until those endpoints exist.

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
  assigneeId: string | null;
  initiativeId: string | null;
  dueDate: string | null;
};

export const CURRENT_WEEK_LABEL = "Week of Jun 23";

// ---------------------------------------------------------------------------
// Stub data — illustrative only.
// ---------------------------------------------------------------------------

const DEPARTMENTS: Department[] = [
  { id: "eng", name: "Engineering" },
  { id: "product", name: "Product & Design" },
  { id: "cs", name: "Customer Success" },
  { id: "gtm", name: "Go-to-Market" },
];

const PEOPLE: Person[] = [
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

const GOALS: WeeklyGoal[] = [
  { id: "g1", personId: "p1", type: "professional", text: "Ship the participation endpoint to dev", status: "done" },
  { id: "g2", personId: "p1", type: "personal", text: "Leave by 5pm three days this week", status: "on_track" },
  { id: "g3", personId: "p2", type: "professional", text: "Close out the notes table migration", status: "on_track" },
  { id: "g4", personId: "p4", type: "professional", text: "Finalize Team Tracking spec", status: "on_track" },
  { id: "g5", personId: "p4", type: "personal", text: "Run 3x", status: "missed" },
  { id: "g6", personId: "p6", type: "professional", text: "Onboard 2 new accounts", status: "on_track" },
  { id: "g7", personId: "p8", type: "professional", text: "Advance the Globex renewal", status: "missed" },
];

const INITIATIVES: Initiative[] = [
  { id: "i1", title: "Internal admin portal", ownerId: "p1", departmentIds: ["eng", "cs"], status: "on_track", targetDate: "Aug 2026", progress: 55, summary: "Customer Lookup + Team Tracking modules." },
  { id: "i2", title: "k-anonymity reporting fix", ownerId: "p2", departmentIds: ["eng"], status: "at_risk", targetDate: "Jul 2026", progress: 30, summary: "Close the identity re-exposure in the reporting layer." },
  { id: "i3", title: "Q3 GTM push", ownerId: "p9", departmentIds: ["gtm"], status: "not_started", targetDate: "Sep 2026", progress: 0, summary: "Campaign + 5 target logos." },
  { id: "i4", title: "Mobile app launch", ownerId: "p4", departmentIds: ["product", "eng"], status: "on_track", targetDate: "Jul 2026", progress: 70, summary: "Expo build to the app stores." },
];

const WORK_CARDS: WorkCard[] = [
  { id: "w1", departmentId: "eng", column: "in_progress", title: "Wire frontend to participation API", assigneeId: "p2", initiativeId: "i1", dueDate: "Jul 5" },
  { id: "w2", departmentId: "eng", column: "backlog", title: "Provision CustomerNote table", assigneeId: "p3", initiativeId: "i1", dueDate: null },
  { id: "w3", departmentId: "eng", column: "review", title: "Participation endpoint PR", assigneeId: "p1", initiativeId: "i1", dueDate: null },
  { id: "w4", departmentId: "eng", column: "done", title: "Strip demo portal", assigneeId: "p1", initiativeId: "i1", dueDate: null },
  { id: "w5", departmentId: "eng", column: "backlog", title: "Rotate leaked Power BI secret", assigneeId: "p2", initiativeId: "i2", dueDate: "Jul 1" },
  { id: "w6", departmentId: "cs", column: "in_progress", title: "Globex renewal call", assigneeId: "p6", initiativeId: null, dueDate: "Jul 2" },
  { id: "w7", departmentId: "cs", column: "backlog", title: "Draft onboarding checklist", assigneeId: "p7", initiativeId: null, dueDate: null },
  { id: "w8", departmentId: "product", column: "in_progress", title: "Mobile store assets", assigneeId: "p5", initiativeId: "i4", dueDate: "Jul 8" },
  { id: "w9", departmentId: "gtm", column: "backlog", title: "Q3 campaign brief", assigneeId: "p9", initiativeId: "i3", dueDate: null },
];

// ---------------------------------------------------------------------------

export async function listDepartments(): Promise<Department[]> {
  return DEPARTMENTS;
}

export async function listPeople(): Promise<Person[]> {
  return PEOPLE;
}

export async function listGoals(departmentId?: string): Promise<WeeklyGoal[]> {
  if (!departmentId) return GOALS;
  const ids = new Set(PEOPLE.filter((p) => p.departmentId === departmentId).map((p) => p.id));
  return GOALS.filter((g) => ids.has(g.personId));
}

export async function listInitiatives(departmentId?: string): Promise<Initiative[]> {
  if (!departmentId) return INITIATIVES;
  return INITIATIVES.filter((i) => i.departmentIds.includes(departmentId));
}

export async function listWorkCards(departmentId: string): Promise<WorkCard[]> {
  return WORK_CARDS.filter((c) => c.departmentId === departmentId);
}

export type DeptOverview = {
  department: Department;
  headcount: number;
  goalCompletionPct: number | null;
  initiativesAtRisk: number;
  initiativesTotal: number;
  openWork: number;
};

export async function getOverview(): Promise<DeptOverview[]> {
  return DEPARTMENTS.map((department) => {
    const people = PEOPLE.filter((p) => p.departmentId === department.id);
    const personIds = new Set(people.map((p) => p.id));
    const goals = GOALS.filter((g) => personIds.has(g.personId));
    const done = goals.filter((g) => g.status === "done").length;
    const inits = INITIATIVES.filter((i) => i.departmentIds.includes(department.id));
    const openWork = WORK_CARDS.filter((c) => c.departmentId === department.id && c.column !== "done").length;
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

// lookups
export function deptName(departments: Department[], id: string): string {
  return departments.find((d) => d.id === id)?.name ?? "—";
}
