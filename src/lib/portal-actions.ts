import type { ThemeKey } from "./portal-data";

export type ActionStatus =
  | "open"
  | "scheduled"
  | "in_progress"
  | "done"
  | "dismissed";

export type ActionPriority = "high" | "medium" | "low";

export type ActionTemplateKind =
  | "one_on_one"
  | "team_meeting"
  | "all_hands"
  | "manager_script"
  | "policy_change"
  | "experiment";

export type ActionOutcome = {
  reviewed: boolean;
  helped: boolean | null;
  signalDelta?: number;
  note?: string;
};

export type Action = {
  id: string;
  title: string;
  summary: string;
  theme: ThemeKey;
  owner: { name: string; email: string };
  affects: string;
  status: ActionStatus;
  priority: ActionPriority;
  dueLabel: string;
  createdLabel: string;
  completedLabel?: string;
  template: {
    kind: ActionTemplateKind;
    title: string;
    duration: string;
    prompt: string[];
    talkingPoints: string[];
  };
  trigger: {
    description: string;
    delta: number;
    when: string;
  };
  outcome?: ActionOutcome;
};

export const actions: Action[] = [
  {
    id: "a-recognition-atlas",
    title: "Re-establish recognition cadence on Team Atlas",
    summary:
      "Recognition has fallen 7.6% over six months, the largest org-wide drop. Atlas is concentrated in two ICs.",
    theme: "recognition",
    owner: { name: "Richard Webber", email: "rwebber@sayhii-demo.com" },
    affects: "Grey's Anatomy · Team Atlas",
    status: "open",
    priority: "high",
    dueLabel: "by Fri, May 9",
    createdLabel: "Created Mon, May 5",
    template: {
      kind: "one_on_one",
      title: "1:1 prompt: recognition reset",
      duration: "20 min · in your next 1:1",
      prompt: [
        "Open with what you've seen them ship recently. Be specific.",
        "Ask: 'What's a piece of work you're proud of from the last month that didn't get acknowledged?'",
        "Don't defend the gap. Listen, take notes, surface a name later.",
        "Close with a concrete commitment: a public callout, a peer-shoutout, or a team ritual change.",
      ],
      talkingPoints: [
        "The org-wide score for Recognition is down 7.6% in six months.",
        "Two ICs on Atlas are driving most of the drop.",
        "Tension to manage: don't 'fix' it with empty praise, which can score lower.",
      ],
    },
    trigger: {
      description: "Recognition theme score dipped on Atlas",
      delta: -7.6,
      when: "Last 6 months",
    },
  },
  {
    id: "a-environment-commute",
    title: "Test a once-a-week remote day for Team Atlas",
    summary:
      "Three sub-themes (Commute, Work-life balance, Health) cluster around Environment. Commute scores 2.0 / 5.",
    theme: "environment",
    owner: { name: "Richard Webber", email: "rwebber@sayhii-demo.com" },
    affects: "Grey's Anatomy",
    status: "scheduled",
    priority: "high",
    dueLabel: "Pilot starts May 12",
    createdLabel: "Created Wed, Apr 30",
    template: {
      kind: "experiment",
      title: "30-day experiment plan",
      duration: "30 days · single-cohort A/B",
      prompt: [
        "Pick one team for the pilot (Atlas, n=12).",
        "Define the metric: Environment score and Commute sub-score, weekly.",
        "Set a stop-rule: end pilot if any vital drops more than 0.4 pts.",
        "Communicate the experiment as a test, not a permanent change.",
      ],
      talkingPoints: [
        "Commute is the lowest-scoring single sub-theme org-wide (2.0 / 5).",
        "Two-day-a-week WFH was tested in 2024 and lifted Environment 0.6 pts.",
        "Risk: spillover effects on Communication score for adjacent teams.",
      ],
    },
    trigger: {
      description: "Environment dropped, Commute = 2.0 / 5",
      delta: -2.4,
      when: "Last 3 months",
    },
  },
  {
    id: "a-trust-management",
    title: "Address 'Management is competent and ethical' (2.9)",
    summary:
      "Lowest-scoring Trust question. The 1:1 prompt is uncomfortable but the data is unambiguous.",
    theme: "trust",
    owner: { name: "Richard Webber", email: "rwebber@sayhii-demo.com" },
    affects: "Org-wide",
    status: "open",
    priority: "high",
    dueLabel: "This week",
    createdLabel: "Created Tue, May 6",
    template: {
      kind: "all_hands",
      title: "All-hands talking points",
      duration: "5 min in next all-hands",
      prompt: [
        "Lead with the data: 'Our score on competent and ethical leadership is 2.9 out of 5.'",
        "Don't argue with it. Don't reframe it. Acknowledge it.",
        "Name two things you'll do in the next 30 days, and the criteria for whether they worked.",
        "Schedule a follow-up to share the new score honestly, even if it didn't move.",
      ],
      talkingPoints: [
        "The score is from 49,171 answers, not a single complaint.",
        "Average response: 2.9, the lowest single question across all 13 themes.",
        "Trust questions move slowly; expect the next read in 4-6 weeks.",
      ],
    },
    trigger: {
      description: "Lowest-scoring single question org-wide",
      delta: -8.2,
      when: "Last 6 months",
    },
  },
  {
    id: "a-communication-cadence",
    title: "Switch weekly all-hands from Friday to Tuesday",
    summary:
      "Communication frequency sub-score is bottom-decile. Friday all-hands attendance is below 60%.",
    theme: "communication",
    owner: { name: "Jessica Pearson", email: "jpearson@sayhii-demo.com" },
    affects: "Org-wide",
    status: "in_progress",
    priority: "medium",
    dueLabel: "Pilot week 2 of 4",
    createdLabel: "Created Mon, Apr 21",
    template: {
      kind: "policy_change",
      title: "Policy change rollout",
      duration: "Decision + 4-week pilot",
      prompt: [
        "Announce the move in writing first, with the why.",
        "Run for 4 weeks before deciding whether to keep it.",
        "Track attendance and Communication sub-scores week over week.",
      ],
      talkingPoints: [
        "Friday attendance averaged 58% over last 8 weeks.",
        "Communication frequency: 3.2 / 5 (bottom 25%).",
        "Tuesday is the day with highest meeting availability across teams.",
      ],
    },
    trigger: {
      description: "Communication frequency sub-score = 3.2",
      delta: -3.4,
      when: "Last 90 days",
    },
  },
  {
    id: "a-belonging-design",
    title: "1:1 with Design Guild lead: belonging dipped",
    summary:
      "Belonging on Design Guild moved -6% in the last month. Earliest signal of regrettable attrition.",
    theme: "diversity",
    owner: { name: "Don Draper", email: "ddraper@sayhii-demo.com" },
    affects: "Design Guild",
    status: "open",
    priority: "high",
    dueLabel: "by Thu, May 8",
    createdLabel: "Created Wed, May 7",
    template: {
      kind: "one_on_one",
      title: "Skip-level prompt: belonging dip",
      duration: "30 min · skip-level",
      prompt: [
        "Lead with curiosity, not concern. 'I noticed something in the data and wanted your read.'",
        "Don't share the number. Share that the signal moved on their team this month.",
        "Ask: who would feel this most? Anyone you've been worried about?",
        "Wrap with: what would help you most in the next two weeks?",
      ],
      talkingPoints: [
        "Median lead time from a Belonging dip to a regrettable resignation in our data: 17 days.",
        "Don't mention exit-risk. The signal is enough; the conversation is the point.",
      ],
    },
    trigger: {
      description: "Belonging −6% on Design Guild",
      delta: -6.0,
      when: "Last month",
    },
  },
  {
    id: "a-clarity-okrs",
    title: "Re-state Q2 OKRs with explicit role lines",
    summary:
      "Clarity (sub-theme: Goal clarity) lifted on managers but stayed flat on ICs. The gap suggests cascading.",
    theme: "performance",
    owner: { name: "John Donaghy", email: "jdonaghy@sayhii-demo.com" },
    affects: "All ICs",
    status: "scheduled",
    priority: "medium",
    dueLabel: "Q2 kickoff May 13",
    createdLabel: "Created Mon, May 5",
    template: {
      kind: "team_meeting",
      title: "Team meeting agenda · Q2 kickoff",
      duration: "45 min · team meeting",
      prompt: [
        "Open with the company OKR for Q2 (one slide).",
        "Then your team's OKR. Same format.",
        "Then each IC's slice: one bullet per person, what 'good' looks like.",
        "Take questions. Re-share the slides afterwards.",
      ],
      talkingPoints: [
        "Goal clarity for managers: 4.4 / 5. For ICs: 3.7 / 5. The gap is the work.",
        "Q1 had three OKR re-orgs. The dataset on goal clarity is noisy.",
      ],
    },
    trigger: {
      description: "Goal clarity gap between managers and ICs",
      delta: 0.7,
      when: "Q1",
    },
  },
  {
    id: "a-talent-stretch",
    title: "Open three stretch projects to ICs this quarter",
    summary:
      "Talent Management score is healthy on managers but Stretch opportunities sub-score for ICs is 4.2 vs 4.6 on Atlas.",
    theme: "talent",
    owner: { name: "Sherman Potter", email: "spotter@sayhii-demo.com" },
    affects: "Org-wide ICs",
    status: "done",
    priority: "medium",
    dueLabel: "Closed",
    createdLabel: "Created Mar 10",
    completedLabel: "Marked done Apr 18",
    template: {
      kind: "policy_change",
      title: "Stretch project policy",
      duration: "Quarterly cycle",
      prompt: [
        "Identify three projects that don't have an obvious owner.",
        "Open them as stretch slots, with clear scope and a sponsor manager.",
        "Pair each with a buddy.",
        "Review at end of quarter, both project outcome and IC growth.",
      ],
      talkingPoints: [
        "Three projects opened on April 18.",
        "All three claimed within 5 days.",
        "Talent score lifted +0.4 pts in the next 4-week window.",
      ],
    },
    trigger: {
      description: "IC stretch sub-score 4.2 vs manager 4.6",
      delta: 0.4,
      when: "Q1",
    },
    outcome: {
      reviewed: true,
      helped: true,
      signalDelta: 4.2,
      note: "Talent Management score lifted from 4.20 to 4.27 in 4 weeks; sub-theme 'Stretch opportunities' moved from 4.2 to 4.5 on ICs.",
    },
  },
  {
    id: "a-support-leadership",
    title: "Add an exec office-hours slot for ICs",
    summary:
      "Support from leadership scores well overall but the IC sub-score is the lowest cohort.",
    theme: "support",
    owner: { name: "Josiah Bartlet", email: "jbartlet@sayhii-demo.com" },
    affects: "Org-wide ICs",
    status: "scheduled",
    priority: "low",
    dueLabel: "Starts May 20",
    createdLabel: "Created Apr 22",
    template: {
      kind: "experiment",
      title: "30-min weekly exec office hours",
      duration: "Recurring · 30 min Tuesdays",
      prompt: [
        "Anyone can book a 5-min slot, no agenda required.",
        "No managers in the room.",
        "Run for 6 weeks and read the Support sub-score.",
      ],
      talkingPoints: [
        "Office hours have lifted Support sub-score in 3 of 4 prior tests in our data.",
        "Risk: low signup in week 1 makes the slot feel performative. Plant a few intentional asks.",
      ],
    },
    trigger: {
      description: "Support · Leadership sub-score = 4.1 (ICs)",
      delta: -0.4,
      when: "Last quarter",
    },
  },
  {
    id: "a-equity-pay",
    title: "Run a pay-band review across roles in Comedy",
    summary:
      "Equity / Pay sub-score moved -1.1 pts on Comedy department. Trust signal is intertwined.",
    theme: "equity",
    owner: { name: "Bill Lumbergh", email: "blumbergh@sayhii-demo.com" },
    affects: "Comedy",
    status: "in_progress",
    priority: "high",
    dueLabel: "Review by Jun 1",
    createdLabel: "Created Apr 14",
    template: {
      kind: "policy_change",
      title: "Pay-band review · Comedy",
      duration: "4 weeks",
      prompt: [
        "Pull current band data + last two adjustment cycles.",
        "Compare to comp benchmark for each role family.",
        "Flag any band where median is below the 25th percentile.",
        "Bring proposed adjustments to the next exec sync.",
      ],
      talkingPoints: [
        "Comedy Equity / Pay: 3.6 → 2.5 in 6 months.",
        "Trust score on Comedy down 0.4 in same window, likely correlated.",
        "Don't pre-announce. Bring outcomes first.",
      ],
    },
    trigger: {
      description: "Equity · Pay −1.1 on Comedy",
      delta: -1.1,
      when: "Last 6 months",
    },
  },
  {
    id: "a-innovation-failure",
    title: "Share three project post-mortems publicly",
    summary:
      "Innovation · Tolerance for failure sub-score has slipped. Public post-mortems lifted it last year.",
    theme: "innovation",
    owner: { name: "Don Draper", email: "ddraper@sayhii-demo.com" },
    affects: "Org-wide",
    status: "open",
    priority: "medium",
    dueLabel: "by May 23",
    createdLabel: "Created May 6",
    template: {
      kind: "team_meeting",
      title: "Post-mortem norm",
      duration: "30 min × 3 sessions",
      prompt: [
        "Pick three projects from the last quarter that didn't go to plan.",
        "Owners present what went wrong, what we learned.",
        "Leadership asks one curious question, never blames.",
        "Publish the deck internally.",
      ],
      talkingPoints: [
        "Tolerance for failure is the most actionable lever in Innovation.",
        "Last year's run lifted Innovation 0.6 pts org-wide.",
      ],
    },
    trigger: {
      description: "Innovation · Tolerance for failure = 4.2",
      delta: -2.0,
      when: "Last quarter",
    },
  },
  {
    id: "a-autonomy-tools",
    title: "Audit tooling friction on Engineering",
    summary:
      "Autonomy is high but Tools sub-score lagging. Friction maps to specific code-review SLAs.",
    theme: "autonomy",
    owner: { name: "Bill Lumbergh", email: "blumbergh@sayhii-demo.com" },
    affects: "Engineering",
    status: "in_progress",
    priority: "low",
    dueLabel: "Audit week of May 20",
    createdLabel: "Created Apr 28",
    template: {
      kind: "experiment",
      title: "Friction audit + SLA experiment",
      duration: "2 weeks",
      prompt: [
        "Survey: what's the slowest thing in your day this week?",
        "Categorize answers by tool, process, person.",
        "Pick the top friction point and run a 2-week SLA experiment.",
      ],
      talkingPoints: [
        "Tools sub-score: 4.2 (vs Autonomy theme 4.5).",
        "Code review SLA is the obvious lever. Don't skip the survey though.",
      ],
    },
    trigger: {
      description: "Autonomy · Tools = 4.2 (vs 4.5 theme)",
      delta: -0.3,
      when: "Last 3 months",
    },
  },
  {
    id: "a-change-pace",
    title: "Pause non-essential change for 30 days",
    summary:
      "Change · Pace of change has spiked. Three competing initiatives launched in the same week.",
    theme: "change",
    owner: { name: "Ron Swanson", email: "rswanson@sayhii-demo.com" },
    affects: "Org-wide",
    status: "dismissed",
    priority: "low",
    dueLabel: "Closed",
    createdLabel: "Created Apr 11",
    completedLabel: "Dismissed Apr 25",
    template: {
      kind: "manager_script",
      title: "Pause + communicate script",
      duration: "Single comms cycle",
      prompt: [
        "Send a written note: 'For the next 30 days, no new initiatives.'",
        "List what is still active and what is paused.",
        "Pick one re-evaluation moment 30 days out.",
      ],
      talkingPoints: [
        "Change Pace sub-score moved -0.5 pts.",
        "Three initiatives launched in week of Apr 4: root cause.",
      ],
    },
    trigger: {
      description: "Change · Pace −0.5",
      delta: -0.5,
      when: "Last month",
    },
    outcome: {
      reviewed: true,
      helped: false,
      note: "Decision: not the right intervention right now. Exec team felt pause would itself be a change. Watching the signal another 4 weeks before deciding next step.",
    },
  },
  {
    id: "a-culture-rituals",
    title: "Bring back the Friday show-and-tell",
    summary:
      "Culture · Identity sub-score dropped after the ritual was paused in October.",
    theme: "culture",
    owner: { name: "Marty Baron", email: "mbaron@sayhii-demo.com" },
    affects: "Org-wide",
    status: "scheduled",
    priority: "low",
    dueLabel: "First session May 16",
    createdLabel: "Created Apr 30",
    template: {
      kind: "team_meeting",
      title: "Re-launch ritual",
      duration: "30 min weekly",
      prompt: [
        "Send a calendar invite for Fridays at 4pm.",
        "Two presenters per week, 5 min each.",
        "Optional, social, low-prep.",
        "Read the Identity sub-score after 4 weeks.",
      ],
      talkingPoints: [
        "Identity sub-score peaked when the ritual was active.",
        "It dropped 0.3 pts in the 8 weeks after it ended.",
      ],
    },
    trigger: {
      description: "Culture · Identity −0.3",
      delta: -0.3,
      when: "Since Oct 2025",
    },
  },
  {
    id: "a-recognition-peer",
    title: "Add a #shoutouts channel to Slack",
    summary:
      "Peer-recognition sub-score is the highest within Recognition. Doubling down on it is fast and cheap.",
    theme: "recognition",
    owner: { name: "Jessica Pearson", email: "jpearson@sayhii-demo.com" },
    affects: "Org-wide",
    status: "done",
    priority: "low",
    dueLabel: "Closed",
    createdLabel: "Created Apr 7",
    completedLabel: "Marked done Apr 14",
    template: {
      kind: "policy_change",
      title: "Slack channel + norm",
      duration: "1 hour to set up",
      prompt: [
        "Create #shoutouts.",
        "Pin a starter message with the format: 'Someone, for something specific.'",
        "Encourage the exec team to use it first, openly.",
      ],
      talkingPoints: [
        "Peer recognition: 4.3 / 5 (highest sub-score in Recognition).",
        "Cheap intervention; rarely backfires.",
      ],
    },
    trigger: {
      description: "Doubling down on what's working",
      delta: 0,
      when: "Q1",
    },
    outcome: {
      reviewed: true,
      helped: true,
      signalDelta: 1.8,
      note: "Recognition theme moved +1.8% in 3 weeks. Channel averages 12 posts a week.",
    },
  },
];

