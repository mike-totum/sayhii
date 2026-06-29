"use server";

import { revalidatePath } from "next/cache";
import type { NoteScope, NoteVisibility } from "@/lib/customers";

// TODO(phase-2-backend): persist to sayhii-core POST /cs/notes (CustomerNote
// table). Author identity comes from the Auth0 token, not the form. Append to
// OrganizationAuditLog. For now this only validates input and revalidates.
export async function addNote(formData: FormData) {
  const scope = String(formData.get("scope") ?? "user") as NoteScope;
  const subject = String(formData.get("subject") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "public") as NoteVisibility;
  const path = String(formData.get("path") ?? "");

  if (!body || !subject) return;

  // no-op persistence until the API exists
  void scope;
  void visibility;

  if (path) revalidatePath(path);
}
