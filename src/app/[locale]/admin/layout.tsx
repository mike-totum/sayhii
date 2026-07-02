import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getStaff } from "@/lib/admin-auth";
import { getPortalAccess } from "@/lib/team-data";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { AdminTopbar } from "@/components/admin/topbar";
import { AdminSignIn } from "@/components/admin/sign-in";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const staff = await getStaff();
  // No valid session: show the Google sign-in screen in place (no redirect, so
  // the /admin URL is preserved for post-login).
  if (!staff) return <AdminSignIn locale={locale} />;

  // Relevance-gated nav: what this person sees is derived from the roster
  // (their department + access role), not a blanket module list.
  const access = await getPortalAccess();

  return (
    <div className="admin-shell flex">
      <AdminSidebar locale={locale} nav={access.nav} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar staff={staff} locale={locale} />
        {/* Shared warm backdrop for the whole portal; pages no longer carry
            their own. pb keeps content clear of the mobile bottom bar. */}
        <main className="relative flex-1 overflow-hidden pb-24 lg:pb-0">
          <div className="ambient-mesh" aria-hidden />
          <div className="relative">{children}</div>
        </main>
      </div>
      <AdminMobileNav locale={locale} nav={access.nav} />
    </div>
  );
}
