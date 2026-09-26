"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CONTENT_KINDS, lessons, type ContentKind } from "@/lib/db/schema";
import { requireTeacher } from "@/lib/dal";
import type { FormState } from "./types";

function readContent(formData: FormData) {
  const kind = String(formData.get("kind"));
  return {
    title: String(formData.get("title") ?? "").trim(),
    kind: (CONTENT_KINDS.includes(kind as ContentKind) ? kind : "lesson") as ContentKind,
    url: String(formData.get("url") ?? "").trim() || null,
    body: String(formData.get("body") ?? "").trim() || null,
  };
}

function validateContent(content: ReturnType<typeof readContent>) {
  if (!content.title) return "Title is required.";
  if (!content.url && !content.body) return "Add a link, write the page, or both.";
  if (content.url) {
    try {
      const { protocol } = new URL(content.url);
      if (protocol !== "http:" && protocol !== "https:") throw new Error();
    } catch {
      return "Links must be a full address starting with https://";
    }
  }
  return null;
}

function revalidateContent(id?: number) {
  revalidatePath("/content");
  if (id) revalidatePath(`/content/${id}`);
  revalidatePath("/");
}

export async function createContent(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const content = readContent(formData);
  const error = validateContent(content);
  if (error) return { error };

  const [{ id }] = await db.insert(lessons).values(content).returning({ id: lessons.id });
  revalidateContent();
  redirect(`/content/${id}`);
}

export async function updateContent(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const id = Number(formData.get("id"));
  const content = readContent(formData);
  const error = validateContent(content);
  if (error) return { error };

  await db.update(lessons).set(content).where(eq(lessons.id, id));
  revalidateContent(id);
  return { success: "Saved." };
}

export async function deleteContent(formData: FormData) {
  await requireTeacher();
  await db.delete(lessons).where(eq(lessons.id, Number(formData.get("id"))));
  revalidateContent();
  redirect("/content");
}
