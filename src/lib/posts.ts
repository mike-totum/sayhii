// Real posts from sayhii.io/blog (metadata only). Each entry links to the
// canonical post on sayhii.io rather than rendering content here, since the
// authoritative source lives on Squarespace.

export type Post = {
  slug: string;
  title: string;
  author: string;
  date: string; // ISO YYYY-MM-DD
};

export const posts: Post[] = [
  {
    slug: "the-5-minute-reset-ice-breakers-that-actually-work-in-team-meetings",
    title: "The 5-Minute Reset: Ice Breakers That Actually Work in Team Meetings",
    author: "Amy Gurske",
    date: "2026-04-07",
  },
  {
    slug: "the-doctor-is-in-and-so-is-their-ai-twin",
    title: "The Doctor Is In. And So Is Their AI Twin",
    author: "Amy Gurske",
    date: "2026-03-31",
  },
  {
    slug: "the-silent-data-hospitals-are-ignoring",
    title: "The Silent Data Hospitals Are Ignoring",
    author: "Amy Gurske",
    date: "2026-03-10",
  },
  {
    slug: "benchmarking-in-healthcare-useful-tool-dangerous-obsession",
    title: "Benchmarking in Healthcare: Useful Tool, Dangerous Obsession",
    author: "Amy Gurske",
    date: "2026-02-24",
  },
  {
    slug: "stop-trying-to-change-the-score-change-the-system",
    title: "Stop Trying to Change the Score. Change the System.",
    author: "Amy Gurske",
    date: "2026-02-16",
  },
  {
    slug: "the-new-foundation-of-healthcare-culture-why-trust-drives-every-workforce-outcome",
    title:
      "The New Foundation of Healthcare Culture: Why Trust Drives Every Workforce Outcome",
    author: "Amy Gurske",
    date: "2026-01-06",
  },
  {
    slug: "the-employee-centric-workplace-trends-for-2026",
    title: "The Employee-Centric Workplace: Trends for 2026",
    author: "Amy Gurske",
    date: "2025-12-11",
  },
  {
    slug: "how-to-stay-focused-and-execute-at-work-in-december",
    title: "How to Stay Focused and Execute at Work in December",
    author: "Amy Gurske",
    date: "2025-12-04",
  },
  {
    slug: "recognition-appreciation-and-connection-the-future-of-workplace-culture-2U81N",
    title:
      "Recognition, Appreciation, and Connection: The Future of Workplace Culture",
    author: "Amy Gurske",
    date: "2025-12-04",
  },
  {
    slug: "creating-a-culture-of-appreciation-in-hybrid-teams",
    title: "Creating a Culture of Appreciation in Hybrid Teams",
    author: "Amy Gurske",
    date: "2025-11-20",
  },
  {
    slug: "the-power-of-acknowledgement-the-behavior-of-appreciation",
    title: "The Power of Acknowledgement, the Behavior of Appreciation",
    author: "Amy Gurske",
    date: "2025-11-13",
  },
  {
    slug: "the-roi-of-employee-recognition-its-more-than-a-thank-you",
    title: "The ROI of Employee Recognition: It's More Than a Thank You",
    author: "Amy Gurske",
    date: "2025-11-06",
  },
  {
    slug: "celebrate-innovation-make-it-fun-make-it-happen",
    title: "Celebrate Innovation: Make It Fun, Make It Happen",
    author: "Amy Gurske",
    date: "2025-10-30",
  },
  {
    slug: "intrapreneurship-driving-innovation-from-within",
    title: "Intrapreneurship: Driving Innovation from Within",
    author: "Amy Gurske",
    date: "2025-10-23",
  },
  {
    slug: "failure-on-the-path-to-success",
    title: "Failure on the Path to Success",
    author: "Amy Gurske",
    date: "2025-10-16",
  },
  {
    slug: "fostering-a-culture-of-experimentation-and-growth",
    title: "Fostering a Culture of Experimentation and Growth",
    author: "Amy Gurske",
    date: "2025-10-09",
  },
  {
    slug: "the-idea-you-think-everyone-else-has-nobody-does",
    title: "The Idea You Think Everyone Else Has… Nobody Does!",
    author: "Amy Gurske",
    date: "2025-10-02",
  },
  {
    slug: "supporting-others-in-times-of-change",
    title: "Supporting Others in Times of Change: Control vs. Leadership",
    author: "Amy Gurske",
    date: "2025-09-25",
  },
  {
    slug: "problem-vs-solution-thinking",
    title: "Problem vs. Solution Thinking: You're Not a Victim…You're the Answer",
    author: "Amy Gurske",
    date: "2025-09-18",
  },
  {
    slug: "why-adaptive-leadership-is-essential-for-the-modern-workplace",
    title: "Why Adaptive Leadership Is Essential for the Modern Workplace",
    author: "Amy Gurske",
    date: "2025-09-11",
  },
];

export function postUrl(slug: string) {
  return `https://sayhii.io/blog/${slug}`;
}
