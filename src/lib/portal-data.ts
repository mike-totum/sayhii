// Demo data for the sayhii portal. All numbers are illustrative.

export type Trend = "up" | "down" | "steady";

export type ThemeKey =
  | "trust"
  | "communication"
  | "autonomy"
  | "change"
  | "culture"
  | "diversity"
  | "environment"
  | "equity"
  | "innovation"
  | "performance"
  | "recognition"
  | "support"
  | "talent";

export type ThemeRow = {
  key: ThemeKey;
  name: string;
  org: number;
  group: number;
  grade: string;
  trend: Trend;
  delta: number; // percentage points 6-month change
};

export const themes: ThemeRow[] = [
  { key: "autonomy", name: "Autonomy", org: 4.33, group: 4.67, grade: "A-", trend: "steady", delta: 0.4 },
  { key: "change", name: "Change", org: 4.18, group: 4.38, grade: "B+", trend: "up", delta: 5.9 },
  { key: "communication", name: "Communication", org: 3.67, group: 3.30, grade: "B+", trend: "steady", delta: -0.2 },
  { key: "culture", name: "Culture", org: 4.17, group: 4.56, grade: "B+", trend: "up", delta: 1.4 },
  { key: "diversity", name: "Diversity / Inclusion", org: 4.03, group: 4.43, grade: "B+", trend: "steady", delta: 0.3 },
  { key: "environment", name: "Environment", org: 3.76, group: 4.00, grade: "C+", trend: "steady", delta: -0.5 },
  { key: "equity", name: "Equity / Equality", org: 3.76, group: 4.18, grade: "B-", trend: "up", delta: 3.8 },
  { key: "innovation", name: "Innovation", org: 4.32, group: 4.38, grade: "A-", trend: "down", delta: -4.3 },
  { key: "performance", name: "Performance", org: 4.26, group: 4.43, grade: "A-", trend: "up", delta: 3.8 },
  { key: "recognition", name: "Recognition", org: 4.19, group: 4.00, grade: "A-", trend: "down", delta: -7.6 },
  { key: "support", name: "Support", org: 4.52, group: 4.20, grade: "A-", trend: "steady", delta: 0.1 },
  { key: "talent", name: "Talent Management & Development", org: 4.27, group: 4.67, grade: "B+", trend: "steady", delta: 0.6 },
  { key: "trust", name: "Trust", org: 4.03, group: 3.75, grade: "B+", trend: "steady", delta: 0.0 },
];

export type Vital = {
  key: "resources" | "demands" | "balance";
  label: string;
  blurb: string;
  yourGrade: string;
  orgGrade: string;
  yourScore: number;
  orgScore: number;
  trend: Trend;
};

export const vitals: Vital[] = [
  {
    key: "resources",
    label: "Resources",
    blurb: "Organizational and job-related resources available to you.",
    yourGrade: "Excellent",
    orgGrade: "Excellent",
    yourScore: 4.5,
    orgScore: 4.4,
    trend: "steady",
  },
  {
    key: "demands",
    label: "Demands",
    blurb: "Physical, emotional, and psychological demands of your work.",
    yourGrade: "Substantial",
    orgGrade: "Substantial",
    yourScore: 3.6,
    orgScore: 3.5,
    trend: "up",
  },
  {
    key: "balance",
    label: "Work-life balance",
    blurb: "How well you manage demands between your personal and professional life.",
    yourGrade: "Good",
    orgGrade: "Good",
    yourScore: 3.4,
    orgScore: 3.4,
    trend: "steady",
  },
];

export type ScorecardSummary = {
  wellness: number;
  engagement: number;
  culture: number;
  resources: { grade: string; score: number; trend: Trend };
  demands: { grade: string; score: number; trend: Trend };
  balance: { grade: string; score: number; trend: Trend };
  questionsAnswered: number;
  movers: { theme: string; delta: number; trend: Trend }[];
};

