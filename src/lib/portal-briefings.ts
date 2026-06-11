import type { ThemeKey } from "./portal-data";

export type BriefingStatus = "draft" | "scheduled" | "published" | "archived";
export type BriefingAudience = "org" | "team" | "manager";

export type Block =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "lead"; text: string }
  | { kind: "callout"; tone: "primary" | "accent" | "warm"; eyebrow: string; body: string }
  | { kind: "quote"; body: string; author?: string }
  | { kind: "list"; items: string[] }
  | { kind: "stat-row"; stats: { label: string; value: string; sub?: string; tone?: "default" | "primary" | "accent" }[] }
  | { kind: "scorecard-tiles"; tiles: { label: string; grade: string; trend: "up" | "down" | "steady"; score: number }[] }
  | { kind: "theme-trend"; theme: ThemeKey; caption?: string }
  | { kind: "sub-theme-radar"; theme: ThemeKey; caption?: string }
  | { kind: "movers"; data: { theme: string; delta: number }[] }
  | { kind: "heatmap"; rows: string[]; cols: string[]; values: number[][] }
  | { kind: "actions-recap"; ids: string[] }
  | { kind: "next-step"; title: string; body: string; actionId?: string };

export type Section = {
  id: string;
  heading: string;
  blocks: Block[];
};

export type Briefing = {
  slug: string;
  title: string;
  subtitle: string;
  audience: BriefingAudience;
  audienceLabel: string;
  period: string;
  status: BriefingStatus;
  publishedLabel: string;
  author: { name: string; email: string };
  views: number;
  recipients: number;
  shareToken: string;
  cover: { eyebrow: string; tone: "primary" | "warm" | "sage" | "sky" };
  sections: Section[];
};

