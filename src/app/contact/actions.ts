"use server";

import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please use a valid work email."),
  company: z.string().min(2, "Please enter your company."),
  headcount: z
    .string()
    .min(1, "Headcount helps us prep — even a rough number is fine."),
  message: z.string().max(2000).optional().default(""),
});

export type WalkthroughFormState = {
  ok: boolean;
  errors?: Partial<Record<keyof z.infer<typeof schema>, string>>;
  formError?: string;
  submitted?: { name: string; company: string };
};

export async function requestWalkthrough(
  _prev: WalkthroughFormState,
  formData: FormData,
): Promise<WalkthroughFormState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const errors: WalkthroughFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof schema>;
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  const data = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  const inboundTo = process.env.SAYHII_INBOX_EMAIL ?? "hi@sayhii.io";
  const fromAddress = process.env.SAYHII_FROM_EMAIL ?? "noreply@sayhii.io";

  const subject = `New walkthrough request — ${data.company}`;
  const body = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Company: ${data.company}`,
    `Headcount: ${data.headcount}`,
    "",
    "Message:",
    data.message || "(none)",
  ].join("\n");

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: inboundTo,
          reply_to: data.email,
          subject,
          text: body,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Resend error:", res.status, text);
        return {
          ok: false,
          formError:
            "We couldn't deliver your request. Please email hi@sayhii.io directly — sorry about that.",
        };
      }
    } catch (err) {
      console.error("Resend exception:", err);
      return {
        ok: false,
        formError:
          "Network hiccup on our end. Please email hi@sayhii.io directly.",
      };
    }
  } else {
    // Demo mode: no Resend key configured. Log so the dev can verify the action
    // ran end-to-end. In production set RESEND_API_KEY to deliver to inbox.
    console.log("[walkthrough request — demo mode]\n" + body);
  }

  return {
    ok: true,
    submitted: { name: data.name.split(" ")[0], company: data.company },
  };
}
