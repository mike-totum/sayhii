"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { customerNotes } from "@/db/schema";
import { getStaff } from "@/lib/admin-auth";
import type { NoteScope, NoteVisibility } from "@/lib/customers";

// Persists a CS note to Postgres. Author identity comes from the staff session
// (stub today; the Auth0 session later) — never the form, so it can't be forged.
export async function addNote(formData: FormData) {
  const scope = String(formData.get("scope") ?? "user") as NoteScope;
  const subject = String(formData.get("subject") ?? "");
  const organization = String(formData.get("organization") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "public") as NoteVisibility;
  const path = String(formData.get("path") ?? "");

  if (!body || !subject) return;

  const staff = await getStaff();
  if (!staff) return;

  await db.insert(customerNotes).values({
    scope,
    subject,
    organization,
    authorEmail: staff.email,
    authorName: staff.name,
    body,
    visibility,
  });

  // TODO(audit): also append to an audit trail once that store exists.
  if (path) revalidatePath(path);
}
