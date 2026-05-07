import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { ArrowIcon, CheckIcon } from "@/components/icons";

type Props = { params: Promise<{ locale: string }> };

const FIELDS = {
  identity: [
    { name: "firstName", label: "First name", value: "Meredith" },
    { name: "lastName", label: "Last name", value: "Grey" },
    { name: "email", label: "Work email", value: "mgrey@sayhii-demo.com", type: "email" },
    { name: "pronouns", label: "Pronouns", value: "she / her" },
  ],
  demographics: [
    { name: "gender", label: "Gender", value: "Female", select: ["Female", "Male", "Non-binary", "Prefer not to say"] },
    { name: "race", label: "Race", value: "White", select: ["American Indian or Alaska Native", "Asian", "Black or African American", "Native Hawaiian or other Pacific Islander", "White", "Two or more", "Prefer not to say"] },
    { name: "ethnicity", label: "Ethnicity", value: "Non-Hispanic", select: ["Hispanic or Latino", "Non-Hispanic", "Prefer not to say"] },
  ],
  work: [
    { name: "department", label: "Department", value: "Grey's Anatomy" },
    { name: "role", label: "Role", value: "Attending Physician" },
    { name: "manager", label: "Manager", value: "Richard Webber" },
    { name: "hireYear", label: "Hire year", value: "2018" },
    { name: "hireMonth", label: "Hire month", value: "September" },
    { name: "workType", label: "Work type", value: "On-site, full-time" },
    { name: "workZip", label: "Working ZIP", value: "98101" },
  ],
};

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/");
  const session = await getSession();
  if (!session) redirect(`/${locale}/signin`);

  const initials = "MG";

  return (
    <div className="px-6 lg:px-10 py-7 lg:py-9 space-y-6">
      <header className="rise">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
          Profile
        </p>
        <h1 className="mt-1 text-3xl lg:text-4xl tracking-tight font-semibold">
          Your{" "}
          <span className="font-serif italic text-primary">profile</span>.
        </h1>
      </header>

      {/* Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-foreground bg-foreground text-background rise rise-1">
        <div aria-hidden className="absolute -top-20 -right-12 size-[360px] rounded-full bg-primary/30 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 left-10 size-[280px] rounded-full bg-accent/20 blur-3xl" />
        <div className="relative grid lg:grid-cols-[auto_1fr_auto] gap-6 items-center p-6 lg:p-8">
          <span className="size-20 rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-primary-foreground text-2xl font-semibold flex items-center justify-center shadow-[0_10px_30px_-12px_rgba(255,107,91,0.6)]">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.22em] text-background/60">
              {FIELDS.work[0].value} · {FIELDS.work[1].value}
            </p>
            <h2 className="mt-1 text-3xl tracking-tight font-semibold">
              {FIELDS.identity[0].value}{" "}
              <span className="font-serif italic">{FIELDS.identity[1].value}</span>
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-background/75">
              <span className="inline-flex items-center gap-1 rounded-full bg-background/10 px-2.5 py-0.5 border border-background/15">
                <span className="size-1.5 rounded-full bg-accent animate-pulse-soft" />
                Active
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-background/10 px-2.5 py-0.5 border border-background/15">
                {FIELDS.identity[2].value}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-background/10 px-2.5 py-0.5 border border-background/15">
                Joined {FIELDS.work[3].value}
              </span>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 h-10 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors">
            Edit profile
            <ArrowIcon className="size-4" />
          </button>
        </div>
      </section>

      <form className="space-y-6">
        <ProfileSection
          title="Identity"
          eyebrow="01"
          description="The basics, used to personalize the experience and route prompts."
          fields={FIELDS.identity}
          delay="rise-2"
        />
        <ProfileSection
          title="Demographics"
          eyebrow="02"
          description="Optional and aggregated for org-wide analytics. Always anonymized at the cohort level."
          fields={FIELDS.demographics}
          delay="rise-3"
        />
        <ProfileSection
          title="Work"
          eyebrow="03"
          description="Used to route the daily prompt to the right team and manager view."
          fields={FIELDS.work}
          delay="rise-4"
        />

        <div className="rise rise-5 flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            type="button"
            className="inline-flex items-center h-11 rounded-full border border-border bg-surface px-5 text-sm font-medium hover:border-foreground/30 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 h-11 rounded-full bg-foreground text-background px-5 text-sm font-medium hover:bg-foreground/85 transition-colors"
          >
            <CheckIcon className="size-4" />
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}

type Field = {
  name: string;
  label: string;
  value: string;
  type?: string;
  select?: string[];
};

function ProfileSection({
  title,
  eyebrow,
  description,
  fields,
  delay,
}: {
  title: string;
  eyebrow: string;
  description: string;
  fields: Field[];
  delay: string;
}) {
  return (
    <section className={`rounded-3xl border border-border bg-surface p-6 lg:p-8 grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-10 rise ${delay}`}>
      <header>
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted font-mono">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl tracking-tight font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">{description}</p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <ProfileField key={f.name} field={f} />
        ))}
      </div>
    </section>
  );
}

function ProfileField({ field }: { field: Field }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
        {field.label}
      </span>
      {field.select ? (
        <div className="mt-1.5 relative">
          <select
            name={field.name}
            defaultValue={field.value}
            className="w-full h-11 rounded-xl border border-border bg-background px-3 pr-9 text-foreground appearance-none focus:border-foreground/40 focus:outline-none transition-colors"
          >
            {field.select.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <input
          name={field.name}
          type={field.type ?? "text"}
          defaultValue={field.value}
          className="mt-1.5 w-full h-11 rounded-xl border border-border bg-background px-3 text-foreground focus:border-foreground/40 focus:outline-none transition-colors"
        />
      )}
    </label>
  );
}
