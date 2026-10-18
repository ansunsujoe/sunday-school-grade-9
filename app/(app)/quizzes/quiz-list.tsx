import { desc } from "drizzle-orm";
import Link from "next/link";
import { Badge, Card, EmptyState, scoreTone } from "@/components/ui";
import type { CurrentUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { quizzes, submissions } from "@/lib/db/schema";
import { percent } from "@/lib/format";
import { getPublishedQuizzes, getStudents } from "@/lib/queries";

/**
 * Every quiz, as shown in the Content tab. Teachers see drafts and how many
 * have taken each one; students see their score, or a way in.
 */
export async function QuizList({ user }: { user: CurrentUser }) {
  return user.role === "teacher" ? <TeacherQuizzes /> : <StudentQuizzes studentId={user.id} />;
}

const rowClass =
  "-mx-2 flex flex-wrap items-center justify-between gap-2 px-2 py-3 transition hover:bg-wash";

async function TeacherQuizzes() {
  const [quizList, subs, students] = await Promise.all([
    db.select().from(quizzes).orderBy(desc(quizzes.createdAt)),
    db.select({ quizId: submissions.quizId }).from(submissions),
    getStudents(),
  ]);

  return (
    <Card>
      {quizList.length === 0 ? (
        <EmptyState>No quizzes yet. Create one to get started.</EmptyState>
      ) : (
        <ul className="divide-y divide-line-faint">
          {quizList.map((quiz) => {
            const taken = subs.filter((s) => s.quizId === quiz.id).length;
            return (
              <li key={quiz.id}>
                <Link href={`/quizzes/${quiz.id}`} className={rowClass}>
                  <span className="font-medium">{quiz.title}</span>
                  <span className="flex items-center gap-2 text-sm text-slate-400">
                    {quiz.published ? (
                      <>
                        {taken}/{students.length} taken <Badge tone="green">Published</Badge>
                      </>
                    ) : (
                      <Badge>Draft</Badge>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

async function StudentQuizzes({ studentId }: { studentId: number }) {
  const [quizList, subs] = await Promise.all([getPublishedQuizzes(), db.select().from(submissions)]);
  const mine = new Map(subs.filter((s) => s.studentId === studentId).map((s) => [s.quizId, s]));

  return (
    <Card>
      {quizList.length === 0 ? (
        <EmptyState>No quizzes yet. Check back after class!</EmptyState>
      ) : (
        <ul className="divide-y divide-line-faint">
          {quizList.map((quiz) => {
            const sub = mine.get(quiz.id);
            const pct = sub ? percent(sub.score, sub.total) : null;
            return (
              <li key={quiz.id}>
                <Link href={`/quizzes/${quiz.id}`} className={rowClass}>
                  <span className="font-medium">{quiz.title}</span>
                  {sub ? (
                    <Badge tone={scoreTone(pct)}>
                      {sub.score}/{sub.total} · {pct}%
                    </Badge>
                  ) : (
                    <Badge tone="gold">Take quiz →</Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
