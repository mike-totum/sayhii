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

export type CompanySummary = {
  name: string;
  roster: number; // confirmed/active members
  // Aggregates are null when the population is below the suppression
  // threshold — small groups can re-identify individuals.
  participatingPct: number | null;
  avgScore: number | null;
  suppressed: boolean;
};

export type CompanyDetail = CompanySummary & {
  members: CustomerSummary[];
};

// Small-population suppression threshold. Mirrors the org's k-anonymity
// minimum group size — don't render a company aggregate below this.
// TODO(phase-4-backend): read the real per-org minimum from sayhii-core.
const MIN_GROUP = 5;

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
  mk("Dana Lee", "dana.lee@acme.com", "Acme Corp", "Engineering", "active", "Admin", "Feb 2022", "hris", "Workday", "2d ago", 88, "engaged", 2, 6, 92, false),
  mk("Chris Okafor", "chris.okafor@acme.com", "Acme Corp", "Sales", "active", "User", "Aug 2023", "hris", "Workday", "2d ago", 61, "engaged", 9, 4, 55, false),
  mk("Robin Wells", "robin.wells@acme.com", "Acme Corp", "Sales", "active", "User", "Nov 2024", "hris", "Workday", "2d ago", 47, "dormant", 18, 3, 40, true),
  mk("Taylor Reed", "taylor.reed@acme.com", "Acme Corp", "Support", "active", "User", "Jul 2025", "hris", "Workday", "2d ago", 73, "engaged", 5, 4, 70, false),
  mk("Morgan Diaz", "morgan.diaz@globex.io", "Globex", "Clinical", "active", "User", "Mar 2024", "manual", null, null, 79, "engaged", 4, 5, 75, false),
  mk("Avery Stone", "avery.stone@globex.io", "Globex", "Ops", "active", "User", "Oct 2023", "manual", null, null, 52, "dormant", 14, 3, 48, true),
  mk("Jamie Fox", "jamie.fox@globex.io", "Globex", "Ops", "active", "User", "Dec 2024", "manual", null, null, 84, "engaged", 2, 5, 80, false),
  mk("Pat Hughes", "pat.hughes@initech.com", "Initech", "Finance", "active", "Admin", "May 2021", "manual", null, null, 90, "engaged", 1, 6, 95, false),
  mk("Sky Bauer", "sky.bauer@initech.com", "Initech", "Finance", "active", "User", "Jun 2022", "manual", null, null, 70, "engaged", 6, 4, 65, false),
];

// Compact constructor for stub records.
function mk(
  name: string, email: string, company: string, department: string,
  status: AccountStatus, role: string, joined: string,
  source: "hris" | "manual", hrisProvider: string | null, lastSyncedLabel: string | null,
  score: number, pStatus: ParticipationStatus,
  lastActiveDays: number | null, currentPhase: number, phaseProgressPct: number, overdue: boolean,
): CustomerRecord {
  return {
    email, name, company, department, status, participationStatus: pStatus,
    managerEmail: null, role, joined, source, hrisProvider, lastSyncedLabel,
    participation: { score, status: pStatus, lastActiveDays, currentPhase, totalPhases: 6, phaseProgressPct, overdue },
  };
}

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

export async function listCompanies(): Promise<string[]> {
  return Array.from(new Set(STUB.map((c) => c.company))).sort();
}

export async function getCompanies(): Promise<CompanySummary[]> {
  const names = Array.from(new Set(STUB.map((c) => c.company))).sort();
  return names.map((name) => summarizeCompany(name));
}

export async function getCompany(name: string): Promise<CompanyDetail | null> {
  const n = name.trim().toLowerCase();
  const members = STUB.filter((c) => c.company.toLowerCase() === n);
  if (members.length === 0) return null;
  return {
    ...summarizeCompany(members[0].company),
    members: members.map(toSummary).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

function summarizeCompany(name: string): CompanySummary {
  const members = STUB.filter((c) => c.company === name);
  const roster = members.length;
  const suppressed = roster < MIN_GROUP;
  if (suppressed) {
    return { name, roster, participatingPct: null, avgScore: null, suppressed: true };
  }
  const participating = members.filter((m) => m.participationStatus === "engaged").length;
  const avg = members.reduce((s, m) => s + m.participation.score, 0) / roster;
  return {
    name,
    roster,
    participatingPct: Math.round((participating / roster) * 100),
    avgScore: Math.round(avg),
    suppressed: false,
  };
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
