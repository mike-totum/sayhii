import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { ArrowIcon } from "@/components/icons";
import { isLocale } from "@/lib/i18n";
import { signInAsDemo, signInWithEmail } from "./actions";

type Props = { params: Promise<{ locale: string }> };

export default async function SignInPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const continueAsUser = async () => {
    "use server";
    await signInAsDemo("user", locale);
  };
  const continueAsAdmin = async () => {
    "use server";
    await signInAsDemo("admin", locale);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-6 lg:px-10 h-16 flex items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur">
        <Link href={`/${locale}`} className="flex items-center">
          <Logo />
        </Link>
        <span className="text-sm text-muted">Sign in</span>
      </header>

      <main className="flex-1 grid lg:grid-cols-[1.1fr_1fr]">
        <section className="relative flex items-center justify-center px-6 lg:px-12 py-16 overflow-hidden">
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute -top-24 -right-16 size-[420px] rounded-full bg-warm blur-3xl opacity-70" />
            <div className="absolute bottom-0 left-0 size-[360px] rounded-full bg-accent-soft blur-3xl opacity-70" />
          </div>

          <div className="w-full max-w-md">
            <h1 className="rise text-4xl lg:text-5xl tracking-tight font-semibold leading-tight">
              Welcome back to{" "}
              <span className="font-serif italic text-primary">sayhii</span>.
            </h1>
            <p className="rise rise-1 mt-3 text-muted leading-relaxed">
              Sign in with your work email. We&rsquo;ll route you to the right
              view.
            </p>

            <form action={signInWithEmail} className="rise rise-2 mt-8 space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <label className="block">
                <span className="text-sm font-medium">Work email</span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="mt-2 block w-full h-12 rounded-md border border-border bg-surface px-4 text-foreground placeholder:text-muted/70 focus:border-foreground/40 focus:outline-none transition-colors"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 h-12 w-full rounded-full bg-foreground text-background font-medium hover:bg-foreground/85 transition-colors"
              >
                Continue
                <ArrowIcon className="size-4" />
              </button>
            </form>

            <div className="mt-10 relative">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs uppercase tracking-[0.2em] text-muted">
                  Try the demo
                </span>
              </div>
            </div>

            <div className="rise rise-3 mt-6 grid sm:grid-cols-2 gap-3">
              <form action={continueAsUser}>
                <button
                  type="submit"
                  className="group w-full h-full text-left rounded-md border border-border bg-surface p-5 transition-all hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-30px_rgba(15,17,23,0.3)]"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    Continue as
                  </p>
                  <p className="mt-2 text-lg font-medium">Employee</p>
                  <p className="mt-2 text-sm text-muted">
                    Your daily prompts, scorecard, and vitals.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium group-hover:text-primary transition-colors">
                    Open
                    <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              </form>

              <form action={continueAsAdmin}>
                <button
                  type="submit"
                  className="group w-full h-full text-left rounded-md border border-primary/40 bg-primary/5 p-5 transition-all hover:border-primary hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-30px_rgba(255,107,91,0.45)]"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">
                    Continue as
                  </p>
                  <p className="mt-2 text-lg font-medium">Admin</p>
                  <p className="mt-2 text-sm text-muted">
                    Org-wide vitals, themes, hierarchy, users.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Open
                    <ArrowIcon className="size-4" />
                  </span>
                </button>
              </form>
            </div>

            <p className="mt-8 text-xs text-muted">
              By continuing you agree to our{" "}
              <Link
                href={`/${locale}/privacy`}
                className="text-foreground hover:text-primary transition-colors"
              >
                privacy policy
              </Link>
              .
            </p>
          </div>
        </section>

        <aside className="hidden lg:flex relative items-center justify-center bg-foreground text-background overflow-hidden">
          <div className="grain" />
          <div aria-hidden className="absolute inset-0">
            <div className="absolute -top-24 -right-24 size-[420px] rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 size-[420px] rounded-full bg-accent/20 blur-3xl" />
          </div>
          <div className="relative max-w-md p-12">
            <p className="text-xs uppercase tracking-[0.2em] text-background/60">
              Inside sayhii
            </p>
            <p className="mt-5 text-3xl tracking-tight font-medium leading-snug">
              <span className="font-serif italic">Three seconds</span> a day
              becomes the clearest picture of your team you&rsquo;ve ever had.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-background/80">
              {[
                "Adaptive daily prompts, no survey fatigue",
                "Trust, workload, safety, clarity, belonging",
                "Anonymous · aggregated at sample size 5+",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
