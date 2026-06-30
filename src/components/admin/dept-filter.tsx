"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Department } from "@/lib/team";

export function DeptFilter({
  value,
  departments,
  includeAll = true,
}: {
  value: string;
  departments: Department[];
  includeAll?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <select
      value={value}
      aria-label="Filter by department"
      onChange={(e) => {
        const v = e.target.value;
        router.push(v ? `${pathname}?dept=${v}` : pathname);
      }}
      className="h-9 rounded-[4px] border border-border bg-surface px-3 text-sm focus:border-foreground/40 focus:outline-none"
    >
      {includeAll && <option value="">All departments</option>}
      {departments.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name}
        </option>
      ))}
    </select>
  );
}
