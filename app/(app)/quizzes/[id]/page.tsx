import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { ConfirmButton } from "@/components/confirm-button";
import {
  Badge,
  Card,
  PageHeader,
  TextLink,
  buttonClass,
  scoreTone,
  secondaryButtonClass,
} from "@/components/ui";
import {
  deleteQuiz,
  resetSubmission,
  setQuizPublished,
  submitQuiz,
} from "@/lib/actions/quizzes";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { getContentItem } from "@/lib/content";
import { questions, quizzes, submissions } from "@/lib/db/schema";
import { percent } from "@/lib/format";
import { getStudents } from "@/lib/queries";

type Question = typeof questions.$inferSelect;

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [[quiz], quizQuestions] = await Promise.all([
    db.select().from(quizzes).where(eq(quizzes.id, id)),
    db.select().from(questions).where(eq(questions.quizId, id)).orderBy(asc(questions.position)),
  ]);
  if (!quiz || (user.role === "student" && !quiz.published)) notFound();
  const lesson = quiz.lessonSlug ? getContentItem(quiz.lessonSlug) : undefined;

  return (
    <>
      <Link href="/quizzes" className="text-sm text-slate-400 hover:text-slate-100">
        ← All quizzes
      </Link>
      <PageHeader
        title={quiz.title}
        description={
          <>
            {quizQuestions.length} question{quizQuestions.length === 1 ? "" : "s"}
            {lesson?.page && (
              <>
                {" · "}
                <TextLink href={`/content/${lesson.slug}`}>{lesson.title}</TextLink>
              </>
            )}
          </>
        }
      />
      {quiz.description && (
        <p className="-mt-2 mb-6 whitespace-pre-wrap text-sm text-slate-300">{quiz.description}</p>
      )}
      {user.role === "teacher" ? (
        <TeacherView quiz={quiz} questions={quizQuestions} />
      ) : (
        <StudentView quizId={id} studentId={user.id} questions={quizQuestions} />
      )}
    </>
  );
}

async function TeacherView({
  quiz,
  questions: quizQuestions,
}: {
  quiz: typeof quizzes.$inferSelect;
  questions: Question[];
}) {
  const [students, subs] = await Promise.all([
    getStudents(),
    db.select().from(submissions).where(eq(submissions.quizId, quiz.id)),
  ]);
  const byStudent = new Map(subs.map((s) => [s.studentId, s]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <form action={setQuizPublished}>
          <input type="hidden" name="quizId" value={quiz.id} />
          <input type="hidden" name="published" value={String(!quiz.published)} />
          <button className={quiz.published ? secondaryButtonClass : buttonClass}>
            {quiz.published ? "Unpublish" : "Publish to students"}
          </button>
        </form>
        {subs.length === 0 && (
          <Link href={`/quizzes/${quiz.id}/edit`} className={secondaryButtonClass}>
            Edit questions
          </Link>
        )}
        <form action={deleteQuiz}>
          <input type="hidden" name="quizId" value={quiz.id} />
          <ConfirmButton label="Delete quiz" confirmLabel="Delete quiz and all scores?" />
        </form>
        <Badge tone={quiz.published ? "green" : "slate"}>
          {quiz.published ? "Published" : "Draft"}
        </Badge>
      </div>

      <Card title="Results">
        <ul className="divide-y divide-white/5">
          {students.map((s) => {
            const sub = byStudent.get(s.id);
            const pct = sub ? percent(sub.score, sub.total) : null;
            return (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-sm font-medium">{s.name}</span>
                {sub ? (
                  <span className="flex items-center gap-3">
                    <Badge tone={scoreTone(pct)}>
                      {sub.score}/{sub.total} · {pct}%
                    </Badge>
                    <form action={resetSubmission}>
                      <input type="hidden" name="quizId" value={quiz.id} />
                      <input type="hidden" name="studentId" value={s.id} />
                      <ConfirmButton
                        label="Allow retake"
                        confirmLabel="Erase score?"
                        className="text-xs text-slate-400 hover:text-rose-300"
                      />
                    </form>
                  </span>
                ) : (
                  <span className="text-sm text-slate-500">Not taken</span>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <Card title="Answer key">
        <ol className="space-y-5">
          {quizQuestions.map((q, i) => {
            const answered = subs.filter((s) => q.id in s.answers);
            const correct = answered.filter((s) => s.answers[q.id] === q.correctIndex).length;
            return (
              <li key={q.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">
                    {i + 1}. {q.prompt}
                  </p>
                  {answered.length > 0 && (
                    <span className="text-xs text-slate-400">
                      {correct}/{answered.length} correct
                    </span>
                  )}
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {q.choices.map((choice, ci) => (
                    <li
                      key={ci}
                      className={ci === q.correctIndex ? "font-medium text-emerald-300" : "text-slate-400"}
                    >
                      {ci === q.correctIndex ? "✓" : "•"} {choice}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}

async function StudentView({
  quizId,
  studentId,
  questions: quizQuestions,
}: {
  quizId: number;
  studentId: number;
  questions: Question[];
}) {
  const [sub] = await db
    .select()
    .from(submissions)
    .where(and(eq(submissions.quizId, quizId), eq(submissions.studentId, studentId)));

  if (!sub) {
    return (
      <ActionForm action={submitQuiz} submitLabel="Submit answers" pendingLabel="Submitting…" className="space-y-6">
        <input type="hidden" name="quizId" value={quizId} />
        {quizQuestions.map((q, i) => (
          <Card key={q.id}>
            <fieldset>
              <legend className="mb-3 font-medium">
                {i + 1}. {q.prompt}
              </legend>
              <div className="space-y-2">
                {q.choices.map((choice, ci) => (
                  <label
                    key={ci}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-3.5 py-3 text-sm transition hover:bg-wash has-[:checked]:border-amber-400/60 has-[:checked]:bg-amber-400/10"
                  >
                    <input type="radio" name={`q-${q.id}`} value={ci} required className="accent-amber-400" />
                    {choice}
                  </label>
                ))}
              </div>
            </fieldset>
          </Card>
        ))}
        <p className="text-sm text-slate-400">You can only submit once, so check your answers first.</p>
      </ActionForm>
    );
  }

  const pct = percent(sub.score, sub.total);
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-semibold">
            {sub.score}/{sub.total}
          </span>
          <Badge tone={scoreTone(pct)}>{pct}%</Badge>
        </div>
      </Card>
      {quizQuestions.map((q, i) => {
        const chosen = sub.answers[q.id];
        return (
          <Card key={q.id}>
            <p className="mb-3 font-medium">
              {i + 1}. {q.prompt}
            </p>
            <ul className="space-y-1 text-sm">
              {q.choices.map((choice, ci) => {
                const isCorrect = ci === q.correctIndex;
                const isChosen = ci === chosen;
                return (
                  <li
                    key={ci}
                    className={`rounded-lg px-3 py-2 ${
                      isCorrect
                        ? "bg-emerald-400/10 font-medium text-emerald-200"
                        : isChosen
                          ? "bg-rose-400/10 text-rose-200"
                          : "text-slate-400"
                    }`}
                  >
                    {isCorrect ? "✓ " : isChosen ? "✗ " : ""}
                    {choice}
                    {isChosen && <span className="ml-2 text-xs opacity-70">(your answer)</span>}
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
