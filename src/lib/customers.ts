// Customer Lookup data layer.
//
// PARTICIPATION ONLY — never question/answer content. Everything here is
// identity (the employer's own roster data) plus a content-free participation
// signal derived from counts and dates. The Answer table and the anonymized
// reporting layer are intentionally out of scope.
//
// TODO(phase-2-backend): replace the stub data below with calls to sayhii-core
//   - search/identity:   GET /user/list, GET /user/{org}/{id}
//   - participation:      new aggregation endpoint over User.state
//                         (answerDates[], questionStateByModule[].answeredIds.length, phaseState)
//   - notes:              GET/POST /cs/notes  (DynamoDB CustomerNote)
// All functions are async so the swap to fetch() is transparent to callers.

export type ParticipationStatus = "engaged" | "dormant" | "new";
export type AccountStatus = "active" | "unconfirmed" | "disabled";

export type Participation = {
  score: number; // 0-100 composite (completion + recency + consistency)
  status: ParticipationStatus;
  lastActiveDays: number | null; // days since last answerDate; null = never
  currentPhase: number;
  totalPhases: number;
  phaseProgressPct: number; // answered ÷ expected for the current phase
  overdue: boolean;
};

export type CustomerSummary = {
  email: string;
  name: string;
  company: string;
  department: string | null;
  status: AccountStatus;
  participationStatus: ParticipationStatus;
};

export type CustomerRecord = CustomerSummary & {
  managerEmail: string | null;
  role: string;
  joined: string | null; // from User.hireYearAndMonth
  source: "hris" | "manual";
  hrisProvider: string | null;
  lastSyncedLabel: string | null;
  participation: Participation;
};

export type NoteVisibility = "personal" | "public";
export type NoteScope = "user" | "company";

export type Note = {
  id: string;
  scope: NoteScope;
  subject: string; // email (user) or company name (org)
  authorName: string;
  authorEmail: string;
  createdAtLabel: string;
  body: string;
  visibility: NoteVisibility;
  tags: string[];
  pinned: boolean;
};

// ---------------------------------------------------------------------------
// Stub data — illustrative only, removed when the API is wired.
// ---------------------------------------------------------------------------

const STUB: CustomerRecord[] = [
  {
    email: "jordan.rivera@acme.com",
    name: "Jordan Rivera",
    company: "Acme Corp",
    department: "Engineering",
    status: "active",
    participationStatus: "engaged",
    managerEmail: "dana.lee@acme.com",
    role: "Manager",
    joined: "Mar 2024",
    source: "hris",
    hrisProvider: "Workday",
    lastSyncedLabel: "2d ago",
    participation: {
      score: 82,
      status: "engaged",
      lastActiveDays: 3,
      currentPhase: 4,
      totalPhases: 6,
      phaseProgressPct: 67,
      overdue: false,
    },
  },
  {
    email: "sam.chen@acme.com",
    name: "Sam Chen",
    company: "Acme Corp",
    department: "People Ops",
    status: "active",
    participationStatus: "dormant",
    managerEmail: "dana.lee@acme.com",
    role: "User",
    joined: "Jan 2023",
    source: "hris",
    hrisProvider: "Workday",
    lastSyncedLabel: "2d ago",
    participation: {
      score: 34,
      status: "dormant",
      lastActiveDays: 26,
      currentPhase: 2,
      totalPhases: 6,
      phaseProgressPct: 20,
      overdue: true,
    },
  },
  {
    email: "priya.nair@globex.io",
    name: "Priya Nair",
    company: "Globex",
    department: "Clinical",
    status: "active",
    participationStatus: "engaged",
    managerEmail: "h.simpson@globex.io",
    role: "Admin",
    joined: "Sep 2024",
    source: "manual",
    hrisProvider: null,
    lastSyncedLabel: null,
    participation: {
      score: 91,
      status: "engaged",
      lastActiveDays: 1,
      currentPhase: 5,
      totalPhases: 6,
      phaseProgressPct: 88,
      overdue: false,
    },
  },
  {
    email: "lee.park@globex.io",
    name: "Lee Park",
    company: "Globex",
    department: "Clinical",
    status: "unconfirmed",
    participationStatus: "new",
    managerEmail: "h.simpson@globex.io",
    role: "User",
    joined: "Jun 2026",
    source: "hris",
    hrisProvider: "Bamboo HR",
    lastSyncedLabel: "5h ago",
    participation: {
      score: 0,
      status: "new",
      lastActiveDays: null,
      currentPhase: 1,
      totalPhases: 6,
      phaseProgressPct: 0,
      overdue: false,
    },
  },
];

const STUB_NOTES: Note[] = [
  {
    id: "n1",
    scope: "user",
    subject: "jordan.rivera@acme.com",
    authorName: "Matthew",
    authorEmail: "matthew@sayhii.io",
    createdAtLabel: "Jun 24",
    body: "Asked how to reset their join key. Walked them through it.",
    visibility: "public",
    tags: ["onboarding"],
    pinned: true,
  },
  {
    id: "n2",
    scope: "user",
    subject: "jordan.rivera@acme.com",
    authorName: "Matthew",
    authorEmail: "matthew@sayhii.io",
    createdAtLabel: "May 02",
    body: "Confused about seat count on Acme's invoice — looped in billing.",
    visibility: "public",
    tags: ["billing"],
    pinned: false,
  },
  {
    id: "n3",
    scope: "company",
    subject: "Acme Corp",
    authorName: "Matthew",
    authorEmail: "matthew@sayhii.io",
    createdAtLabel: "Apr 18",
    body: "Renewal conversation in Q3. Main contact is Dana Lee (People Ops).",
    visibility: "public",
    tags: ["account"],
    pinned: true,
  },
];

export async function searchCustomers(query: string, company?: string): Promise<CustomerSummary[]> {
  const q = query.trim().toLowerCase();
  return STUB.filter((c) => {
    if (company && c.company !== company) return false;
    if (!q) return true;
    return (
      c.email.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q)
    );
  }).map(toSummary);
}

export async function getCustomer(email: string): Promise<CustomerRecord | null> {
  const e = email.trim().toLowerCase();
  return STUB.find((c) => c.email.toLowerCase() === e) ?? null;
}

export async function listNotes(scope: NoteScope, subject: string): Promise<Note[]> {
  const s = subject.trim().toLowerCase();
  return STUB_NOTES.filter(
    (n) => n.scope === scope && n.subject.toLowerCase() === s,
  ).sort((a, b) => Number(b.pinned) - Number(a.pinned));
}

export async function listCompanies(): Promise<string[]> {
  return Array.from(new Set(STUB.map((c) => c.company))).sort();
}

function toSummary(c: CustomerRecord): CustomerSummary {
  return {
    email: c.email,
    name: c.name,
    company: c.company,
    department: c.department,
    status: c.status,
    participationStatus: c.participationStatus,
  };
}
