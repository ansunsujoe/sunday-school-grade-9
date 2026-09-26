import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { createLesson } from "@/lib/actions/lessons";
import { requireUser } from "@/lib/dal";
import { formatDate, today } from "@/lib/format";
import { getLessons } from "@/lib/queries";
import { LessonFields } from "./lesson-fields";

export default async function LessonsPage() {
  const user = await requireUser();
  const lessons = await getLessons();
  const now = today();
  const upcoming = lessons.filter((l) => l.date >= now);
  const past = lessons.filter((l) => l.date < now).reverse();

  return (
    <>
      <PageHeader title="Lessons" description="Our class schedule, week by week." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <LessonList title="Upcoming" lessons={upcoming} empty="No upcoming lessons scheduled." />
          <LessonList title="Past" lessons={past} empty="No past lessons yet." />
        </div>
        {user.role === "teacher" && (
          <Card title="Add a lesson" className="h-fit">
            <ActionForm action={createLesson} submitLabel="Add lesson" resetOnSuccess>
              <LessonFields />
            </ActionForm>
          </Card>
        )}
      </div>
    </>
  );
}

function LessonList({
  title,
  lessons,
  empty,
}: {
  title: string;
  lessons: Awaited<ReturnType<typeof getLessons>>;
  empty: string;
}) {
  return (
    <Card title={title}>
      {lessons.length === 0 ? (
        <EmptyState>{empty}</EmptyState>
      ) : (
        <ul className="divide-y divide-stone-100">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <Link
                href={`/lessons/${lesson.id}`}
                className="-mx-2 flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-3 hover:bg-stone-50"
              >
                <div>
                  <div className="font-medium text-stone-900">{lesson.title}</div>
                  {lesson.scripture && (
                    <div className="text-sm text-stone-600">{lesson.scripture}</div>
                  )}
                </div>
                <Badge>{formatDate(lesson.date)}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
