"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { weeklyGrades } from "@/lib/db/schema";
import { requireTeacher } from "@/lib/dal";
import { SUNDAYS } from "@/lib/school-year";
import type { FormState } from "./types";

/** "Y"/"N" radio value -> boolean, anything else -> blank. */
function yesNo(value: FormDataEntryValue | null) {
  if (value === "Y") return true;
  if (value === "N") return false;
  return null;
}

/** Blank -> null, whole number 0–100 -> number, anything else -> undefined (invalid). */
function score(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const n = Number(text);
  return Number.isInteger(n) && n >= 0 && n <= 100 ? n : undefined;
}

export async function saveWeek(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const date = String(formData.get("date") ?? "");
  if (!SUNDAYS.includes(date)) return { error: "Pick a Sunday in the school year." };

  const studentIds = formData.getAll("studentId").map(Number).filter(Number.isInteger);
  const rows: (typeof weeklyGrades.$inferInsert)[] = [];
  for (const studentId of studentIds) {
    const present = yesNo(formData.get(`present-${studentId}`));
    // Absent students have nothing else to grade that Sunday, so anything
    // still typed in their other slots is ignored.
    if (present === false) {
      rows.push({ studentId, date, present, memoryVerse: null, quiz: null, sermonNotes: null });
      continue;
    }
    const memoryVerse = score(formData.get(`memoryVerse-${studentId}`));
    const quiz = score(formData.get(`quiz-${studentId}`));
    if (memoryVerse === undefined || quiz === undefined) {
      return { error: "Scores must be whole numbers from 0 to 100." };
    }
    const row = {
      studentId,
      date,
      present,
      memoryVerse,
      quiz,
      sermonNotes: yesNo(formData.get(`sermonNotes-${studentId}`)),
    };
    // Rows with every slot blank are simply not stored.
    if (row.present !== null || memoryVerse !== null || quiz !== null || row.sermonNotes !== null) {
      rows.push(row);
    }
  }
  if (studentIds.length === 0) return { error: "No students to save." };

  const clear = db
    .delete(weeklyGrades)
    .where(and(eq(weeklyGrades.date, date), inArray(weeklyGrades.studentId, studentIds)));
  if (rows.length) {
    // neon-http has no interactive transactions; a batch runs atomically.
    await db.batch([clear, db.insert(weeklyGrades).values(rows)]);
  } else {
    await clear;
  }

  revalidatePath("/grades", "layout");
  revalidatePath("/");
  return { success: "Saved." };
}