export const briefings: Briefing[] = [
  {
    slug: "q1-2026-org-scorecard",
    title: "Q1 2026 Organization Scorecard",
    subtitle:
      "What moved, what we did about it, and what we're tracking into Q2.",
    audience: "org",
    audienceLabel: "All sayhii-demo",
    period: "Q1 2026",
    status: "published",
    publishedLabel: "Published Apr 14, 2026",
    author: { name: "Richard Webber", email: "rwebber@sayhii-demo.com" },
    views: 482,
    recipients: 132,
    shareToken: "q1-org-tk-7H8K",
    cover: { eyebrow: "Quarterly briefing · Q1 2026", tone: "primary" },
    sections: [
      {
        id: "intro",
        heading: "The story this quarter",
        blocks: [
          {
            kind: "lead",
            text: "Wellness held steady at 80.2%. Two themes moved in opposite directions hard enough to shape the entire quarter: Recognition fell 7.6% while Change lifted 5.9%. The rest of the org was quiet.",
          },
          {
            kind: "callout",
            tone: "primary",
            eyebrow: "Headline",
            body: "Recognition needs the most attention going into Q2. Change is the bright spot, and what we did there is worth copying.",
          },
          {
            kind: "stat-row",
            stats: [
              { label: "Wellness", value: "80.2%", sub: "Steady", tone: "accent" },
              { label: "Engagement", value: "83.9%", sub: "+0.4 vs Q4" },
              { label: "Culture", value: "71.7%", sub: "−0.6 vs Q4" },
              { label: "Questions answered", value: "49,171", sub: "+6.1% YoY" },
            ],
          },
        ],
      },
      {
        id: "scorecard",
        heading: "All thirteen themes",
        blocks: [
          {
            kind: "p",
            text: "Letter grades from the rolling 90-day score, against our internal rubric. Click any tile in the live portal to drill in.",
          },
          {
            kind: "scorecard-tiles",
            tiles: [
              { label: "Autonomy", grade: "A-", trend: "steady", score: 86.6 },
              { label: "Change", grade: "B+", trend: "up", score: 83.6 },
              { label: "Communication", grade: "B+", trend: "steady", score: 73.4 },
              { label: "Culture", grade: "B+", trend: "up", score: 83.4 },
              { label: "Diversity / Inclusion", grade: "B+", trend: "steady", score: 80.6 },
              { label: "Environment", grade: "C+", trend: "steady", score: 75.2 },
              { label: "Equity / Equality", grade: "B-", trend: "up", score: 75.2 },
              { label: "Innovation", grade: "A-", trend: "down", score: 86.4 },
              { label: "Performance", grade: "A-", trend: "up", score: 85.2 },
              { label: "Recognition", grade: "A-", trend: "down", score: 83.8 },
              { label: "Support", grade: "A-", trend: "steady", score: 90.4 },
              { label: "Talent Mgmt & Dev", grade: "B+", trend: "steady", score: 85.4 },
              { label: "Trust", grade: "B+", trend: "steady", score: 80.6 },
            ],
          },
        ],
      },
      {
        id: "movers",
        heading: "What moved",
        blocks: [
          {
            kind: "movers",
            data: [
              { theme: "Recognition", delta: -7.6 },
              { theme: "Innovation", delta: -4.3 },
              { theme: "Equity / Equality", delta: 3.8 },
              { theme: "Performance", delta: 3.8 },
              { theme: "Change", delta: 5.9 },
            ],
          },
          {
            kind: "p",
            text: "Two of the three biggest moves are intervention-shaped. Change lifted after we paused three competing initiatives in February, and Equity / Equality moved on the back of the pay-band review on Comedy. Both are repeatable.",
          },
        ],
      },
      {
        id: "recognition",
        heading: "Recognition · the one to fix",
        blocks: [
          {
            kind: "h3",
            text: "What the data says",
          },
          {
            kind: "theme-trend",
            theme: "recognition",
            caption: "Recognition · 7-day moving average. Two-quarter view.",
          },
          {
            kind: "p",
            text: "The drop concentrates on Atlas (Engineering, n=12) and Customer Success Tier 2. The org-level decline is mostly two cohorts moving down, not a broad drift. That's actually good news: it means the lever is local.",
          },
          {
            kind: "sub-theme-radar",
            theme: "recognition",
            caption: "Recognition sub-themes: your team vs the org.",
          },
          {
            kind: "callout",
            tone: "warm",
            eyebrow: "Lowest sub-score",
            body: "Frequency is the bottom sub-theme at 3.8. People feel acknowledged in the abstract, less so in the moment.",
          },
          {
            kind: "h3",
            text: "What we're trying",
          },
          {
            kind: "actions-recap",
            ids: ["a-recognition-atlas", "a-recognition-peer"],
          },
        ],
      },
      {
        id: "change",
        heading: "Change · the bright spot",
        blocks: [
          {
            kind: "p",
            text: "Change Pace sub-score recovered fully after we paused new initiative announcements in early February. Communication of change moved with it. The pattern from prior quarters held: one fewer thing to react to consistently lifts how people feel about everything else.",
          },
          {
            kind: "theme-trend",
            theme: "change",
            caption: "Change theme · 7-day moving average.",
          },
          {
            kind: "quote",
            body: "We didn't fix anything. We just stopped piling on. The data is unambiguous about what that buys us.",
            author: "Richard Webber, COO",
          },
        ],
      },
      {
        id: "departments",
        heading: "Department comparison",
        blocks: [
          {
            kind: "p",
            text: "Drama and Comedy are the two anchor departments. The pay-band review on Comedy is starting to show in Equity scores; Drama is steady on every signal except Communication, where the new Tuesday all-hands is still bedding in.",
          },
          {
            kind: "heatmap",
            rows: ["Comedy", "Drama"],
            cols: ["Trust", "Comm.", "Recognition", "Equity", "Performance", "Belonging"],
            values: [
              [3.91, 3.49, 4.13, 3.77, 4.08, 3.78],
              [4.12, 3.80, 4.24, 3.76, 4.35, 4.18],
            ],
          },
        ],
      },
      {
        id: "next-quarter",
        heading: "What we're tracking into Q2",
        blocks: [
          {
            kind: "list",
            items: [
              "Recognition recovery on Atlas. Read the score 4 weeks after the 1:1 cycle.",
              "Comedy Equity scores against the new pay bands.",
              "Tuesday all-hands attendance and the Communication Frequency sub-score.",
              "Belonging on Design Guild, an early warning still pending follow-up.",
            ],
          },
          {
            kind: "next-step",
            title: "Open the live portal",
            body: "Every chart in this briefing is alive. Click into any theme tile or chart to drill into the underlying data.",
          },
        ],
      },
    ],
  },
  {
    slug: "greys-anatomy-q1-2026",
    title: "Grey's Anatomy · Q1 Briefing",
    subtitle: "Your team's data, in one place. Designed to share with your group.",
    audience: "team",
    audienceLabel: "Grey's Anatomy",
    period: "Q1 2026",
    status: "published",
    publishedLabel: "Published Apr 18, 2026",
    author: { name: "Richard Webber", email: "rwebber@sayhii-demo.com" },
    views: 19,
    recipients: 12,
    shareToken: "greys-q1-tk-A2P9",
    cover: { eyebrow: "Team briefing · Q1 2026", tone: "warm" },
    sections: [
      {
        id: "intro",
        heading: "Your team this quarter",
        blocks: [
          {
            kind: "lead",
            text: "Grey's Anatomy held above the org average on every theme except Recognition, where the dip on Atlas dragged the team line. Belonging is the strength to protect: yours moved while the org's didn't.",
          },
          {
            kind: "stat-row",
            stats: [
              { label: "Team wellness", value: "82.4%", sub: "+1.4 vs org", tone: "accent" },
              { label: "Daily participation", value: "94%", sub: "Highest cohort" },
              { label: "Recognition", value: "B−", sub: "−1.0 vs Q4", tone: "primary" },
              { label: "Belonging", value: "+0.4", sub: "vs org" },
            ],
          },
        ],
      },
      {
        id: "your-themes",
        heading: "Your themes vs the org",
        blocks: [
          {
            kind: "theme-trend",
            theme: "recognition",
            caption: "Recognition · your group vs the org.",
          },
          {
            kind: "p",
            text: "The dip is concentrated on two ICs. We've scheduled the 1:1 cadence reset for the week of May 12.",
          },
          {
            kind: "actions-recap",
            ids: ["a-recognition-atlas"],
          },
        ],
      },
      {
        id: "what-worked",
        heading: "What worked this quarter",
        blocks: [
          {
            kind: "actions-recap",
            ids: ["a-talent-stretch", "a-recognition-peer"],
          },
          {
            kind: "callout",
            tone: "accent",
            eyebrow: "Repeatable",
            body: "Both wins came from cheap, fast interventions. Talent score moved +0.4 in 4 weeks; Recognition lifted +1.8% in 3 weeks.",
          },
        ],
      },
      {
        id: "next",
        heading: "Talking points for your team",
        blocks: [
          {
            kind: "list",
            items: [
              "Lead with the wellness number, not the dip. Context matters.",
              "Acknowledge the Recognition score honestly. Don't pre-empt it with praise.",
              "Share one specific thing each person is doing well, before any feedback.",
              "Close with: what's one thing we should do less of next quarter?",
            ],
          },
          {
            kind: "next-step",
            title: "See your team's live data",
            body: "Click into any theme tile in the portal for the full breakdown.",
          },
        ],
      },
    ],
  },
  {
    slug: "h2-2025-half-year",
    title: "H2 2025 Half-Year Review",
    subtitle: "The story of the second half of the year, in five movements.",
    audience: "org",
    audienceLabel: "All sayhii-demo",
    period: "Jul – Dec 2025",
    status: "archived",
    publishedLabel: "Published Jan 12, 2026",
    author: { name: "Richard Webber", email: "rwebber@sayhii-demo.com" },
    views: 891,
    recipients: 124,
    shareToken: "h2-2025-tk-XR5W",
    cover: { eyebrow: "Half-year review · H2 2025", tone: "sage" },
    sections: [
      {
        id: "intro",
        heading: "Where we ended 2025",
        blocks: [
          {
            kind: "lead",
            text: "We finished the year with wellness up 2.1 points, engagement steady, and the lowest voluntary attrition in three years. The data tells the story of one big change and a hundred small ones.",
          },
          {
            kind: "stat-row",
            stats: [
              { label: "Wellness", value: "78.9%", sub: "+2.1 YoY", tone: "accent" },
              { label: "Voluntary attrition", value: "8.2%", sub: "Lowest since 2022" },
              { label: "Daily participation", value: "91%", sub: "+4.0 YoY" },
            ],
          },
        ],
      },
      {
        id: "trust",
        heading: "Trust · the slowest signal",
        blocks: [
          {
            kind: "theme-trend",
            theme: "trust",
            caption: "Trust · 12-month view.",
          },
          {
            kind: "p",
            text: "Trust is the theme we touched most often and the one that moved the slowest. That is the right pattern: fast moves on Trust usually mean we mistook approval for trust.",
          },
        ],
      },
      {
        id: "actions-recap",
        heading: "What we shipped this half",
        blocks: [
          {
            kind: "actions-recap",
            ids: ["a-talent-stretch", "a-recognition-peer", "a-change-pace"],
          },
        ],
      },
    ],
  },
  {
    slug: "q2-2026-org-scorecard",
    title: "Q2 2026 Organization Scorecard",
    subtitle: "Drafting in progress. Publish target: July 14, 2026.",
    audience: "org",
    audienceLabel: "All sayhii-demo",
    period: "Q2 2026",
    status: "draft",
    publishedLabel: "Drafting · target Jul 14",
    author: { name: "Richard Webber", email: "rwebber@sayhii-demo.com" },
    views: 0,
    recipients: 0,
    shareToken: "q2-draft",
    cover: { eyebrow: "Quarterly briefing · Q2 2026", tone: "sky" },
    sections: [
      {
        id: "outline",
        heading: "Outline",
        blocks: [
          {
            kind: "list",
            items: [
              "Did Recognition recover on Atlas?",
              "What did the pay-band review actually move on Comedy?",
              "Tuesday all-hands · 12-week read.",
              "First read on the once-a-week WFH pilot.",
              "Themes to watch in H2.",
            ],
          },
          {
            kind: "callout",
            tone: "warm",
            eyebrow: "Draft",
            body: "Auto-populates with live data on Jul 1. Editor opens then.",
          },
        ],
      },
    ],
  },
];

export function getBriefing(slug: string) {
  return briefings.find((b) => b.slug === slug);
}
