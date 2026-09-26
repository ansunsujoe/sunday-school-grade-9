import "server-only";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { events, lessons, quizzes, users, weeklyGrades, type Role } from "@/lib/db/schema";

export function getStudents() {
  return db
    .select({ id: users.id, name: users.name, username: users.username })
    .from(users)
    .where(eq(users.role, "student"))
    .orderBy(asc(users.name));
}

/** Lessons and supplementary material, newest first. */
export function getContent() {
  return db.select().from(lessons).orderBy(desc(lessons.createdAt));
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