export const scorecard: ScorecardSummary = {
  wellness: 80.2,
  engagement: 83.9,
  culture: 71.7,
  resources: { grade: "Excellent", score: 79.5, trend: "steady" },
  demands: { grade: "Substantial", score: 72.5, trend: "up" },
  balance: { grade: "Good", score: 69.5, trend: "steady" },
  questionsAnswered: 49171,
  movers: [
    { theme: "Recognition", delta: -7.6, trend: "down" },
    { theme: "Innovation", delta: -4.3, trend: "down" },
    { theme: "Equity / Equality", delta: 3.8, trend: "up" },
    { theme: "Performance", delta: 3.8, trend: "up" },
    { theme: "Change", delta: 5.9, trend: "up" },
  ],
};

// 7-day moving average for a single theme over ~24 months. Generated to look
// plausibly noisy without screaming "fake". Range stays in [3.2, 4.8].
function generateThemeSeries(seed: number, length = 200): { date: string; org: number; you: number }[] {
  const out: { date: string; org: number; you: number }[] = [];
  const start = new Date("2024-06-01");
  let orgVal = 4.05;
  let youVal = 4.0;
  for (let i = 0; i < length; i++) {
    const noiseO = ((Math.sin(i * 0.3 + seed) + Math.cos(i * 0.13 + seed * 1.7)) / 2) * 0.18;
    const noiseY = ((Math.sin(i * 0.42 + seed * 2.1) + Math.cos(i * 0.21 + seed)) / 2) * 0.32;
    orgVal = Math.max(3.4, Math.min(4.7, orgVal + noiseO * 0.4 - 0.005));
    youVal = Math.max(3.0, Math.min(4.9, youVal + noiseY * 0.6));
    const d = new Date(start);
    d.setDate(d.getDate() + i * 4);
    out.push({
      date: d.toISOString().slice(0, 10),
      org: Number(orgVal.toFixed(2)),
      you: Number(youVal.toFixed(2)),
    });
  }
  return out;
}

const seriesCache = new Map<ThemeKey, { date: string; org: number; you: number }[]>();
export function themeSeries(key: ThemeKey) {
  if (!seriesCache.has(key)) {
    const seedMap: Record<ThemeKey, number> = {
      autonomy: 1, change: 2, communication: 3, culture: 4, diversity: 5,
      environment: 6, equity: 7, innovation: 8, performance: 9,
      recognition: 10, support: 11, talent: 12, trust: 13,
    };
    seriesCache.set(key, generateThemeSeries(seedMap[key]));
  }
  return seriesCache.get(key)!;
}

