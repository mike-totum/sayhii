"use server";

import { redirect } from "next/navigation";
import { clearSession } from "@/lib/auth";

export async function signOut(formData: FormData) {
  await clearSession();
  const locale = String(formData.get("locale") ?? "en");
  redirect(`/${locale}/signin`);
}
