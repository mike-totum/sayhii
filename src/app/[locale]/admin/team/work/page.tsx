"use client";

import { WorkBoard } from "@/components/admin/work-board";

export default function TeamWorkPage() {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Work</h1>
          <p className="mt-1 text-sm text-muted">
            Epics and issues. Focus an epic, then work it as a board or a list.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <WorkBoard />
      </div>
    </div>
  );
}