export type SubThemeRow = { name: string; you: number; org: number };
export const subThemesByTheme: Record<ThemeKey, SubThemeRow[]> = {
  trust: [
    { name: "Honesty", you: 4.2, org: 4.0 },
    { name: "Reliability", you: 4.1, org: 3.9 },
    { name: "Transparency", you: 3.8, org: 3.6 },
    { name: "Fairness", you: 4.0, org: 3.8 },
    { name: "Competence", you: 3.6, org: 3.5 },
    { name: "Followthrough", you: 3.9, org: 3.7 },
  ],
  communication: [
    { name: "Clarity", you: 3.4, org: 3.6 },
    { name: "Frequency", you: 3.2, org: 3.4 },
    { name: "Listening", you: 3.0, org: 3.2 },
    { name: "Tone", you: 3.6, org: 3.7 },
    { name: "Channels", you: 3.5, org: 3.7 },
    { name: "Cadence", you: 3.3, org: 3.5 },
  ],
  environment: [
    { name: "Work style", you: 4.0, org: 3.7 },
    { name: "Equipment", you: 4.2, org: 4.1 },
    { name: "Benefits", you: 4.1, org: 4.0 },
    { name: "Compensation", you: 3.9, org: 3.6 },
    { name: "Support", you: 4.0, org: 3.9 },
    { name: "Work-life balance", you: 3.4, org: 3.3 },
    { name: "Health", you: 4.0, org: 3.9 },
    { name: "Security", you: 4.3, org: 4.0 },
    { name: "Commute", you: 3.0, org: 2.6 },
  ],
  autonomy: [
    { name: "Decision-making", you: 4.4, org: 4.1 },
    { name: "Schedule", you: 4.6, org: 4.3 },
    { name: "Method", you: 4.5, org: 4.2 },
    { name: "Pace", you: 4.7, org: 4.4 },
    { name: "Tools", you: 4.4, org: 4.2 },
  ],
  change: [
    { name: "Pace of change", you: 4.3, org: 4.1 },
    { name: "Communication of change", you: 4.0, org: 3.8 },
    { name: "Support during change", you: 4.4, org: 4.2 },
    { name: "Reasoning", you: 4.5, org: 4.3 },
  ],
  culture: [
    { name: "Inclusivity", you: 4.5, org: 4.1 },
    { name: "Collaboration", you: 4.6, org: 4.2 },
    { name: "Norms", you: 4.4, org: 4.0 },
    { name: "Identity", you: 4.7, org: 4.4 },
  ],
  diversity: [
    { name: "Representation", you: 4.4, org: 4.1 },
    { name: "Voice", you: 4.5, org: 4.0 },
    { name: "Belonging", you: 4.5, org: 4.1 },
    { name: "Equitable opportunity", you: 4.3, org: 3.9 },
  ],
  equity: [
    { name: "Pay", you: 4.0, org: 3.6 },
    { name: "Promotion", you: 4.1, org: 3.8 },
    { name: "Workload distribution", you: 4.3, org: 3.9 },
    { name: "Recognition equity", you: 4.2, org: 3.8 },
  ],
  innovation: [
    { name: "Encouragement", you: 4.4, org: 4.3 },
    { name: "Tolerance for failure", you: 4.2, org: 4.1 },
    { name: "Resourcing", you: 4.3, org: 4.3 },
    { name: "Speed", you: 4.5, org: 4.4 },
  ],
  performance: [
    { name: "Goal clarity", you: 4.3, org: 4.2 },
    { name: "Feedback", you: 4.5, org: 4.3 },
    { name: "Accountability", you: 4.4, org: 4.2 },
    { name: "Tools to succeed", you: 4.5, org: 4.3 },
  ],
  recognition: [
    { name: "Frequency", you: 3.8, org: 4.0 },
    { name: "Specificity", you: 4.0, org: 4.2 },
    { name: "Public vs private", you: 4.1, org: 4.2 },
    { name: "From manager", you: 4.0, org: 4.1 },
    { name: "From peers", you: 4.1, org: 4.3 },
  ],
  support: [
    { name: "From manager", you: 4.2, org: 4.4 },
    { name: "From peers", you: 4.0, org: 4.3 },
    { name: "From leadership", you: 4.1, org: 4.5 },
    { name: "Resources", you: 4.4, org: 4.6 },
  ],
  talent: [
    { name: "Career path", you: 4.6, org: 4.2 },
    { name: "Learning resources", you: 4.7, org: 4.3 },
    { name: "Manager 1:1s", you: 4.7, org: 4.3 },
    { name: "Stretch opportunities", you: 4.6, org: 4.2 },
  ],
};

// Lowest scoring questions for a theme — copy is generic but specific enough.
export const lowestQuestionsByTheme: Record<ThemeKey, { q: string; avg: number }[]> = {
  trust: [
    { q: "Management at the organization is competent and ethical", avg: 2.9 },
    { q: "I can be open with my manager about what's going on in my life", avg: 3.3 },
    { q: "I can trust what people say here", avg: 3.3 },
    { q: "People here do what they say they're going to do", avg: 3.7 },
  ],
  environment: [
    { q: "I am happy with my commute", avg: 2.0 },
    { q: "I get enough sleep", avg: 3.0 },
    { q: "I have a good balance between work and life", avg: 3.0 },
    { q: "My manager helps employees maintain a good work-life balance", avg: 3.4 },
    { q: "Our team culture promotes a balance between work and family life", avg: 3.4 },
  ],
  communication: [
    { q: "My teammates and I catch up often", avg: 2.7 },
    { q: "People communicate well throughout the organization", avg: 2.7 },
    { q: "I communicate well", avg: 3.0 },
  ],
  autonomy: [
    { q: "I have a say in how I do my work", avg: 4.1 },
    { q: "My manager trusts me to make good decisions", avg: 4.3 },
  ],
  change: [
    { q: "Changes are explained clearly", avg: 4.0 },
    { q: "I have time to adjust to new changes", avg: 4.1 },
  ],
  culture: [
    { q: "Our culture matches what we say it is", avg: 4.0 },
    { q: "I feel I belong here", avg: 4.2 },
  ],
  diversity: [
    { q: "My manager cares about my opinions", avg: 2.9 },
    { q: "Different perspectives are valued here", avg: 3.9 },
  ],
  equity: [
    { q: "The organization cares about every employee equally", avg: 2.0 },
    { q: "Promotions feel fair", avg: 3.7 },
  ],
  innovation: [
    { q: "We try new ideas regularly", avg: 4.2 },
    { q: "It's safe to suggest improvements", avg: 4.3 },
  ],
  performance: [
    { q: "I know what good performance looks like in my role", avg: 4.1 },
    { q: "I get useful feedback", avg: 4.2 },
  ],
  recognition: [
    { q: "I am recognized when I do good work", avg: 3.9 },
    { q: "Recognition feels genuine", avg: 4.1 },
  ],
  support: [
    { q: "I get the help I need to do my job well", avg: 4.4 },
    { q: "My manager has my back", avg: 4.5 },
  ],
  talent: [
    { q: "I see a future for myself here", avg: 4.5 },
    { q: "I am growing in my role", avg: 4.6 },
  ],
};

