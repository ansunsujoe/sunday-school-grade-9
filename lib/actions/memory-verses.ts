"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { memoryVerses } from "@/lib/db/schema";
import { requireTeacher } from "@/lib/dal";
import { formatDate } from "@/lib/format";
import { SUNDAYS } from "@/lib/school-year";
import { lookupKjv } from "@/lib/verses";
import type { FormState } from "./types";

function readVerse(formData: FormData) {
  return {
    sunday: String(formData.get("sunday") ?? ""),
    reference: String(formData.get("reference") ?? "").trim(),
    text: String(formData.get("text") ?? "").replace(/\s+/g, " ").trim(),
  };
}

/** Checks the fields, and that no other verse already has the Sunday. */
async function validateVerse(verse: ReturnType<typeof readVerse>, id?: number) {
  if (!SUNDAYS.includes(verse.sunday)) return "Pick a Sunday.";
  if (!verse.reference) return "Add the reference, e.g. John 3:16.";
  if (!verse.text) return "Add the verse text, or look it up from the reference.";
  const [taken] = await db
    .select({ id: memoryVerses.id })
    .from(memoryVerses)
    .where(
      id === undefined
        ? eq(memoryVerses.sunday, verse.sunday)
        : and(eq(memoryVerses.sunday, verse.sunday), ne(memoryVerses.id, id)),
    );
  return taken ? `There's already a memory verse for ${formatDate(verse.sunday)}.` : null;
}

function refresh() {
  revalidatePath("/memory-verse");
  revalidatePath("/");
}

export async function createMemoryVerse(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const verse = readVerse(formData);
  const error = await validateVerse(verse);
  if (error) return { error };

  await db.insert(memoryVerses).values(verse);
  refresh();
  redirect("/memory-verse");
}

export async function updateMemoryVerse(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const id = Number(formData.get("id"));
  const verse = readVerse(formData);
  const error = await validateVerse(verse, id);
  if (error) return { error };

  await db.update(memoryVerses).set(verse).where(eq(memoryVerses.id, id));
  refresh();
  redirect("/memory-verse");
}

export async function deleteMemoryVerse(formData: FormData) {
  await requireTeacher();
  await db.delete(memoryVerses).where(eq(memoryVerses.id, Number(formData.get("id"))));
  refresh();
  redirect("/memory-verse");
}

/** Fills in the KJV text for a reference typed into the verse form. */
export async function lookupMemoryVerse(
  reference: string,
): Promise<{ reference: string; text: string } | { error: string }> {
  await requireTeacher();
  if (!reference.trim()) return { error: "Type a reference first, e.g. John 3:16." };
  try {
    const found = await lookupKjv(reference.trim());
    return found ?? { error: `Couldn't find “${reference.trim()}”. Check the book, chapter and verse.` };
  } catch {
    return { error: "The lookup didn't respond. Try again, or paste the verse in." };
  }
}
