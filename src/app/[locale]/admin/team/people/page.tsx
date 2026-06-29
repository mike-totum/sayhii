import { listDepartments, listPeople } from "@/lib/team";
import { OrgBuilder } from "@/components/admin/org-builder";

export default async function TeamPeoplePage() {
  const [departments, people] = await Promise.all([listDepartments(), listPeople()]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl tracking-tight">People &amp; departments</h1>
        <span className="text-xs text-muted">
          Drag people between departments · {people.length} staff
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">
        Changes aren&apos;t saved yet — wiring to the backend is the next step.
      </p>

      <div className="mt-5">
        <OrgBuilder departments={departments} initialPeople={people} />
      </div>
    </div>
  );
}
