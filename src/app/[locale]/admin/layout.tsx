import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getStaff } from "@/lib/admin-auth";
import { ADMIN_MODULES } from "@/lib/admin-modules";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const staff = await getStaff();
  // TODO(phase-1): when unauthenticated, redirect to the Auth0 login instead
  // of the marketing home.
  if (!staff) redirect(`/${locale}`);

  const modules = ADMIN_MODULES.filter((m) => staff.modules.includes(m.id));

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar locale={locale} modules={modules} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar staff={staff} locale={locale} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
