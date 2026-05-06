"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  requestWalkthrough,
  type WalkthroughFormState,
} from "./actions";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import type { en } from "@/dictionaries/en";

const initial: WalkthroughFormState = { ok: false };

type ContactDict = (typeof en)["contact"];

export function WalkthroughForm({
  dict,
  notesHref,
  blogHref,
}: {
  dict: ContactDict;
  notesHref: string;
  blogHref: string;
}) {
  const [state, action] = useActionState(requestWalkthrough, initial);

  if (state.ok && state.submitted) {
    return (
      <div className="rounded-[28px] border border-border bg-surface p-8 lg:p-10">
        <div className="size-12 rounded-2xl bg-accent-soft flex items-center justify-center mb-6">
          <CheckIcon className="size-6 text-accent" />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {dict.success.eyebrowPrefix} {state.submitted.name}
        </p>
        <h2 className="mt-3 text-3xl tracking-tight font-semibold">
          {dict.success.heading}
        </h2>
        <p className="mt-3 text-muted leading-relaxed">
          {dict.success.bodyPrefix}{" "}
          <a
            href="mailto:hi@sayhii.io"
            className="text-foreground hover:text-primary transition-colors"
          >
            {dict.success.bodyLink}
          </a>
          {dict.success.bodyAfter}
        </p>
        <p className="mt-6 text-sm text-muted">
          {dict.success.meanwhile}{" "}
          <a
            href={notesHref}
            className="text-foreground hover:text-primary transition-colors"
          >
            {dict.success.notesLink}
          </a>{" "}
          {dict.success.or}{" "}
          <a
            href={blogHref}
            className="text-foreground hover:text-primary transition-colors"
          >
            {dict.success.essaysLink}
          </a>
          {dict.success.end}
        </p>
      </div>
    );
  }

  const f = dict.form;

  return (
    <form
      action={action}
      className="rounded-[28px] border border-border bg-surface p-8 lg:p-10 space-y-5"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {f.stepLabel}
        </p>
        <h2 className="mt-3 text-3xl tracking-tight font-semibold">
          {f.heading}
        </h2>
        <p className="mt-2 text-muted">{f.sub}</p>
      </div>

      {state.formError && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {f.delivery[state.formError]}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          name="name"
          label={f.labels.name}
          placeholder={f.placeholders.name}
          error={state.errors?.name && f.errors.name}
        />
        <Field
          name="email"
          label={f.labels.email}
          placeholder={f.placeholders.email}
          type="email"
          error={state.errors?.email && f.errors.email}
        />
        <Field
          name="company"
          label={f.labels.company}
          placeholder={f.placeholders.company}
          error={state.errors?.company && f.errors.company}
        />
        <Field
          name="headcount"
          label={f.labels.headcount}
          placeholder={f.placeholders.headcount}
          error={state.errors?.headcount && f.errors.headcount}
        />
      </div>
      <Field
        name="message"
        label={f.labels.message}
        placeholder={f.placeholders.message}
        textarea
      />

      <SubmitButton submit={f.submit} submitting={f.submitting} />

      <p className="text-xs text-muted">{f.footnote}</p>
    </form>
  );
}

function SubmitButton({
  submit,
  submitting,
}: {
  submit: string;
  submitting: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 h-12 rounded-full bg-primary px-6 text-primary-foreground font-medium hover:bg-primary-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Spinner /> {submitting}
        </>
      ) : (
        <>
          {submit}
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
