import "server-only";

// BFF client for the activation-service's internal read endpoint. Surfaces the
// monthly-activation numbers (answered vs expected over the trailing 90-day
// window) so Customer Lookup can reconcile "I didn't get my activation" tickets.
// The numbers are computed in Snowflake and owned by the activation-service; we
// only read them. The internal token is server-side env and never reaches the
// browser.
//   ACTIVATION_API_URL          e.g. https://<api-id>.execute-api.us-east-1.amazonaws.com/dev
//   ACTIVATION_INTERNAL_TOKEN   shared server-to-server bearer token
const BASE = (process.env.ACTIVATION_API_URL ?? "").replace(/\/$/, "");
const TOKEN = process.env.ACTIVATION_INTERNAL_TOKEN ?? "";

export const isActivationConfigured = Boolean(BASE && TOKEN);

export type ActivationMonth = {
  orgId: string;
  monthId: string; // YYYYMM
  answered: number;
  expected: number;
  answeredPct: number | null;
  eligible: boolean;
  // Whether we actually sent the activation, from the approvals table (the send
  // system of record). Independent of eligibility: a user can be eligible but
  // not sent (QA-blocked, rejected, still pending, or a delivery failure).
  sent: boolean;
  sentStatus: string | null; // SENT | FAILED | APPROVED | PENDING_APPROVAL | REJECTED | QA_BLOCKED | null
  sentAt: string | null; // ISO timestamp when sent
  // From Snowflake's USER_ACTIVATION_STATUS view: an activation was generated
  // for this month. Months predating the approvals table have generated=true
  // but no send record — treat as delivered via the legacy path.
  generated?: boolean;
};

export async function getActivationStatus(
  email: string,
): Promise<ActivationMonth[] | null> {
  if (!isActivationConfigured) return null;
  try {
    const res = await fetch(
      `${BASE}/api/users/activation-status?email=${encodeURIComponent(email)}`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { months?: ActivationMonth[] };
    return Array.isArray(data.months) ? data.months : [];
  } catch {
    return null;
  }
}
