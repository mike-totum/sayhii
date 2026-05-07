import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { themes } from "@/lib/portal-data";
import { GradeTile } from "@/components/portal/grade-tile";

type Props = { params: Promise<{ locale: string }> };

export default async function ThemesIndexPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Themes</p>
        <h1 className="mt-2 text-4xl tracking-tight font-semibold">
          The thirteen{" "}
          <span className="font-serif italic text-primary">signals</span>{" "}
          we listen to.
        </h1>
        <p className="mt-3 text-muted max-w-2xl leading-relaxed">
          Click any theme to see how it&rsquo;s trending, the lowest-scoring
          questions, and how sub-themes compare across your group.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {themes.map((t) => (
          <Link
            key={t.key}
            href={`/${locale}/portal/themes/${t.key}`}
            className="block hover:-translate-y-0.5 transition-transform"
          >
            <GradeTile
              theme={t.name}
              grade={t.grade}
              score={t.org * 20}
              trend={t.trend}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