// Admin-only data
export const orgOverview = {
  expectedUsers: 132,
  confirmedUsers: 132,
  participationRate: 100,
  questionsAnswered: 49171,
  questionsSkipped: 15203,
};

// Registration timeline weeks
export const registrationTimeline = Array.from({ length: 36 }).map((_, i) => {
  const d = new Date("2024-06-01");
  d.setDate(d.getDate() + i * 21);
  return {
    week: d.toISOString().slice(0, 10),
    registered: 132,
    confirmed: 132 - (i === 12 ? 1 : 0),
    participation: 100,
    answered: 110 + Math.round(Math.sin(i / 2) * 30 + 30),
    skipped: Math.max(2, Math.round(20 + Math.sin(i / 3) * 12)),
  };
});

// Department comparison (group rows × theme columns)
export const departments = [
  { name: "Comedy", users: 62 },
  { name: "Drama", users: 70 },
];

export function deptThemeScore(dept: string, theme: ThemeKey): number {
  const base: Record<ThemeKey, [number, number]> = {
    autonomy: [4.18, 4.47],
    change: [3.84, 4.33],
    communication: [3.49, 3.80],
    culture: [4.09, 4.23],
    diversity: [3.78, 4.18],
    environment: [3.69, 3.79],
    equity: [3.77, 3.76],
    innovation: [4.13, 4.43],
    performance: [4.08, 4.35],
    recognition: [4.13, 4.24],
    support: [4.39, 4.59],
    talent: [4.00, 4.44],
    trust: [3.91, 4.12],
  };
  const [c, d] = base[theme];
  return dept === "Comedy" ? c : d;
}

// Manager hierarchy
export type Manager = {
  name: string;
  email: string;
  expected: number;
  confirmed: number;
  active: number;
};
export const managers: Manager[] = [
  { name: "Bert Cooper", email: "bcooper@example.com", expected: 1, confirmed: 1, active: 1 },
  { name: "Bill Lumbergh", email: "blumbergh@example.com", expected: 6, confirmed: 6, active: 6 },
  { name: "David Morgenstern", email: "dmorgenstern@example.com", expected: 10, confirmed: 10, active: 10 },
  { name: "David Wallace", email: "dwallace@example.com", expected: 12, confirmed: 12, active: 12 },
  { name: "Don Draper", email: "ddraper@example.com", expected: 7, confirmed: 7, active: 7 },
  { name: "Irving Ravitz", email: "iravitz@example.com", expected: 5, confirmed: 5, active: 5 },
  { name: "Jessica Pearson", email: "jpearson@example.com", expected: 9, confirmed: 9, active: 9 },
  { name: "John Donaghy", email: "jdonaghy@example.com", expected: 8, confirmed: 8, active: 8 },
  { name: "Josiah Bartlet", email: "jbartlet@example.com", expected: 8, confirmed: 8, active: 8 },
  { name: "Marty Baron", email: "mbaron@example.com", expected: 6, confirmed: 6, active: 6 },
  { name: "Raymond Holt", email: "rholt@example.com", expected: 7, confirmed: 7, active: 7 },
  { name: "Richard Webber", email: "rwebber@example.com", expected: 8, confirmed: 8, active: 8 },
  { name: "Roger Sterling", email: "rsterling@example.com", expected: 1, confirmed: 1, active: 1 },
  { name: "Ron Swanson", email: "rswanson@example.com", expected: 9, confirmed: 9, active: 9 },
  { name: "Sherman Potter", email: "spotter@example.com", expected: 8, confirmed: 8, active: 8 },
  { name: "Steve Schott", email: "sschott@example.com", expected: 6, confirmed: 6, active: 6 },
];

