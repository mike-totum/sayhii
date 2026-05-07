import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/portal/sidebar";
import { Topbar } from "@/components/portal/topbar";
import { isLocale } from "@/lib/i18n";
import { getSession } from "@/lib/auth";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PortalLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar locale={locale} role={session.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar session={session} locale={locale} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
