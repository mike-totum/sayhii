import { signIn, isEntraConfigured, isGoogleConfigured } from "@/auth";

// Full-page sign-in shown by the admin layout when there's no valid session.
// Microsoft Entra is the team's IdP and leads; Google remains for the few
// sayhii Workspace accounts. Each button appears only when its provider is
// configured. The domain gates live in src/auth.ts.
export function AdminSignIn({ locale }: { locale: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 text-center">
        <h1 className="font-serif text-2xl tracking-tight">
          say<span className="text-primary italic">hii</span> admin
        </h1>
        <p className="mt-2 text-sm text-muted">
          Internal portal. Sign in with your sayhii work account.
        </p>
        <div className="mt-6 space-y-3">
          {isEntraConfigured && (
            <form
              action={async () => {
                "use server";
                await signIn("microsoft-entra-id", {
                  redirectTo: `/${locale}/admin`,
                });
              }}
            >
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-warm/40">
                <MicrosoftGlyph />
                Continue with Microsoft
              </button>
            </form>
          )}
          {isGoogleConfigured && (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: `/${locale}/admin` });
              }}
            >
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-warm/40">
                <GoogleGlyph />
                Continue with Google
              </button>
            </form>
          )}
        </div>
        <p className="mt-4 text-xs text-muted">
          Only @sayhii.io accounts can access this portal.
        </p>
      </div>
    </div>
  );
}

function MicrosoftGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 23 23" aria-hidden>
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18A13.7 13.7 0 0 1 10.96 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A21.98 21.98 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.18 29.93 1 24 1 15.4 1 7.96 5.93 4.34 13.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}
