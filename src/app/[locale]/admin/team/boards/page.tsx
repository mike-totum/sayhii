import {
  listDepartments,
  listPeople,
  listWorkCards,
} from "@/lib/team";
import { KanbanBoard } from "@/components/admin/kanban-board";
import { DeptFilter } from "@/components/admin/dept-filter";

type Props = { searchParams: Promise<{ dept?: string }> };

export default async function TeamBoardsPage({ searchParams }: Props) {
  const departments = await listDepartments();
  const { dept } = await searchParams;
  const activeDept = departments.find((d) => d.id === dept) ?? departments[0];

  const [people, cards] = await Promise.all([
    listPeople(),
    listWorkCards(activeDept.id),
  ]);
  const nameById = Object.fromEntries(people.map((p) => [p.id, p.name]));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl tracking-tight">Work boards</h1>
        <DeptFilter value={activeDept.id} departments={departments} includeAll={false} />
      </div>
      <p className="mt-1 text-xs text-muted">
        {activeDept.name} · drag cards between columns (not saved yet)
      </p>

      <div className="mt-5">
        <KanbanBoard initialCards={cards} nameById={nameById} />
      </div>
    </div>
  );
}
