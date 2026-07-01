import { redirect } from "next/navigation";

// The personal dashboard moved to its own standalone module (/admin/dashboard).
// Team Tracking now opens on Pulse.
export default async function TeamIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/team/pulse`);
}
