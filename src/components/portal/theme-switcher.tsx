"use client";

import { useRouter } from "next/navigation";

type Item = { key: string; name: string };

export function ThemeSwitcher({
  current,
  items,
  basePath,
}: {
  current: string;
  items: Item[];
  basePath: string;
}) {
  const router = useRouter();
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
        Selected theme
      </span>
      <div className="mt-1.5 relative">
        <select
          value={current}
          onChange={(e) => router.push(`${basePath}/${e.target.value}`)}
          className="appearance-none w-full h-11 rounded-full border border-border bg-surface pl-4 pr-9 text-sm font-medium focus:border-foreground/40 focus:outline-none transition-colors"
        >
          {items.map((it) => (
            <option key={it.key} value={it.key}>
              {it.name}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </label>
  );
}
