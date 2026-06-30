import { listEngineeringPRs, isGithubConfigured } from "@/lib/github";
import { EngineeringBoard } from "@/components/admin/engineering-board";

// Loads PRs server-side (token stays on the server), hands off to the client
// board which renders the kanban + in-app PR detail.

export const dynamic = "force-dynamic";

export default async function EngineeringPage() {
  const prs = await listEngineeringPRs();
  return <EngineeringBoard prs={prs} configured={isGithubConfigured} />;
}
