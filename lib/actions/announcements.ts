"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { announcementReads, announcements } from "@/lib/db/schema";
import { requireTeacher, requireUser } from "@/lib/dal";
import type { FormState } from "./types";

function readAnnouncement(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
  };
}

function validateAnnouncement(a: ReturnType<typeof readAnnouncement>) {
  if (!a.title) return "Title is required.";
  if (!a.body) return "Write the announcement.";
  return null;
}

// The header's unread badge lives in the layout, so refresh every page.
const revalidateAll = () => revalidatePath("/", "layout");

export async function createAnnouncement(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireTeacher();
  const announcement = readAnnouncement(formData);
  const error = validateAnnouncement(announcement);
  if (error) return { error };

  const [{ id }] = await db
    .insert(announcements)
    .values({ ...announcement, authorId: user.id })
    .returning({ id: announcements.id });
  // The author has obviously read it.
  await db.insert(announcementReads).values({ userId: user.id, announcementId: id });
  revalidateAll();
  redirect("/announcements");
}

export async function updateAnnouncement(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const id = Number(formData.get("id"));
  const announcement = readAnnouncement(formData);
  const error = validateAnnouncement(announcement);
  if (error) return { error };

  await db
    .update(announcements)
    .set({ ...announcement, updatedAt: new Date() })
    .where(eq(announcements.id, id));
  revalidateAll();
  redirect(`/announcements#a-${id}`);
}

export async function deleteAnnouncement(formData: FormData) {
  await requireTeacher();
  await db.delete(announcements).where(eq(announcements.id, Number(formData.get("id"))));
  revalidateAll();
  redirect("/announcements");
}

/** Marks announcements as read for the current user. */
export async function markAnnouncementsRead(ids: number[]) {
  const user = await requireUser();
  const valid = ids.filter(Number.isInteger);
  if (valid.length === 0) return;
  await db
    .insert(announcementReads)
    .values(valid.map((announcementId) => ({ userId: user.id, announcementId })))
    .onConflictDoNothing();
  revalidateAll();
}
