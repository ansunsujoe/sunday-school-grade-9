"use server";

import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireTeacher } from "@/lib/dal";
import type { FormState } from "./types";

const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/;

export async function createUser(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "teacher" ? "teacher" : "student";

  if (!name) return { error: "Name is required." };
  if (!USERNAME_PATTERN.test(username)) {
    return {
      error: "Username must be 3–32 characters: letters, numbers, dots, dashes, or underscores.",
    };
  }
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const [existing] = await db.select().from(users).where(eq(users.username, username));
  if (existing) return { error: `The username "${username}" is already taken.` };

  await db.insert(users).values({
    name,
    username,
    role,
    passwordHash: await bcrypt.hash(password, 10),
  });
  revalidatePath("/people");
  return { success: `Created ${role} account for ${name}.` };
}

export async function resetPassword(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireTeacher();
  const userId = Number(formData.get("userId"));
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(password, 10) })
    .where(eq(users.id, userId));
  return { success: "Password reset." };
}

export async function deleteStudent(formData: FormData) {
  await requireTeacher();
  const userId = Number(formData.get("userId"));
  // Teachers can't be deleted from the UI, so nobody locks themselves out.
  await db.delete(users).where(and(eq(users.id, userId), eq(users.role, "student")));
  revalidatePath("/people");
}
