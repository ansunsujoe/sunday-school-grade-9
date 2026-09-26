import { asc, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { updateQuiz } from "@/lib/actions/quizzes";
import { requireTeacher } from "@/lib/dal";
import { db } from "@/lib/db";
import { questions, quizzes, submissions } from "@/lib/db/schema";
import { CONTENT } from "@/lib/content";
import { QuizBuilder } from "../../quiz-builder";

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTeacher();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [[quiz], quizQuestions, [taken]] = await Promise.all([
    db.select().from(quizzes).where(eq(quizzes.id, id)),
    db.select().from(questions).where(eq(questions.quizId, id)).orderBy(asc(questions.position)),
    db.select({ id: submissions.id }).from(submissions).where(eq(submissions.quizId, id)).limit(1),
  ]);
  if (!quiz) notFound();
  if (taken) redirect(`/quizzes/${id}`);

  return (
    <>
      <PageHeader title="Edit quiz" />
      <QuizBuilder
        action={updateQuiz}
        lessons={CONTENT}
        quizId={id}
        initial={{
          title: quiz.title,
          description: quiz.description ?? "",
          lessonSlug: quiz.lessonSlug,
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
