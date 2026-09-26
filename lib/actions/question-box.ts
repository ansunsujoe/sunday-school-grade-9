"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { questionBox } from "@/lib/db/schema";
import { requireStudent, requireTeacher } from "@/lib/dal";
import type { FormState } from "./types";

const MAX_QUESTION_LENGTH = 1000;

// The teachers' question count lives in the layout, so refresh every page.
const revalidateAll = () => revalidatePath("/", "layout");

/** Adds a question to the box. Only the text and the time are saved, never the student. */
export async function askQuestion(_: FormState, formData: FormData): Promise<FormState> {
  await requireStudent();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write your question first." };
  if (body.length > MAX_QUESTION_LENGTH) {
    return { error: `Keep it under ${MAX_QUESTION_LENGTH} characters.` };
  }

  await db.insert(questionBox).values({ body });
  revalidateAll();
  return { success: "Sent! Your teachers will see it without your name." };
}

export async function removeQuestion(formData: FormData) {
  await requireTeacher();
  await db.delete(questionBox).where(eq(questionBox.id, Number(formData.get("id"))));
  revalidateAll();
}
