import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Icon } from "@/components/icons";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { createLesson } from "@/lib/actions/lessons";
import { requireUser } from "@/lib/dal";
import { getLessons } from "@/lib/queries";
import { LessonFields } from "./lesson-fields";

export default async function LessonsPage() {
  const user = await requireUser();
  const isTeacher = user.role === "teacher";
  const lessons = await getLessons();

  return (
    <>
      <PageHeader title="Lessons" description="Tap a lesson to open it." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <Card>
          {lessons.length === 0 ? (
            <EmptyState>No lessons yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-white/5">
              {lessons.map((lesson) => (
                <li key={lesson.id} className="flex items-center gap-2">
                  <a
                    href={lesson.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="-mx-2 flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-white/5"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
                      <Icon name="book" />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium text-slate-100">
                      {lesson.title}
                    </span>
                    <Icon name="external" className="size-4 shrink-0 text-slate-500" />
                  </a>
                  {isTeacher && (
                    <Link
                      href={`/lessons/${lesson.id}`}
                      className="shrink-0 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-amber-300"
                    >
                      Edit
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
        {isTeacher && (
          <Card title="Add a lesson">
            <ActionForm action={createLesson} submitLabel="Add lesson" resetOnSuccess>
              <LessonFields />
            </ActionForm>
          </Card>
        )}
      </div>
    </>
  );
}
