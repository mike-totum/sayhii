// Internal admin-portal access.
//
// TODO(phase-1): replace this stub with real authentication — Auth0 on the
// existing live sayhii tenant, Google SSO restricted to the sayhii domain,
// with module grants read from the token's role/permission claims. Until that
// lands, getStaff() returns a placeholder identity so the shell renders in
// local development. THERE IS NO REAL AUTHENTICATION YET — do not deploy.

export type Staff = {
  name: string;
  email: string;
  modules: string[]; // e.g. ["customer-lookup"] — from Auth0 permissions later
};

export async function getStaff(): Promise<Staff | null> {
  // SAFETY: until Auth0 is wired, keep the portal closed in production so an
  // unauthenticated /admin is never exposed on the public site. It stays open
  // in local dev and Vercel previews (which are team-auth protected) for
  // development. TODO(phase-1): replace with the real Auth0 session + grants.
  if (process.env.VERCEL_ENV === "production") return null;

  return {
    name: "Internal Staff",
    email: "staff@sayhii.io",
    modules: ["customer-lookup"],
  };
}

export function hasModule(staff: Staff | null, moduleId: string): boolean {
  return !!staff?.modules.includes(moduleId);
}