export const orgUsersSample = [
  { name: "Abby Lockhart", email: "alockhart@example.com", role: "User", manager: "John Williamson", department: "Grey's Anatomy" },
  { name: "Alex Karev", email: "akarev@example.com", role: "User", manager: "John Williamson", department: "Grey's Anatomy" },
  { name: "Amy Santiago", email: "asantiago@example.com", role: "User", manager: "Raymond Holt", department: "Brooklyn Nine-Nine" },
  { name: "Andy Bernard", email: "abernard@example.com", role: "User", manager: "Angela Martin", department: "The Office" },
  { name: "Angela Martin", email: "amartin@example.com", role: "Admin", manager: "—", department: "The Office" },
  { name: "Bill Lumbergh", email: "blumbergh@example.com", role: "Admin", manager: "—", department: "Office Space" },
  { name: "David Wallace", email: "dwallace@example.com", role: "Admin", manager: "—", department: "The Office" },
  { name: "Don Draper", email: "ddraper@example.com", role: "Admin", manager: "—", department: "Mad Men" },
  { name: "Emily Charlton", email: "echarlton@example.com", role: "User", manager: "Miranda Priestly", department: "The Devil Wears Prada" },
  { name: "Jessica Pearson", email: "jpearson@example.com", role: "Admin", manager: "—", department: "Suits" },
  { name: "John Williamson", email: "jwilliamson@example.com", role: "Admin", manager: "—", department: "Glengarry Glen Ross" },
  { name: "Josiah Bartlet", email: "jbartlet@example.com", role: "Admin", manager: "—", department: "The West Wing" },
  { name: "Michael Bolton", email: "mbolton@example.com", role: "User", manager: "Bill Lumbergh", department: "Office Space" },
  { name: "Miranda Priestly", email: "mpriestly@example.com", role: "Admin", manager: "—", department: "The Devil Wears Prada" },
  { name: "Nigel Kipling", email: "nkipling@example.com", role: "User", manager: "Miranda Priestly", department: "The Devil Wears Prada" },
  { name: "Oscar Martinez", email: "omartinez@example.com", role: "User", manager: "Angela Martin", department: "The Office" },
  { name: "Peter Gibbons", email: "pgibbons@example.com", role: "User", manager: "Bill Lumbergh", department: "Office Space" },
  { name: "Raymond Holt", email: "rholt@example.com", role: "Admin", manager: "—", department: "Brooklyn Nine-Nine" },
  { name: "Ricky Roma", email: "rroma@example.com", role: "User", manager: "John Williamson", department: "Glengarry Glen Ross" },
  { name: "Samir Nagheenanajar", email: "snagheenanajar@example.com", role: "User", manager: "Bill Lumbergh", department: "Office Space" },
  { name: "Tom Smykowski", email: "tsmykowski@example.com", role: "User", manager: "Bill Lumbergh", department: "Office Space" },
];

export type Question = {
  id: string;
  text: string;
  theme: ThemeKey;
};

export const dailyQuestion: Question = {
  id: "q-environment-commute",
  theme: "environment",
  text: "I am kept adequately up-to-date about important issues within my company",
};

// Helpers
export function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "bg-accent-soft text-foreground border-accent/40";
  if (grade.startsWith("B")) return "bg-warm/70 text-foreground border-primary/30";
  if (grade.startsWith("C")) return "bg-amber-100 text-foreground border-amber-200";
  return "bg-rose-100 text-foreground border-rose-200";
}

export function scoreCellTone(score: number) {
  if (score >= 4.0) return "bg-accent-soft text-foreground";
  if (score >= 3.5) return "bg-warm/60 text-foreground";
  if (score >= 3.0) return "bg-amber-100 text-foreground";
  return "bg-rose-100 text-foreground";
}
