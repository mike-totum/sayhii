"use server";

import { redirect } from "next/navigation";

// TODO(phase-1): clear the Auth0 session / call the Auth0 logout endpoint.
// No real session exists yet, so this just returns to the marketing site.
export async function signOut(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  redirect(`/${locale}`);
}
