"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { announcementReads, announcementRecipients, announcements, users } from "@/lib/db/schema";
import { requireTeacher, requireUser } from "@/lib/dal";
import type { FormState } from "./types";

function readAnnouncement(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    audience: formData.get("audience") === "selected" ? ("selected" as const) : ("all" as const),
  };
}

function validateAnnouncement(a: ReturnType<typeof readAnnouncement>, recipientIds: number[]) {
  if (!a.title) return "Title is required.";
  if (!a.body) return "Write the announcement.";
  if (a.audience === "selected" && recipientIds.length === 0) return "Choose at least one student.";
  return null;
}

/** The checked students, keeping only ids that belong to student accounts. */
async function readRecipients(formData: FormData) {
  if (formData.get("audience") !== "selected") return [];
  const ids = formData.getAll("recipients").map(Number).filter(Number.isInteger);
  if (ids.length === 0) return [];
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(and(inArray(users.id, ids), eq(users.role, "student")));
  return rows.map((r) => r.id);
}

const recipientRows = (announcementId: number, userIds: number[]) =>
  userIds.map((userId) => ({ announcementId, userId }));

// The header's unread badge lives in the layout, so refresh every page.
const revalidateAll = () => revalidatePath("/", "layout");

export async function createAnnouncement(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireTeacher();
  const announcement = readAnnouncement(formData);
  const recipientIds = await readRecipients(formData);
  const error = validateAnnouncement(announcement, recipientIds);
  if (error) return { error };

  const [{ id }] = await db
    .insert(announcements)
    .values({ ...announcement, authorId: user.id })
    .returning({ id: announcements.id });
  // The author has obviously read it.
  const markRead = db.insert(announcementReads).values({ userId: user.id, announcementId: id });
  if (recipientIds.length > 0) {
    await db.batch([markRead, db.insert(announcementRecipients).values(recipientRows(id, recipientIds))]);
  } else {
    await markRead;
  }
  revalidateAll();
  redirect("/announcements");
}

export async function updateAnnouncement(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const id = Number(formData.get("id"));
  const announcement = readAnnouncement(formData);
  const recipientIds = await readRecipients(formData);
  const error = validateAnnouncement(announcement, recipientIds);
  if (error) return { error };

  // Students newly added to the list see it as new; neon-http has no
  // interactive transactions, but a batch runs atomically.
  const update = db
    .update(announcements)
    .set({ ...announcement, updatedAt: new Date() })
    .where(eq(announcements.id, id));
  const clear = db.delete(announcementRecipients).where(eq(announcementRecipients.announcementId, id));
  if (recipientIds.length > 0) {
    await db.batch([update, clear, db.insert(announcementRecipients).values(recipientRows(id, recipientIds))]);
  } else {
    await db.batch([update, clear]);
  }
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
