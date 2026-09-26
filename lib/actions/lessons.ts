"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { attendance, lessons, type AttendanceStatus } from "@/lib/db/schema";
import { requireTeacher } from "@/lib/dal";
import type { FormState } from "./types";

function readLesson(formData: FormData) {
  return {
    date: String(formData.get("date") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    scripture: String(formData.get("scripture") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

function validateLesson(lesson: ReturnType<typeof readLesson>) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lesson.date)) return "Pick a date.";
  if (!lesson.title) return "Title is required.";
  return null;
}

export async function createLesson(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const lesson = readLesson(formData);
  const error = validateLesson(lesson);
  if (error) return { error };

  await db.insert(lessons).values(lesson);
  revalidatePath("/lessons");
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
  return { success: "Lesson saved." };
}

export async function deleteLesson(formData: FormData) {
  await requireTeacher();
  await db.delete(lessons).where(eq(lessons.id, Number(formData.get("id"))));
  revalidatePath("/lessons");
  redirect("/lessons");
}

const STATUSES: AttendanceStatus[] = ["present", "absent", "excused"];

export async function saveAttendance(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireTeacher();
  const lessonId = Number(formData.get("lessonId"));

  const rows: { lessonId: number; studentId: number; status: AttendanceStatus }[] = [];
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^status-(\d+)$/);
    if (match && STATUSES.includes(value as AttendanceStatus)) {
      rows.push({ lessonId, studentId: Number(match[1]), status: value as AttendanceStatus });
    }
  }

  const clear = db.delete(attendance).where(eq(attendance.lessonId, lessonId));
  if (rows.length) {
    // neon-http has no interactive transactions; a batch runs atomically.
    await db.batch([clear, db.insert(attendance).values(rows)]);
  } else {
    await clear;
  }

  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath("/grades");
  return { success: "Attendance saved." };
}
