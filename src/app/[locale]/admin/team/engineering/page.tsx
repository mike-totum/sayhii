import { notFound } from "next/navigation";
import { listEngineeringPRs, isGithubConfigured } from "@/lib/github";
import { getPortalAccess } from "@/lib/team-data";
import { EngineeringBoard } from "@/components/admin/engineering-board";

// Loads PRs server-side (token stays on the server), hands off to the client
// board which renders the kanban + in-app PR detail.
// Relevance-gated: engineering-department folks + admins only.

export const dynamic = "force-dynamic";

export default async function EngineeringPage() {
  const access = await getPortalAccess();
  if (!access.nav.engineering) notFound();

  const prs = await listEngineeringPRs();
  return <EngineeringBoard prs={prs} configured={isGithubConfigured} />;
}
