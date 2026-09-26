import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { ConfirmButton } from "@/components/confirm-button";
import { Badge, Card, EmptyState, PageHeader, TextLink } from "@/components/ui";
import { deleteLesson, saveAttendance, updateLesson } from "@/lib/actions/lessons";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { attendance, lessons, quizzes } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { getStudents } from "@/lib/queries";
import { LessonFields } from "../lesson-fields";

const STATUS_TONE = { present: "green", absent: "red", excused: "amber" } as const;

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
      <Link href="/lessons" className="text-sm text-stone-500 hover:text-stone-800">
        ← All lessons
      </Link>
      <PageHeader
        title={lesson.title}
        description={
          <>
            {formatDate(lesson.date)}
            {lesson.scripture && <> · {lesson.scripture}</>}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {lesson.notes && (
            <Card title="Notes">
              <p className="whitespace-pre-wrap text-sm leading-6 text-stone-700">{lesson.notes}</p>
            </Card>
          )}
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
          {isTeacher ? <AttendanceCard lessonId={id} /> : <MyAttendance lessonId={id} studentId={user.id} />}
        </div>
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
              <ConfirmButton label="Delete lesson" confirmLabel="Delete lesson and its attendance?" />
            </form>
          </div>
        )}
      </div>
    </>
  );
}

async function AttendanceCard({ lessonId }: { lessonId: number }) {
  const [students, marks] = await Promise.all([
    getStudents(),
    db.select().from(attendance).where(eq(attendance.lessonId, lessonId)),
  ]);
  const statusFor = new Map(marks.map((m) => [m.studentId, m.status]));

  return (
    <Card title="Attendance">
      {students.length === 0 ? (
        <EmptyState>
          Add students on the <TextLink href="/people">People</TextLink> page first.
        </EmptyState>
      ) : (
        <ActionForm action={saveAttendance} submitLabel="Save attendance">
          <input type="hidden" name="lessonId" value={lessonId} />
          <ul className="divide-y divide-stone-100">
            {students.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-sm font-medium">{s.name}</span>
                <div className="flex gap-1">
                  {(["present", "absent", "excused"] as const).map((status) => (
                    <label key={status} className="cursor-pointer">
                      <input
                        type="radio"
                        name={`status-${s.id}`}
                        value={status}
                        defaultChecked={statusFor.get(s.id) === status}
                        className="peer sr-only"
                      />
                      <span className="inline-block rounded-md border border-stone-200 px-2.5 py-1 text-xs capitalize text-stone-600 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-300">
                        {status}
                      </span>
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </ActionForm>
      )}
    </Card>
  );
}

async function MyAttendance({ lessonId, studentId }: { lessonId: number; studentId: number }) {
  const [mark] = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.lessonId, lessonId), eq(attendance.studentId, studentId)));
  return (
    <Card title="My attendance">
      {mark ? (
        <Badge tone={STATUS_TONE[mark.status]}>
          <span className="capitalize">{mark.status}</span>
        </Badge>
      ) : (
        <p className="text-sm text-stone-500">Not recorded yet.</p>
      )}
    </Card>
  );
}
