"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkCredentials, createSession, SESSION_COOKIE, SESSION_SECONDS } from "@/agent/lib/private-auth";

export async function login(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");
  if (typeof username !== "string" || typeof password !== "string" || !checkCredentials(username, password)) {
    // Do not reveal which credential failed. Server Actions provide same-origin CSRF protection.
    await new Promise((resolve) => setTimeout(resolve, 750));
    redirect("/login?error=1");
  }
  (await cookies()).set(SESSION_COOKIE, createSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
