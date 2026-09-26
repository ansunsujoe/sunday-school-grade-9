"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { EVENT_AUDIENCES, events, type EventAudience } from "@/lib/db/schema";
import { requireTeacher } from "@/lib/dal";
import type { FormState } from "./types";

function readEvent(formData: FormData) {
  const audience = String(formData.get("audience"));
  return {
    title: String(formData.get("title") ?? "").trim(),
    date: String(formData.get("date") ?? ""),
    startTime: String(formData.get("startTime") ?? "") || null,
    endTime: String(formData.get("endTime") ?? "") || null,
    audience: (EVENT_AUDIENCES.includes(audience as EventAudience) ? audience : "all") as EventAudience,
    noSundaySchool: formData.get("noSundaySchool") === "on",
  };
}

function validateEvent(event: ReturnType<typeof readEvent>) {
  if (!event.title) return "Title is required.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) return "Pick a date.";
  if (event.endTime && !event.startTime) return "Add a start time, or clear the end time.";
  if (event.startTime && event.endTime && event.endTime <= event.startTime) {
    return "The end time must be after the start time.";
  }
  return null;
}

/** Back to the month the event is in. */
function monthHref(date: string) {
  return `/calendar?month=${date.slice(0, 7)}`;
}

export async function createEvent(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const event = readEvent(formData);
  const error = validateEvent(event);
  if (error) return { error };

  await db.insert(events).values(event);
  revalidatePath("/calendar");
  redirect(monthHref(event.date));
}

export async function updateEvent(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const id = Number(formData.get("id"));
  const event = readEvent(formData);
  const error = validateEvent(event);
  if (error) return { error };

  await db.update(events).set(event).where(eq(events.id, id));
  revalidatePath("/calendar");
  redirect(monthHref(event.date));
}

export async function deleteEvent(formData: FormData) {
  await requireTeacher();
  const [deleted] = await db
    .delete(events)
    .where(eq(events.id, Number(formData.get("id"))))
    .returning({ date: events.date });
  revalidatePath("/calendar");
  redirect(deleted ? monthHref(deleted.date) : "/calendar");
}
