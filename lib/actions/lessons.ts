"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { lessons } from "@/lib/db/schema";
import { requireTeacher } from "@/lib/dal";
import type { FormState } from "./types";

function readLesson(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    url: String(formData.get("url") ?? "").trim(),
  };
}

function validateLesson(lesson: ReturnType<typeof readLesson>) {
  if (!lesson.title) return "Title is required.";
  try {
    const { protocol } = new URL(lesson.url);
    if (protocol === "http:" || protocol === "https:") return null;
  } catch {}
  return "Paste a full link starting with https://";
}

export async function createLesson(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const lesson = readLesson(formData);
  const error = validateLesson(lesson);
  if (error) return { error };

  await db.insert(lessons).values(lesson);
  revalidatePath("/lessons");
  revalidatePath("/");
  return { success: `Added "${lesson.title}".` };
}

export async function updateLesson(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const id = Number(formData.get("id"));
  const lesson = readLesson(formData);
  const error = validateLesson(lesson);
  if (error) return { error };

  await db.update(lessons).set(lesson).where(eq(lessons.id, id));
  revalidatePath("/lessons");
  revalidatePath(`/lessons/${id}`);
  revalidatePath("/");
  return { success: "Lesson saved." };
}

export async function deleteLesson(formData: FormData) {
  await requireTeacher();
  await db.delete(lessons).where(eq(lessons.id, Number(formData.get("id"))));
  revalidatePath("/lessons");
  revalidatePath("/");
  redirect("/lessons");
}
