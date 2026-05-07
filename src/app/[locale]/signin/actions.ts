"use server";

import { redirect } from "next/navigation";
import {
  inferRoleFromEmail,
  nameFromEmail,
  setSession,
  type Role,
} from "@/lib/auth";

const DEMO_USER = {
  name: "Mike Chen",
  email: "mike@sayhii-demo.com",
  team: "Grey's Anatomy",
};
const DEMO_ADMIN = {
  name: "Richard Webber",
  email: "rwebber@sayhii-demo.com",
  team: "Grey's Anatomy",
};

export async function signInAsDemo(role: Role, locale: string) {
  const profile = role === "admin" ? DEMO_ADMIN : DEMO_USER;
  await setSession({ ...profile, role });
  redirect(`/${locale}/portal`);
}

export async function signInWithEmail(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const locale = String(formData.get("locale") ?? "en");
  if (!email || !email.includes("@")) {
    redirect(`/${locale}/signin?error=invalid`);
  }
  const role = inferRoleFromEmail(email);
  await setSession({
    email,
    name: nameFromEmail(email),
    role,
    team: "Grey's Anatomy",
  });
  redirect(`/${locale}/portal`);
}
