import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { orgUsersSample } from "@/lib/portal-data";
import { ArrowIcon } from "@/components/icons";

type Props = { params: Promise<{ locale: string }> };

export default async function UsersPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);
  if (session.role !== "admin") redirect(`/${locale}/portal`);

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Admin · users
          </p>
          <h1 className="mt-2 text-4xl tracking-tight font-semibold">
            <span className="font-serif italic text-primary">
              {orgUsersSample.length}
            </span>{" "}
            people in sayhii-demo
          </h1>
        </div>
        <button className="inline-flex items-center gap-2 h-11 rounded-full bg-foreground text-background px-5 text-sm font-medium hover:bg-foreground/85 transition-colors">
          Invite a user
          <ArrowIcon className="size-4" />
        </button>
      </header>

      <section className="rounded-3xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex flex-wrap items-center gap-3 text-sm">
          <input
            type="search"
            placeholder="Search users…"
            className="h-9 flex-1 min-w-[220px] rounded-full border border-border bg-background px-4 placeholder:text-muted/70 focus:border-foreground/40 focus:outline-none"
          />
          <button className="text-xs text-muted hover:text-foreground transition-colors">
            Filter
          </button>
          <button className="text-xs text-muted hover:text-foreground transition-colors">
            Columns
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-muted border-b border-border">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-3 py-3 font-medium">Role</th>
                <th className="px-3 py-3 font-medium">Manager</th>
                <th className="px-3 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {orgUsersSample.map((u) => {
                const initials = u.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("");
                return (
                  <tr key={u.email} className="border-b border-border last:border-0 hover:bg-background/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="size-8 rounded-full bg-warm flex items-center justify-center text-xs font-semibold text-foreground/80">
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{u.name}</p>
                          <p className="text-xs text-muted truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs rounded-full px-2.5 py-0.5 ${
                          u.role === "Admin"
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-background border border-border"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted">{u.manager}</td>
                    <td className="px-3 py-3 text-muted">{u.department}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-xs rounded-full px-2.5 py-0.5 bg-accent-soft text-foreground/80 border border-accent/20">
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
