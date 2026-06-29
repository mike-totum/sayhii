import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getStaff, hasModule } from "@/lib/admin-auth";
import { TeamTabs } from "@/components/admin/team-tabs";
import { TeamProvider } from "@/lib/team-store";
import { getTeamData } from "@/lib/team-data";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function TeamLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const staff = await getStaff();
  if (!hasModule(staff, "team-tracking")) notFound();

  const initialData = await getTeamData();

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 py-10">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
        Team Tracking
      </p>
      <TeamTabs locale={locale} />
      <TeamProvider initialData={initialData}>
        <div className="mt-6">{children}</div>
      </TeamProvider>
    </div>
  );
}
