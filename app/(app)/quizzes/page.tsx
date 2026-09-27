import { desc } from "drizzle-orm";
import Link from "next/link";
import { Badge, Card, EmptyState, PageHeader, buttonClass, scoreTone } from "@/components/ui";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { quizzes, submissions } from "@/lib/db/schema";
import { percent } from "@/lib/format";
import { getPublishedQuizzes, getStudents } from "@/lib/queries";

export default async function QuizzesPage() {
  const user = await requireUser();
  return user.role === "teacher" ? <TeacherQuizzes /> : <StudentQuizzes studentId={user.id} />;
}

async function TeacherQuizzes() {
  const [quizList, subs, students] = await Promise.all([
    db.select().from(quizzes).orderBy(desc(quizzes.createdAt)),
    db.select({ quizId: submissions.quizId }).from(submissions),
    getStudents(),
  ]);

  return (
    <>
      <PageHeader
        title="Quizzes"
        description="Drafts are only visible to teachers until you publish them."
        action={
          <Link href="/quizzes/new" className={buttonClass}>
            New quiz
          </Link>
        }
      />
      <Card>
        {quizList.length === 0 ? (
          <EmptyState>No quizzes yet. Create one to get started.</EmptyState>
        ) : (
          <ul className="divide-y divide-white/5">
            {quizList.map((quiz) => {
              const taken = subs.filter((s) => s.quizId === quiz.id).length;
              return (
                <li key={quiz.id}>
                  <Link
                    href={`/quizzes/${quiz.id}`}
                    className="-mx-2 flex flex-wrap items-center justify-between gap-2 rounded-xl px-2 py-3 transition hover:bg-wash"
                  >
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
    </>
  );
}

async function StudentQuizzes({ studentId }: { studentId: number }) {
  const [quizList, subs] = await Promise.all([
    getPublishedQuizzes(),
    db.select().from(submissions),
  ]);
  const mine = new Map(subs.filter((s) => s.studentId === studentId).map((s) => [s.quizId, s]));

  return (
    <>
      <PageHeader title="Quizzes" />
      <Card>
        {quizList.length === 0 ? (
          <EmptyState>No quizzes yet. Check back after class!</EmptyState>
        ) : (
          <ul className="divide-y divide-white/5">
            {quizList.map((quiz) => {
              const sub = mine.get(quiz.id);
              const pct = sub ? percent(sub.score, sub.total) : null;
              return (
                <li key={quiz.id}>
                  <Link
                    href={`/quizzes/${quiz.id}`}
                    className="-mx-2 flex flex-wrap items-center justify-between gap-2 rounded-xl px-2 py-3 transition hover:bg-wash"
                  >
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
    </>
  );
}
