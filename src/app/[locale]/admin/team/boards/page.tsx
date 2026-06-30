"use client";

import { CompanyBoard } from "@/components/admin/company-board";

export default function TeamBoardsPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl tracking-tight">Work board</h1>
      <p className="mt-1 text-xs text-muted">
        Every team&apos;s work in one place — group, filter down, and drag.
      </p>
      <div className="mt-4">
        <CompanyBoard />
      </div>
    </div>
  );
}
