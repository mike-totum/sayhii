"use server";

import { signOut as authSignOut } from "@/auth";

// Ends the Google SSO session and returns to the portal, which then shows the
// sign-in screen. When no OAuth client is configured (local dev), this is a
// no-op session-wise and just redirects.
export async function signOut(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  await authSignOut({ redirectTo: `/${locale}/admin` });
}
