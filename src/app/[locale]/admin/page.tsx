import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getStaff } from "@/lib/admin-auth";
import { ADMIN_MODULES } from "@/lib/admin-modules";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminHome({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const staff = await getStaff();
  const modules = ADMIN_MODULES.filter((m) => staff?.modules.includes(m.id));

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-10 py-12">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
        Admin portal
      </p>
      <h1 className="mt-2 font-serif text-3xl tracking-tight">
        Welcome{staff ? `, ${staff.name.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-3 text-muted max-w-xl leading-relaxed">
        Internal tools for the sayhii team. You have access to the modules below.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {modules.map((m) => {
          const card = (
            <article className="group h-full rounded-md border border-border bg-surface p-7 flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(17,17,23,0.4)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-serif text-2xl tracking-tight">{m.label}</h2>
                {m.status !== "live" && (
                  <span className="text-[10px] uppercase tracking-[0.14em] rounded-full bg-border/70 text-muted px-2 py-0.5">
                    {m.status === "in-progress" ? "In progress" : "Planned"}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-muted leading-relaxed flex-1">
                {m.description}
              </p>
            </article>
          );
          return m.status === "live" ? (
            <Link key={m.id} href={`/${locale}${m.href}`}>
              {card}
            </Link>
          ) : (
            <div key={m.id} className="opacity-80">
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}
