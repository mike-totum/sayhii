"use client";

// Crafted empty state. At a 5-person company the tool is mostly empty states
// for the first weeks — they should feel designed, not like a shrug.

export function EmptyState({
  icon,
  title,
  line,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  line?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-foreground/15 bg-white/30 px-6 py-8 text-center">
      {icon && (
        <span className="mb-2.5 flex size-9 items-center justify-center rounded-full bg-warm text-muted">
          {icon}
        </span>
      )}
      <p className="text-sm font-medium">{title}</p>
      {line && <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted">{line}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
