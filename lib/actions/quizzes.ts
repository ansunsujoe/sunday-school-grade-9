"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { questions, quizzes, submissions } from "@/lib/db/schema";
import { requireStudent, requireTeacher } from "@/lib/dal";
import type { FormState } from "./types";

export type QuizDraft = {
  title: string;
  description: string;
  lessonId: number | null;
  questions: { prompt: string; choices: string[]; correctIndex: number }[];
};

function parseDraft(formData: FormData): QuizDraft | string {
  let draft: QuizDraft;
  try {
    draft = JSON.parse(String(formData.get("draft")));
  } catch {
    return "Something went wrong reading the quiz. Please try again.";
  }

  draft.title = draft.title?.trim() ?? "";
  if (!draft.title) return "Give the quiz a title.";
  if (!draft.questions?.length) return "Add at least one question.";

  for (const [i, q] of draft.questions.entries()) {
    q.prompt = q.prompt.trim();
    q.choices = q.choices.map((c) => c.trim());
    if (!q.prompt) return `Question ${i + 1} needs a prompt.`;
    if (q.choices.length < 2 || q.choices.some((c) => !c)) {
      return `Question ${i + 1} needs at least two non-empty choices.`;
    }
    if (!(q.correctIndex >= 0 && q.correctIndex < q.choices.length)) {
      return `Mark the correct answer for question ${i + 1}.`;
    }
  }
  return draft;
}

function questionRows(quizId: number, draft: QuizDraft) {
  return draft.questions.map((q, position) => ({ quizId, position, ...q }));
}

export async function createQuiz(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const draft = parseDraft(formData);
  if (typeof draft === "string") return { error: draft };

  const [quiz] = await db
    .insert(quizzes)
    .values({
      title: draft.title,
      description: draft.description.trim() || null,
      lessonId: draft.lessonId,
    })
    .returning({ id: quizzes.id });
  await db.insert(questions).values(questionRows(quiz.id, draft));

  revalidatePath("/quizzes");
  redirect(`/quizzes/${quiz.id}`);
}

export async function updateQuiz(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const quizId = Number(formData.get("quizId"));
  const draft = parseDraft(formData);
  if (typeof draft === "string") return { error: draft };

  const [taken] = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(eq(submissions.quizId, quizId))
    .limit(1);
  if (taken) {
    return { error: "Students have already taken this quiz, so its questions can't change." };
  }

  await db.batch([
    db
      .update(quizzes)
      .set({
        title: draft.title,
        description: draft.description.trim() || null,
        lessonId: draft.lessonId,
      })
      .where(eq(quizzes.id, quizId)),
    db.delete(questions).where(eq(questions.quizId, quizId)),
    db.insert(questions).values(questionRows(quizId, draft)),
  ]);

  revalidatePath("/quizzes");
  redirect(`/quizzes/${quizId}`);
}

export async function setQuizPublished(formData: FormData) {
  await requireTeacher();
  const quizId = Number(formData.get("quizId"));
  await db
    .update(quizzes)
    .set({ published: formData.get("published") === "true" })
    .where(eq(quizzes.id, quizId));
  revalidatePath("/quizzes");
  revalidatePath(`/quizzes/${quizId}`);
  revalidatePath("/grades");
}

export async function deleteQuiz(formData: FormData) {
  await requireTeacher();
  await db.delete(quizzes).where(eq(quizzes.id, Number(formData.get("quizId"))));
  revalidatePath("/quizzes");
  revalidatePath("/grades");
  redirect("/quizzes");
}

/** Lets a student retake a quiz by clearing their submission. */
export async function resetSubmission(formData: FormData) {
  await requireTeacher();
  const quizId = Number(formData.get("quizId"));
  const studentId = Number(formData.get("studentId"));
  await db
    .delete(submissions)
    .where(and(eq(submissions.quizId, quizId), eq(submissions.studentId, studentId)));
  revalidatePath(`/quizzes/${quizId}`);
  revalidatePath("/grades");
}

export async function submitQuiz(_: FormState, formData: FormData): Promise<FormState> {
  const student = await requireStudent();
  const quizId = Number(formData.get("quizId"));

  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
  if (!quiz?.published) return { error: "This quiz isn't available." };

  const quizQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, quizId))
    .orderBy(asc(questions.position));

  const answers: Record<string, number> = {};
  let score = 0;
  for (const q of quizQuestions) {
    const raw = formData.get(`q-${q.id}`);
    if (raw === null) return { error: "Answer every question before submitting." };
    answers[q.id] = Number(raw);
    if (answers[q.id] === q.correctIndex) score++;
  }

  const inserted = await db
    .insert(submissions)
    .values({ quizId, studentId: student.id, answers, score, total: quizQuestions.length })
    .onConflictDoNothing()
    .returning({ id: submissions.id });
  if (!inserted.length) return { error: "You've already taken this quiz." };

  revalidatePath(`/quizzes/${quizId}`);
  revalidatePath("/quizzes");
  revalidatePath("/grades");
  redirect(`/quizzes/${quizId}`);
}