export function actionsByStatus(status: ActionStatus | "all"): Action[] {
  if (status === "all") return actions;
  return actions.filter((a) => a.status === status);
}

export function actionsForTheme(theme: ThemeKey): Action[] {
  return actions.filter((a) => a.theme === theme);
}

export function getAction(id: string): Action | undefined {
  return actions.find((a) => a.id === id);
}

// Statuses with copy + chip color
export const STATUS_META: Record<
  ActionStatus,
  { label: string; tone: string; dot: string }
> = {
  open: {
    label: "Open",
    tone: "bg-warm/60 text-primary border-primary/30",
    dot: "bg-primary",
  },
  scheduled: {
    label: "Scheduled",
    tone: "bg-sky text-foreground/80 border-sky",
    dot: "bg-foreground/40",
  },
  in_progress: {
    label: "In progress",
    tone: "bg-foreground text-background border-foreground",
    dot: "bg-background",
  },
  done: {
    label: "Done",
    tone: "bg-accent-soft text-accent border-accent/30",
    dot: "bg-accent",
  },
  dismissed: {
    label: "Dismissed",
    tone: "bg-background text-muted border-border",
    dot: "bg-muted",
  },
};

export const PRIORITY_META: Record<ActionPriority, { label: string; tone: string }> = {
  high: { label: "High", tone: "text-primary" },
  medium: { label: "Medium", tone: "text-amber-700" },
  low: { label: "Low", tone: "text-muted" },
};

export const TEMPLATE_KIND_META: Record<
  ActionTemplateKind,
  { label: string; verb: string }
> = {
  one_on_one: { label: "1:1 prompt", verb: "Schedule the 1:1" },
  team_meeting: { label: "Team meeting", verb: "Add to next agenda" },
  all_hands: { label: "All-hands moment", verb: "Add to next all-hands" },
  manager_script: { label: "Manager script", verb: "Send to managers" },
  policy_change: { label: "Policy change", verb: "Roll it out" },
  experiment: { label: "Experiment", verb: "Start the pilot" },
};
