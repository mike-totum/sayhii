import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import {
  STATUS_META,
  PRIORITY_META,
  TEMPLATE_KIND_META,
  type Action,
} from "@/lib/portal-actions";
import { themes } from "@/lib/portal-data";

export function StatusPill({ action }: { action: Action }) {
  const meta = STATUS_META[action.status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${meta.tone}`}
    >
      <span className={`size-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function ActionCard({
  action,
  href,
  variant = "default",
}: {
  action: Action;
  href: string;
  variant?: "default" | "compact";
}) {
  const themeName = themes.find((t) => t.key === action.theme)?.name ?? action.theme;
  const tpl = TEMPLATE_KIND_META[action.template.kind];
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-border bg-surface p-5 hover:-translate-y-0.5 transition-transform"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusPill action={action} />
          <span
            className={`text-[11px] font-medium ${PRIORITY_META[action.priority].tone}`}
          >
            {PRIORITY_META[action.priority].label} priority
          </span>
        </div>
        <span className="text-[11px] text-muted">{action.dueLabel}</span>
      </div>

      <h3 className="mt-3 text-base font-medium leading-snug">
        {action.title}
      </h3>
      {variant !== "compact" && (
        <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-2">
          {action.summary}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted min-w-0">
          <span className="rounded-full border border-border bg-background px-2 py-0.5">
            {themeName}
          </span>
          <span className="size-0.5 rounded-full bg-muted" />
          <span className="truncate">{tpl.label}</span>
        </div>
        <span className="inline-flex items-center gap-1 text-foreground font-medium group-hover:text-primary transition-colors">
          Open
          <ArrowIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
