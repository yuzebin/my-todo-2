"use server";

import { redirect } from "next/navigation";

import { createSession, logout } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { ActionState, LoginSchema, SignupSchema } from "@/lib/validation";

export async function signup(state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = SignupSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const email = parsed.data.email.toLowerCase();
  const name = parsed.data.name && parsed.data.name.length > 0 ? parsed.data.name : null;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already registered" };

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  });

  await createSession(user.id);
  redirect("/todos");
}

export async function login(state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Invalid email or password" };

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return { error: "Invalid email or password" };

  await createSession(user.id);
  redirect("/todos");
}

export async function signout() {
  await logout();
  redirect("/login");
}
