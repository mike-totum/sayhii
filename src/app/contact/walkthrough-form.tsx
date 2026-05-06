"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  requestWalkthrough,
  type WalkthroughFormState,
} from "./actions";
import { ArrowIcon, CheckIcon } from "@/components/icons";

const initial: WalkthroughFormState = { ok: false };

export function WalkthroughForm() {
  const [state, action] = useActionState(requestWalkthrough, initial);

  if (state.ok && state.submitted) {
    return (
      <div className="rounded-[28px] border border-border bg-surface p-8 lg:p-10">
        <div className="size-12 rounded-2xl bg-accent-soft flex items-center justify-center mb-6">
          <CheckIcon className="size-6 text-accent" />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Got it, {state.submitted.name}
        </p>
        <h2 className="mt-3 text-3xl tracking-tight font-semibold">
          We&rsquo;ll be in touch within the hour.
        </h2>
        <p className="mt-3 text-muted leading-relaxed">
          A real person on the sayhii team will email you back from{" "}
          <a
            href="mailto:hi@sayhii.io"
            className="text-foreground hover:text-primary transition-colors"
          >
            hi@sayhii.io
          </a>
          .
        </p>
        <p className="mt-6 text-sm text-muted">
          In the meantime — flip through the latest{" "}
          <a
            href="/notes"
            className="text-foreground hover:text-primary transition-colors"
          >
            Notes from the Field
          </a>{" "}
          or{" "}
          <a
            href="/blog"
            className="text-foreground hover:text-primary transition-colors"
          >
            essays from sayhii
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="rounded-[28px] border border-border bg-surface p-8 lg:p-10 space-y-5"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Step 1 of 1
        </p>
        <h2 className="mt-3 text-3xl tracking-tight font-semibold">
          Tell us a little about you.
        </h2>
        <p className="mt-2 text-muted">
          Five fields. We&rsquo;ll send a calendar link within an hour.
        </p>
      </div>

      {state.formError && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {state.formError}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          name="name"
          label="Your name"
          placeholder="Jamie Rivera"
          error={state.errors?.name}
        />
        <Field
          name="email"
          label="Work email"
          placeholder="jamie@company.com"
          type="email"
          error={state.errors?.email}
        />
        <Field
          name="company"
          label="Company"
          placeholder="Northwind, Inc."
          error={state.errors?.company}
        />
        <Field
          name="headcount"
          label="Headcount"
          placeholder="220"
          error={state.errors?.headcount}
        />
      </div>
      <Field
        name="message"
        label="What are you hoping to see?"
        placeholder="We're considering replacing our annual survey..."
        textarea
        error={state.errors?.message}
      />

      <SubmitButton />

      <p className="text-xs text-muted">
        We don&rsquo;t do drip sequences. One real human will reply.
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 h-12 rounded-full bg-primary px-6 text-primary-foreground font-medium hover:bg-primary-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Spinner /> Sending&hellip;
        </>
      ) : (
        <>
          Request a walkthrough
          <ArrowIcon className="size-4" />
        </>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Field({
  name,
  label,
  placeholder,
  type = "text",
  textarea = false,
  error,
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  textarea?: boolean;
  error?: string;
}) {
  const baseClasses =
    "mt-2 block w-full rounded-2xl border bg-background px-4 text-foreground placeholder:text-muted/70 focus:outline-none transition-colors";
  const stateClasses = error
    ? "border-primary focus:border-primary"
    : "border-border focus:border-foreground/40";
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          rows={4}
          className={`${baseClasses} ${stateClasses} py-3 resize-none`}
          aria-invalid={Boolean(error)}
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          className={`${baseClasses} ${stateClasses} h-12`}
          aria-invalid={Boolean(error)}
        />
      )}
      {error && <span className="mt-1.5 block text-xs text-primary">{error}</span>}
    </label>
  );
}
