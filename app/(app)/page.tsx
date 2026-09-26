import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Badge, Card, EmptyState, PageHeader, TextLink, scoreTone } from "@/components/ui";
import { requireUser, type CurrentUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { quizzes, submissions, users } from "@/lib/db/schema";
import { formatDate, percent, today } from "@/lib/format";
import { getGradebook, getLessons } from "@/lib/queries";

export default async function HomePage() {
  const user = await requireUser();
  const lessons = await getLessons();
  const nextLesson = lessons.find((l) => l.date >= today());

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}!`} />
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Next lesson">
          {nextLesson ? (
            <Link href={`/lessons/${nextLesson.id}`} className="block hover:opacity-80">
              <div className="text-lg font-medium">{nextLesson.title}</div>
              <div className="text-sm text-stone-600">
                {formatDate(nextLesson.date)}
                {nextLesson.scripture && <> · {nextLesson.scripture}</>}
              </div>
            </Link>
          ) : (
            <EmptyState>No upcoming lessons scheduled.</EmptyState>
          )}
        </Card>
        {user.role === "teacher" ? <TeacherHome /> : <StudentHome user={user} />}
      </div>
    </>
  );
}

async function TeacherHome() {
  const recent = await db
    .select({
      id: submissions.id,
      score: submissions.score,
      total: submissions.total,
      student: users.name,
      quizId: quizzes.id,
      quiz: quizzes.title,
    })
    .from(submissions)
    .innerJoin(users, eq(submissions.studentId, users.id))
    .innerJoin(quizzes, eq(submissions.quizId, quizzes.id))
    .orderBy(desc(submissions.submittedAt))
    .limit(8);

  return (
    <Card title="Recent quiz submissions">
      {recent.length === 0 ? (
        <EmptyState>No submissions yet.</EmptyState>
      ) : (
        <ul className="divide-y divide-stone-100 text-sm">
          {recent.map((r) => {
            const pct = percent(r.score, r.total);
            return (
              <li key={r.id} className="flex items-center justify-between gap-2 py-2">
                <span>
                  {r.student} · <TextLink href={`/quizzes/${r.quizId}`}>{r.quiz}</TextLink>
                </span>
                <Badge tone={scoreTone(pct)}>{pct}%</Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

async function StudentHome({ user }: { user: CurrentUser }) {
  const { quizzes: quizList, rows } = await getGradebook();
  const me = rows.find((r) => r.student.id === user.id);
  const todo = quizList.filter((q) => !me?.scores.has(q.id));

  return (
    <>
      <Card title="Quizzes to take">
        {todo.length === 0 ? (
          <EmptyState>You&apos;re all caught up! 🎉</EmptyState>
        ) : (
          <ul className="space-y-2">
            {todo.map((q) => (
              <li key={q.id}>
                <TextLink href={`/quizzes/${q.id}`}>{q.title} →</TextLink>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="At a glance" className="md:col-span-2">
        <div className="grid grid-cols-2 gap-4 text-center">
          <Stat label="Quiz average" value={me?.quizAverage} />
          <Stat label="Attendance" value={me?.attendance.rate} />
        </div>
        <p className="mt-4 text-center text-sm">
          <TextLink href="/grades">See all my grades →</TextLink>
        </p>
      </Card>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="rounded-lg bg-stone-50 p-4">
      <div className="text-3xl font-semibold">{value == null ? "—" : `${value}%`}</div>
      <div className="text-sm text-stone-600">{label}</div>
    </div>
  );
}
