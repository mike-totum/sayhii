import { type NextRequest, NextResponse } from "next/server";
import { getPortalAccess } from "@/lib/team-data";
import { searchRoster } from "@/lib/customer-search";

// A cold roster assembly fans out one query per company — give it room. Warm
// requests answer from cache in milliseconds.
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Same gate as the page: UI hiding is not security.
  const access = await getPortalAccess();
  if (!access.nav.customers) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const company = req.nextUrl.searchParams.get("company") ?? "";
  const outcome = await searchRoster(q, company || undefined);
  return NextResponse.json(outcome);
}
