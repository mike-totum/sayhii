"use client";

import { useState } from "react";
import { addNote } from "@/app/[locale]/admin/customers/actions";
import type { Note, NoteScope } from "@/lib/customers";

export function NotesPanel({
  title,
  scope,
  subject,
  organization,
  path,
  notes,
}: {
  title: string;
  scope: NoteScope;
  subject: string;
  organization: string;
  path: string; // current page path, for revalidation
  notes: Note[];
}) {
  const [composing, setComposing] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "personal">("public");

  return (
    <section className="rounded-2xl glass overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/50">
        <h3 className="text-sm font-medium">
          {title}{" "}
          <span className="text-muted font-normal">({notes.length})</span>
        </h3>
        <button
          type="button"
          onClick={() => setComposing((v) => !v)}
          className="text-xs font-medium rounded-[4px] border border-border px-3 py-1.5 hover:bg-background transition-colors"
        >
          {composing ? "Cancel" : "+ Add note"}
        </button>
      </div>

      {composing && (
        <form
          action={addNote}
          className="px-5 py-4 border-b border-border space-y-3"
          onSubmit={() => setComposing(false)}
        >
          <input type="hidden" name="scope" value={scope} />
          <input type="hidden" name="subject" value={subject} />
          <input type="hidden" name="organization" value={organization} />
          <input type="hidden" name="path" value={path} />
          <input type="hidden" name="visibility" value={visibility} />
          <textarea
            name="body"
            required
            rows={3}
            placeholder="What did they ask? What did you do?"
            className="w-full rounded-[4px] border border-border bg-background px-3 py-2 text-sm placeholder:text-muted/70 focus:border-foreground/40 focus:outline-none transition-colors"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex rounded-[4px] border border-border overflow-hidden text-xs">
              {(["public", "personal"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`px-3 py-1.5 capitalize transition-colors ${
                    visibility === v
                      ? "bg-foreground text-background"
                      : "bg-surface text-muted hover:text-foreground"
                  }`}
                >
                  {v === "personal" ? "🔒 Personal" : "Public"}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="text-xs font-medium rounded-[4px] bg-foreground text-background px-4 py-1.5 hover:bg-primary transition-colors"
            >
              Save note
            </button>
          </div>
        </form>
      )}

      <ul className="divide-y divide-border">
        {notes.map((n) => (
          <li key={n.id} className="px-5 py-4">
            <div className="flex items-center gap-2 text-xs text-muted mb-1.5">
              {n.pinned && <span aria-label="Pinned">📌</span>}
              <span className="font-medium text-foreground">{n.authorName}</span>
              <span>·</span>
              <span>{n.createdAtLabel}</span>
              {n.visibility === "personal" && (
                <span aria-label="Personal note" title="Personal — only you">
                  🔒
                </span>
              )}
              {n.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-background border border-border px-2 py-0.5 text-[10px]"
                >
                  #{t}
                </span>
              ))}
            </div>
            <p className="text-sm leading-relaxed">{n.body}</p>
          </li>
        ))}
        {notes.length === 0 && (
          <li className="px-5 py-6 text-sm text-muted text-center">
            No notes yet.
          </li>
        )}
      </ul>
    </section>
  );
}
