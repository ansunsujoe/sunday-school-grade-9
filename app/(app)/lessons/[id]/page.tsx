import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { ConfirmButton } from "@/components/confirm-button";
import { Icon } from "@/components/icons";
import { Badge, Card, EmptyState, PageHeader, TextLink, buttonClass } from "@/components/ui";
import { deleteLesson, updateLesson } from "@/lib/actions/lessons";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { lessons, quizzes } from "@/lib/db/schema";
import { LessonFields } from "../lesson-fields";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
  if (!lesson) notFound();

  const isTeacher = user.role === "teacher";
  const linkedQuizzes = await db
    .select()
    .from(quizzes)
    .where(
      isTeacher
        ? eq(quizzes.lessonId, id)
        : and(eq(quizzes.lessonId, id), eq(quizzes.published, true)),
    );

  return (
    <>
      <Link
        href="/lessons"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100"
      >
        <Icon name="arrowLeft" className="size-4" /> All lessons
      </Link>
      <PageHeader
        eyebrow="Lesson"
        title={lesson.title}
        action={
          <a href={lesson.url} target="_blank" rel="noopener noreferrer" className={buttonClass}>
            Open lesson <Icon name="external" className="size-4" />
          </a>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Quizzes">
          {linkedQuizzes.length === 0 ? (
            <EmptyState>No quizzes for this lesson.</EmptyState>
          ) : (
            <ul className="space-y-2">
              {linkedQuizzes.map((q) => (
                <li key={q.id} className="flex items-center gap-2">
                  <TextLink href={`/quizzes/${q.id}`}>{q.title}</TextLink>
                  {!q.published && <Badge>Draft</Badge>}
                </li>
              ))}
            </ul>
          )}
        </Card>
        {isTeacher && (
          <div className="space-y-6">
            <Card title="Edit lesson">
              <ActionForm action={updateLesson} submitLabel="Save changes">
                <input type="hidden" name="id" value={lesson.id} />
                <LessonFields lesson={lesson} />
              </ActionForm>
            </Card>
            <form action={deleteLesson}>
              <input type="hidden" name="id" value={lesson.id} />
              <ConfirmButton label="Delete lesson" confirmLabel="Click again to delete" />
            </form>
          </div>
        )}
      </div>
    </>
  );
}
