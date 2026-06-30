import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Internal portal auth: Google Workspace SSO, locked to the sayhii.io domain.
// Only @sayhii.io accounts can sign in. Credentials come from env:
//   AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
// Until those are set (e.g. local dev without an OAuth client), admin-auth.ts
// falls back to a dev identity, so the portal still renders locally.
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true, // preview/branch deploys aren't always auto-detected
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Ask Google to restrict the account chooser to the sayhii domain.
      authorization: { params: { hd: "sayhii.io", prompt: "select_account" } },
    }),
  ],
  callbacks: {
    // Hard domain gate: even if someone reaches the consent screen with another
    // account, reject anything that isn't a verified @sayhii.io identity.
    async signIn({ profile }) {
      const email = (profile?.email ?? "").toLowerCase();
      const hd = (profile as { hd?: string } | undefined)?.hd;
      return Boolean(profile?.email_verified) && (hd === "sayhii.io" || email.endsWith("@sayhii.io"));
    },
  },
});
