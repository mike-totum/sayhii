import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getStaff, hasModule } from "@/lib/admin-auth";
import { TeamProvider } from "@/lib/team-store";
import { getTeamData, getTeamIdentity } from "@/lib/team-data";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Standalone personal dashboard. Shares Team Tracking's data layer (goals +
// work are the same records) but stands on its own in the sidebar — no tabs.
export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const staff = await getStaff();
  if (!hasModule(staff, "dashboard")) notFound();

  const initialData = await getTeamData();
  const me = await getTeamIdentity(initialData.people);

  return (
    <div className="relative overflow-hidden">
      <div className="ambient-mesh" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-10 py-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
          Dashboard
        </p>
        <TeamProvider initialData={initialData} me={me}>
          <div className="mt-7">{children}</div>
        </TeamProvider>
      </div>
    </div>
  );
}
