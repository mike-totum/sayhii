import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getStaff, hasModule } from "@/lib/admin-auth";
import { TeamProvider } from "@/lib/team-store";
import { getTeamData, getTeamIdentity } from "@/lib/team-data";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Data + roster gate for the team surfaces (Pulse / Work / Engineering /
// Manage). Navigation lives in the portal sidebar; each page owns its header.
export default async function TeamLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const staff = await getStaff();
  if (!hasModule(staff, "team-tracking")) notFound();

  const initialData = await getTeamData();
  const me = await getTeamIdentity(initialData.people);

  // Invite-only: a signed-in sayhii employee who hasn't been added to the
  // roster (and isn't an admin) sees a gentle prompt, not the tool.
  const onRoster = !!me && (me.isAdmin || me.personId !== null);

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 py-10">
      {onRoster ? (
        <TeamProvider initialData={initialData} me={me}>
          {children}
        </TeamProvider>
      ) : (
        <div className="rounded-2xl glass px-6 py-12 text-center">
          <h1 className="font-serif text-2xl tracking-tight">You&apos;re not on the team roster yet</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Signed in as {me?.email ?? "your account"}. Ask an admin to add you and
            you&apos;ll land right here with your own profile and goals.
          </p>
        </div>
      )}
    </div>
  );
}
