import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessons, quizzes, users, weeklyGrades } from "@/lib/db/schema";

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
