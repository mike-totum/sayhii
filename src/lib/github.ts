import "server-only";

// Reads sayhii PRs for the Engineering kanban. Uses the GitHub GraphQL API so we
// get each PR's reviewDecision (separates "in review" from "approved & awaiting
// merge") plus enough detail to show an in-app PR view. Env-gated on
// GITHUB_TOKEN (read-only; locally pulled from `gh auth token`).

const SCOPES = ["org:sayhii-llc", "repo:mike-totum/sayhii"]; // org + website
const MERGED_WINDOW_DAYS = 7;

export type EngStage = "in_progress" | "in_review" | "awaiting_merge" | "merged";

export type PrReviewer = { login: string; avatar: string; state: string };
export type PrLabel = { name: string; color: string };

export type EngPR = {
  id: string;
  repo: string; // "owner/name"
  number: number;
  title: string;
  body: string;
  author: string;
  authorAvatar: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  stage: EngStage;
  reviewDecision: string | null;
  headRef: string;
  baseRef: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commits: number;
  labels: PrLabel[];
  reviewers: PrReviewer[];
};

export const isGithubConfigured = Boolean(process.env.GITHUB_TOKEN);

const QUERY = `query($q: String!) {
  search(query: $q, type: ISSUE, first: 100) {
    nodes {
      ... on PullRequest {
        number title url body isDraft reviewDecision state createdAt updatedAt mergedAt
        additions deletions changedFiles
        baseRefName headRefName
        commits { totalCount }
        author { login avatarUrl }
        repository { nameWithOwner }
        labels(first: 10) { nodes { name color } }
        latestReviews(first: 10) { nodes { author { login avatarUrl } state } }
      }
    }
  }
}`;

type Node = {
  number: number;
  title: string;
  url: string;
  body: string | null;
  isDraft: boolean;
  reviewDecision: string | null;
  state: string;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  baseRefName: string;
  headRefName: string;
  commits: { totalCount: number };
  author: { login: string; avatarUrl: string } | null;
  repository: { nameWithOwner: string };
  labels: { nodes: { name: string; color: string }[] };
  latestReviews: { nodes: { author: { login: string; avatarUrl: string } | null; state: string }[] };
};

function stageOf(n: Node): EngStage {
  if (n.state === "MERGED") return "merged";
  if (n.isDraft) return "in_progress";
  if (n.reviewDecision === "APPROVED") return "awaiting_merge";
  return "in_review";
}

async function gql(q: string, token: string): Promise<EngPR[]> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { q } }),
    next: { revalidate: 120 },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: { search?: { nodes?: Node[] } } };
  const nodes = json.data?.search?.nodes ?? [];
  return nodes
    .filter((n) => n && n.number)
    .map((n) => ({
      id: `${n.repository.nameWithOwner}#${n.number}`,
      repo: n.repository.nameWithOwner,
      number: n.number,
      title: n.title,
      body: n.body ?? "",
      author: n.author?.login ?? "unknown",
      authorAvatar: n.author?.avatarUrl ?? "",
      url: n.url,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      mergedAt: n.mergedAt,
      stage: stageOf(n),
      reviewDecision: n.reviewDecision,
      headRef: n.headRefName,
      baseRef: n.baseRefName,
      additions: n.additions,
      deletions: n.deletions,
      changedFiles: n.changedFiles,
      commits: n.commits?.totalCount ?? 0,
      labels: (n.labels?.nodes ?? []).map((l) => ({ name: l.name, color: `#${l.color}` })),
      reviewers: (n.latestReviews?.nodes ?? [])
        .filter((r) => r.author)
        .map((r) => ({ login: r.author!.login, avatar: r.author!.avatarUrl, state: r.state })),
    }));
}

export async function listEngineeringPRs(): Promise<EngPR[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return [];
  const since = new Date(Date.now() - MERGED_WINDOW_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const queries = SCOPES.flatMap((scope) => [
    `is:open is:pr ${scope}`,
    `is:merged is:pr ${scope} merged:>=${since}`,
  ]);
  const batches = await Promise.all(queries.map((q) => gql(q, token)));
  const seen = new Set<string>();
  return batches.flat().filter((p) => (seen.has(p.id) ? false : seen.add(p.id)));
}
