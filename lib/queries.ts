import "server-only";
import { and, asc, count, desc, eq, exists, gte, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  announcementReads,
  announcementRecipients,
  announcements,
  events,
  questionBox,
  quizzes,
  users,
  weeklyGrades,
  type Role,
} from "@/lib/db/schema";

export function getStudents() {
  return db
    .select({ id: users.id, name: users.name, username: users.username })
    .from(users)
    .where(eq(users.role, "student"))
    .orderBy(asc(users.name));
}

export function getPublishedQuizzes() {
  return db
    .select()
    .from(quizzes)
    .where(eq(quizzes.published, true))
    .orderBy(desc(quizzes.createdAt));
}

/** Sunday gradebook rows, for one student or the whole class. */
export function getWeeklyGrades(studentId?: number) {
  return db
    .select()
    .from(weeklyGrades)
    .where(studentId === undefined ? undefined : eq(weeklyGrades.studentId, studentId))
    .orderBy(asc(weeklyGrades.date));
}

/** Calendar events between two YYYY-MM-DD dates (inclusive) that `role` may see. */
export function getEvents(role: Role, from: string, to: string) {
  return db
    .select()
    .from(events)
    .where(
      and(
        gte(events.date, from),
        lte(events.date, to),
        role === "teacher" ? undefined : eq(events.audience, "all"),
      ),
    )
    // All-day events first, then by start time.
    .orderBy(asc(events.date), sql`${events.startTime} asc nulls first`, asc(events.id));
}

type Reader = { id: number; role: Role; createdAt: Date };

// Announcements from before someone's account existed never count as unread.
const unreadBy = (user: Reader) =>
  and(isNull(announcementReads.userId), gte(announcements.createdAt, user.createdAt));

// Teachers see every announcement; students see the ones for everyone and the
// ones addressed to them.
const visibleTo = (user: Reader) =>
  user.role === "teacher"
    ? undefined
    : or(
        eq(announcements.audience, "all"),
        exists(
          db
            .select({ one: sql`1` })
            .from(announcementRecipients)
            .where(
              and(
                eq(announcementRecipients.announcementId, announcements.id),
                eq(announcementRecipients.userId, user.id),
              ),
            ),
        ),
      );

/** Announcements newest first, with the author's name and whether `user` hasn't seen it. */
export function getAnnouncements(user: Reader, limit?: number) {
  const query = db
    .select({
      id: announcements.id,
      title: announcements.title,
      body: announcements.body,
      createdAt: announcements.createdAt,
      updatedAt: announcements.updatedAt,
      audience: announcements.audience,
      author: users.name,
      unread: sql<boolean>`coalesce(${unreadBy(user)}, false)`,
    })
    .from(announcements)
    .leftJoin(users, eq(announcements.authorId, users.id))
    .leftJoin(
      announcementReads,
      and(eq(announcementReads.announcementId, announcements.id), eq(announcementReads.userId, user.id)),
    )
    .where(visibleTo(user))
    .orderBy(desc(announcements.createdAt), desc(announcements.id));
  return limit ? query.limit(limit) : query;
}

/** The students each of the given announcements was sent to, by announcement id. */
export async function getAnnouncementRecipients(ids: number[]) {
  const byAnnouncement = new Map<number, { id: number; name: string }[]>();
  if (ids.length === 0) return byAnnouncement;
  const rows = await db
    .select({ announcementId: announcementRecipients.announcementId, id: users.id, name: users.name })
    .from(announcementRecipients)
    .innerJoin(users, eq(announcementRecipients.userId, users.id))
    .where(inArray(announcementRecipients.announcementId, ids))
    .orderBy(asc(users.name));
  for (const { announcementId, ...student } of rows) {
    byAnnouncement.set(announcementId, [...(byAnnouncement.get(announcementId) ?? []), student]);
  }
  return byAnnouncement;
}

export type AnnouncementItem = Awaited<ReturnType<typeof getAnnouncements>>[number];

export async function getUnreadAnnouncementCount(user: Reader) {
  const [{ n }] = await db
    .select({ n: count() })
    .from(announcements)
    .leftJoin(
      announcementReads,
      and(eq(announcementReads.announcementId, announcements.id), eq(announcementReads.userId, user.id)),
    )
    .where(and(unreadBy(user), visibleTo(user)));
  return n;
}

/** How many anonymous questions are waiting for the teachers. */
export async function getQuestionBoxCount() {
  const [{ n }] = await db.select({ n: count() }).from(questionBox);
  return n;
}
