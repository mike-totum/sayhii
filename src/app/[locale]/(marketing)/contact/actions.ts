"use server";

import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "name"),
  email: z.string().email("email"),
  company: z.string().min(2, "company"),
  headcount: z.string().min(1, "headcount"),
  message: z.string().max(2000).optional().default(""),
});

type ErrorCode = "name" | "email" | "company" | "headcount";

export type WalkthroughFormState = {
  ok: boolean;
  errors?: Partial<Record<ErrorCode, ErrorCode>>;
  formError?: "delivered" | "network";
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
      const code = issue.message as ErrorCode;
      if (!errors[code]) errors[code] = code;
    }
    return { ok: false, errors };
  }

  const data = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  const inboundTo = process.env.SAYHII_INBOX_EMAIL ?? "hi@sayhii.io";
  const fromAddress = process.env.SAYHII_FROM_EMAIL ?? "noreply@sayhii.io";

  const subject = `New walkthrough request: ${data.company}`;
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
        return { ok: false, formError: "delivered" };
      }
    } catch (err) {
      console.error("Resend exception:", err);
      return { ok: false, formError: "network" };
    }
  } else {
    console.log("[walkthrough request — demo mode]\n" + body);
  }

  return {
    ok: true,
    submitted: { name: data.name.split(" ")[0], company: data.company },
  };
}
