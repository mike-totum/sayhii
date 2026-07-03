import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

// Internal portal auth, locked to sayhii.io identities.
//
// The team's identity provider is Microsoft Entra (M365) — that's the primary
// sign-in. Google Workspace is only minimally configured at sayhii (Firebase
// admin etc.), so Google SSO stays available as a secondary for the few
// accounts that exist there.
//
// Env (either provider is optional; the sign-in page offers what's configured):
//   AUTH_SECRET
//   AUTH_MICROSOFT_ENTRA_ID_ID / _SECRET
//   AUTH_MICROSOFT_ENTRA_ID_ISSUER   https://login.microsoftonline.com/<tenant-id>/v2.0
//   AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
// Until any provider is set (e.g. local dev), admin-auth.ts falls back to a
// dev identity, so the portal still renders locally.
export const isGoogleConfigured = Boolean(process.env.AUTH_GOOGLE_ID);
export const isEntraConfigured = Boolean(
  process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true, // preview/branch deploys aren't always auto-detected
  providers: [
    ...(isEntraConfigured
      ? [
          MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            // Single-tenant issuer — tokens from other tenants don't validate.
            issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
          }),
        ]
      : []),
    ...(isGoogleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            // Ask Google to restrict the account chooser to the sayhii domain.
            authorization: {
              params: { hd: "sayhii.io", prompt: "select_account" },
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    // Hard domain gate on top of each provider's own restriction: reject
    // anything that isn't a sayhii.io identity, whichever door it came in.
    async signIn({ account, profile }) {
      if (account?.provider === "microsoft-entra-id") {
        // The tenant is pinned by the issuer; the email check guards against
        // an issuer misconfiguration (e.g. accidentally left multi-tenant).
        const email = (
          profile?.email ??
          (profile as { preferred_username?: string } | undefined)
            ?.preferred_username ??
          ""
        ).toLowerCase();
        return email.endsWith("@sayhii.io");
      }
      if (account?.provider === "google") {
        const email = (profile?.email ?? "").toLowerCase();
        const hd = (profile as { hd?: string } | undefined)?.hd;
        return (
          Boolean(profile?.email_verified) &&
          (hd === "sayhii.io" || email.endsWith("@sayhii.io"))
        );
      }
      return false;
    },
  },
});
