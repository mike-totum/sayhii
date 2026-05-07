import { cookies } from "next/headers";

export type Role = "admin" | "user";

export type Session = {
  email: string;
  name: string;
  role: Role;
  team: string;
};

const COOKIE = "sayhii_demo_session";

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.email === "string" &&
      typeof parsed.name === "string" &&
      typeof parsed.team === "string" &&
      (parsed.role === "admin" || parsed.role === "user")
    ) {
      return parsed as Session;
    }
  } catch {}
  return null;
}

export async function setSession(session: Session) {
  const store = await cookies();
  store.set(COOKIE, encodeURIComponent(JSON.stringify(session)), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export function inferRoleFromEmail(email: string): Role {
  return /admin|owner|hr@|chief|ceo|coo|cpo/i.test(email) ? "admin" : "user";
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ") || "Friend";
}
