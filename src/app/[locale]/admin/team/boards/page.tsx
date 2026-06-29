"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTeam } from "@/lib/team-store";
import { KanbanBoard } from "@/components/admin/kanban-board";
import { DeptFilter } from "@/components/admin/dept-filter";

export default function TeamBoardsPage() {
  return (
    <Suspense>
      <BoardsInner />
    </Suspense>
  );
}

function BoardsInner() {
  const { data } = useTeam();
  const deptParam = useSearchParams().get("dept") ?? "";
  const activeDept = data.departments.find((d) => d.id === deptParam) ?? data.departments[0];

  if (!activeDept) {
    return <p className="text-sm text-muted">Add a department first (People tab).</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl tracking-tight">Work boards</h1>
        <DeptFilter value={activeDept.id} departments={data.departments} includeAll={false} />
      </div>
      <p className="mt-1 text-xs text-muted">
        {activeDept.name} · drag cards between columns · click a card to edit
      </p>

      <div className="mt-5">
        <KanbanBoard departmentId={activeDept.id} />
      </div>
    </div>
  );
}
