import { asc, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { updateQuiz } from "@/lib/actions/quizzes";
import { requireTeacher } from "@/lib/dal";
import { db } from "@/lib/db";
import { questions, quizzes, submissions } from "@/lib/db/schema";
import { getContent } from "@/lib/queries";
import { QuizBuilder } from "../../quiz-builder";

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTeacher();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [[quiz], quizQuestions, [taken], lessons] = await Promise.all([
    db.select().from(quizzes).where(eq(quizzes.id, id)),
    db.select().from(questions).where(eq(questions.quizId, id)).orderBy(asc(questions.position)),
    db.select({ id: submissions.id }).from(submissions).where(eq(submissions.quizId, id)).limit(1),
    getContent(),
  ]);
  if (!quiz) notFound();
  if (taken) redirect(`/quizzes/${id}`);

  return (
    <>
      <PageHeader title="Edit quiz" />
      <QuizBuilder
        action={updateQuiz}
        lessons={lessons}
        quizId={id}
        initial={{
          title: quiz.title,
          description: quiz.description ?? "",
          lessonId: quiz.lessonId,
          questions: quizQuestions.map(({ prompt, choices, correctIndex }) => ({
            prompt,
            choices,
            correctIndex,
          })),
        }}
      />
    </>
  );
}
