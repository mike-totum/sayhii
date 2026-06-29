import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db, isDbConfigured } from "@/db";
import { customerNotes } from "@/db/schema";
import { getStaff } from "./admin-auth";
import type { Note, NoteScope } from "./customers";

// Notes for a subject: all public notes plus the requester's own personal
// notes, pinned first then newest. Requester identity comes from the staff
// session (stub today; the Auth0 session later).
export async function listNotes(scope: NoteScope, subject: string): Promise<Note[]> {
  if (!isDbConfigured) return [];
  const staff = await getStaff();
  const requester = (staff?.email ?? "").toLowerCase();

  const rows = await db
    .select()
    .from(customerNotes)
    .where(and(eq(customerNotes.scope, scope), eq(customerNotes.subject, subject)))
    .orderBy(desc(customerNotes.pinned), desc(customerNotes.createdAt));

  return rows
    .filter((n) => n.visibility === "public" || n.authorEmail.toLowerCase() === requester)
    .map(
      (n): Note => ({
        id: n.id,
        scope: n.scope,
        subject: n.subject,
        authorName: n.authorName,
        authorEmail: n.authorEmail,
        createdAtLabel: n.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        body: n.body,
        visibility: n.visibility,
        tags: n.tags ?? [],
        pinned: n.pinned,
      }),
    );
}
