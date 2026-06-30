// Internal admin-portal access.
//
// Real auth is Google Workspace SSO (see src/auth.ts), restricted to the
// sayhii.io domain. getStaff() reads that session. Until an OAuth client is
// configured (AUTH_GOOGLE_ID unset — e.g. local dev), it falls back to a dev
// identity so the portal still renders locally; that fallback is never used on
// a real production deploy.
import { auth } from "@/auth";

export type Staff = {
  name: string;
  email: string;
  modules: string[]; // module grants; everyone @sayhii.io gets these for now
};

const STAFF_MODULES = ["customer-lookup", "team-tracking"];

const isAuthConfigured = Boolean(process.env.AUTH_GOOGLE_ID);

export async function getStaff(): Promise<Staff | null> {
  // No OAuth client configured yet: open in local dev (so the portal renders
  // without Google), closed on any real deploy.
  if (!isAuthConfigured) {
    if (process.env.NODE_ENV === "production") return null;
    return { name: "Michael Bomhoff", email: "michael.bomhoff@sayhii.io", modules: STAFF_MODULES };
  }

  // Real session. The signIn callback already enforces the domain; we re-check
  // here so a stale/forged session can't slip a non-sayhii email through.
  const session = await auth();
  const email = (session?.user?.email ?? "").toLowerCase();
  if (!email.endsWith("@sayhii.io")) return null;

  return {
    name: session?.user?.name ?? email,
    email,
    modules: STAFF_MODULES,
  };
}

export function hasModule(staff: Staff | null, moduleId: string): boolean {
  return !!staff?.modules.includes(moduleId);
}
