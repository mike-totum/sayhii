"use client";

import { useState } from "react";
import type { EngPR, EngStage } from "@/lib/github";

// Engineering kanban: one swimlane per author, columns by dev stage. Clicking a
// card opens an in-app PR detail (with a link out to GitHub).

const STAGES: { id: EngStage; label: string }[] = [
  { id: "in_progress", label: "In progress" },
  { id: "in_review", label: "In review" },
  { id: "awaiting_merge", label: "Awaiting merge" },
  { id: "merged", label: "Merged · 7d" },
];

function days(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}
function ageLabel(d: number): string {
  return d <= 0 ? "today" : d === 1 ? "1d" : `${d}d`;
}
function fullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function EngineeringBoard({ prs, configured }: { prs: EngPR[]; configured: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = prs.find((p) => p.id === openId) ?? null;

  const byAuthor = new Map<string, EngPR[]>();
  for (const pr of prs) {
    const list = byAuthor.get(pr.author) ?? [];
    list.push(pr);
    byAuthor.set(pr.author, list);
  }
  const authors = [...byAuthor.entries()]
    .map(([author, list]) => ({
      author,
      avatar: list.find((p) => p.authorAvatar)?.authorAvatar ?? "",
      list,
      awaiting: list.filter((p) => p.stage === "awaiting_merge").length,
      active: list.filter((p) => p.stage !== "merged").length,
    }))
    .sort((a, b) => b.awaiting - a.awaiting || b.active - a.active || a.author.localeCompare(b.author));

  const awaitingAll = prs.filter((p) => p.stage === "awaiting_merge");
  const oldestAwaiting = awaitingAll.map((p) => days(p.createdAt)).sort((a, b) => b - a)[0];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Engineering</h1>
          <p className="mt-1 text-sm text-muted">
            Every open PR across sayhii, by author and stage. Reads GitHub live.
          </p>
        </div>
        {configured && (
          <div className="flex items-center gap-3">
            <Stat label="Active PRs" value={`${prs.filter((p) => p.stage !== "merged").length}`} />
            <Stat
              label="Awaiting merge"
              value={`${awaitingAll.length}`}
              warn={awaitingAll.length > 0}
              sub={awaitingAll.length ? `oldest ${ageLabel(oldestAwaiting)}` : undefined}
            />
          </div>
        )}
      </div>

      {!configured ? (
        <Empty>
          GitHub isn&apos;t connected yet. Set a read-only <code>GITHUB_TOKEN</code> to light up the board.
        </Empty>
      ) : authors.length === 0 ? (
        <Empty>No open or recently-merged PRs. 🎉</Empty>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="hidden gap-3 px-1 md:grid md:grid-cols-[12rem_1fr]">
            <span />
            <div className="grid grid-cols-4 gap-3">
              {STAGES.map((s) => (
                <p
                  key={s.id}
                  className={`text-[10px] uppercase tracking-[0.16em] ${
                    s.id === "awaiting_merge" ? "font-semibold text-primary" : "text-muted"
                  }`}
                >
                  {s.label}
                </p>
              ))}
            </div>
          </div>

          {authors.map((a) => (
            <section key={a.author} className="grid items-start gap-3 md:grid-cols-[12rem_1fr]">
              <div className="flex items-center gap-2.5 rounded-2xl glass px-4 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.avatar} alt="" className="size-7 rounded-full" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{a.author}</p>
                  <p className="text-[11px] text-muted">
                    {a.active} active{a.awaiting ? ` · ${a.awaiting} awaiting merge` : ""}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                {STAGES.map((s) => {
                  const cards = a.list.filter((p) => p.stage === s.id);
                  const gate = s.id === "awaiting_merge";
                  return (
                    <div
                      key={s.id}
                      className={`min-h-16 rounded-xl p-2 ${gate ? "bg-primary/5 ring-1 ring-primary/20" : "glass-well"}`}
                    >
                      <p className="mb-1.5 px-1 text-[10px] uppercase tracking-[0.16em] text-muted md:hidden">
                        {s.label}
                      </p>
                      <div className="space-y-2">
                        {cards.map((pr) => (
                          <PrCard key={pr.id} pr={pr} gate={gate} onOpen={() => setOpenId(pr.id)} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {open && <PrDetail pr={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function PrCard({ pr, gate, onOpen }: { pr: EngPR; gate: boolean; onOpen: () => void }) {
  const age = pr.stage === "merged" && pr.mergedAt ? days(pr.mergedAt) : days(pr.createdAt);
  const stale = gate && age >= 2;
  const repoShort = pr.repo.split("/")[1] ?? pr.repo;
  return (
    <button
      onClick={onOpen}
      className="block w-full glass rounded-lg px-2.5 py-2 text-left transition-transform hover:-translate-y-0.5"
    >
      <p className="text-[13px] font-medium leading-snug">{pr.title}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted">
        <span className="rounded-full bg-white/60 px-1.5 py-px font-mono">{repoShort}</span>
        <span>#{pr.number}</span>
        <span className={stale ? "font-semibold text-primary" : ""}>
          {pr.stage === "merged" ? `merged ${ageLabel(age)} ago` : `open ${ageLabel(age)}`}
        </span>
      </div>
    </button>
  );
}

const STAGE_LABEL: Record<EngStage, string> = {
  in_progress: "In progress",
  in_review: "In review",
  awaiting_merge: "Awaiting merge",
  merged: "Merged",
};

const REVIEW_TONE: Record<string, string> = {
  APPROVED: "text-accent",
  CHANGES_REQUESTED: "text-primary",
  COMMENTED: "text-muted",
  DISMISSED: "text-muted",
  PENDING: "text-muted",
};

function PrDetail({ pr, onClose }: { pr: EngPR; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/30 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-2xl rounded-2xl glass shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-white/50 p-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="rounded-full bg-white/60 px-2 py-0.5 font-mono">{pr.repo}</span>
              <span>#{pr.number}</span>
              <span className="rounded-full bg-foreground px-2 py-0.5 text-background">{STAGE_LABEL[pr.stage]}</span>
            </div>
            <h2 className="mt-2 font-serif text-xl leading-snug tracking-tight">{pr.title}</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* meta */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pr.authorAvatar} alt="" className="size-5 rounded-full" />
              <span className="font-medium text-foreground">{pr.author}</span>
            </span>
            <span>opened {fullDate(pr.createdAt)}</span>
            {pr.mergedAt && <span>merged {fullDate(pr.mergedAt)}</span>}
          </div>

          {/* branch + stats */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-md bg-white/60 px-2 py-1 font-mono">
              {pr.headRef} → {pr.baseRef}
            </span>
            <span className="rounded-md bg-white/60 px-2 py-1">
              <span className="text-accent">+{pr.additions}</span>{" "}
              <span className="text-primary">−{pr.deletions}</span>
            </span>
            <span className="rounded-md bg-white/60 px-2 py-1">{pr.changedFiles} files</span>
            <span className="rounded-md bg-white/60 px-2 py-1">{pr.commits} commits</span>
          </div>

          {/* labels */}
          {pr.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pr.labels.map((l) => (
                <span
                  key={l.name}
                  className="rounded-full border px-2 py-0.5 text-[11px]"
                  style={{ borderColor: l.color + "88", backgroundColor: l.color + "1a" }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          )}

          {/* reviewers */}
          <Field label="Reviews">
            {pr.reviewers.length === 0 ? (
              <p className="text-sm text-muted">No reviews yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {pr.reviewers.map((r) => (
                  <li key={r.login} className="flex items-center gap-2 text-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.avatar} alt="" className="size-5 rounded-full" />
                    <span className="font-medium">{r.login}</span>
                    <span className={`text-xs ${REVIEW_TONE[r.state] ?? "text-muted"}`}>
                      {r.state.replace("_", " ").toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Field>

          {/* description */}
          <Field label="Description">
            {pr.body.trim() ? (
              <p className="max-h-60 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {pr.body}
              </p>
            ) : (
              <p className="text-sm text-muted">No description.</p>
            )}
          </Field>
        </div>

        <div className="flex items-center justify-between border-t border-white/50 p-4">
          <span className="text-xs text-muted">{pr.reviewDecision?.replace("_", " ").toLowerCase() || "review required"}</span>
          <a
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-foreground px-4 py-1.5 text-sm text-background transition-colors hover:bg-primary"
          >
            View on GitHub →
          </a>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-muted">{label}</p>
      {children}
    </div>
  );
}

function Stat({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div className="glass rounded-xl px-3.5 py-2 text-center">
      <p className={`font-serif text-xl tabular-nums leading-none ${warn ? "text-primary" : ""}`}>{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
      {sub && <p className="text-[10px] text-muted">{sub}</p>}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 rounded-2xl glass px-6 py-10 text-center text-sm text-muted">{children}</div>;
}
