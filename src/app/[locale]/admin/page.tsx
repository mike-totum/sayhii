import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

// The portal opens on the personal Dashboard (its own standalone module).
export default async function AdminHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  redirect(`/${locale}/admin/dashboard`);
}
