import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { attendance, lessons, quizzes, submissions, users } from "@/lib/db/schema";
import { percent } from "@/lib/format";

export function getStudents() {
  return db
    .select({ id: users.id, name: users.name, username: users.username })
    .from(users)
    .where(eq(users.role, "student"))
    .orderBy(asc(users.name));
}

export function getLessons() {
  return db.select().from(lessons).orderBy(asc(lessons.date));
}

export function getPublishedQuizzes() {
  return db
    .select()
    .from(quizzes)
    .where(eq(quizzes.published, true))
    .orderBy(desc(quizzes.createdAt));
}

/** Quiz scores and attendance for each student, for the gradebook. */
export async function getGradebook() {
  const [students, quizList, subs, attendanceRows] = await Promise.all([
    getStudents(),
    getPublishedQuizzes(),
    db.select().from(submissions),
    db.select().from(attendance),
  ]);

  const rows = students.map((student) => {
    const scores = new Map(
      subs
        .filter((s) => s.studentId === student.id)
        .map((s) => [s.quizId, { score: s.score, total: s.total }]),
    );
    const taken = quizList.flatMap((q) => scores.get(q.id) ?? []);
    const earned = taken.reduce((sum, s) => sum + s.score, 0);
    const possible = taken.reduce((sum, s) => sum + s.total, 0);

    const marks = attendanceRows.filter((a) => a.studentId === student.id);
    const present = marks.filter((a) => a.status === "present").length;
    const absent = marks.filter((a) => a.status === "absent").length;
    const excused = marks.filter((a) => a.status === "excused").length;

    return {
      student,
      scores,
      quizAverage: percent(earned, possible),
      attendance: {
        present,
        absent,
        excused,
        // Excused absences don't count against the rate.
        rate: percent(present, present + absent),
      },
    };
  });

  return { quizzes: quizList, rows };
}
