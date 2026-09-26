import { PageHeader } from "@/components/ui";
import { createQuiz } from "@/lib/actions/quizzes";
import { requireTeacher } from "@/lib/dal";
import { getContent } from "@/lib/queries";
import { QuizBuilder } from "../quiz-builder";

export default async function NewQuizPage() {
  await requireTeacher();
  const lessons = await getContent();
  return (
    <>
      <PageHeader
        title="New quiz"
        description="Multiple choice, graded automatically. It stays a draft until you publish it."
      />
      <QuizBuilder action={createQuiz} lessons={lessons} />
    </>
  );
}
