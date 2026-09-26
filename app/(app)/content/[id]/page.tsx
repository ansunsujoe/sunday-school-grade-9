import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { Badge, Card, EmptyState, PageHeader, TextLink, buttonClass, secondaryButtonClass } from "@/components/ui";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { lessons, quizzes } from "@/lib/db/schema";

export default async function ContentItemPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [item] = await db.select().from(lessons).where(eq(lessons.id, id));
  if (!item) notFound();

  const isTeacher = user.role === "teacher";
  const linkedQuizzes = await db
    .select()
    .from(quizzes)
    .where(
      isTeacher
        ? eq(quizzes.lessonId, id)
        : and(eq(quizzes.lessonId, id), eq(quizzes.published, true)),
    );

  const openLink = item.url && (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className={buttonClass}>
      Open link <Icon name="external" className="size-4" />
    </a>
  );

  return (
    <>
      <Link
        href="/content"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100"
      >
        <Icon name="arrowLeft" className="size-4" /> Content
      </Link>
      <PageHeader
        eyebrow={item.kind === "lesson" ? "Lesson" : "Supplementary"}
        title={item.title}
        action={
          <div className="flex flex-wrap gap-2">
            {isTeacher && (
              <Link href={`/content/${id}/edit`} className={secondaryButtonClass}>
                Edit
              </Link>
            )}
            {!item.body && openLink}
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        {item.body ? (
          <article className="min-w-0 rounded-2xl border border-white/[0.07] bg-night-900/70 p-4 sm:p-6">
            <Markdown>{item.body}</Markdown>
          </article>
        ) : (
          <Card>
            <p className="text-sm text-slate-400">This content lives at a link. Tap “Open link” above.</p>
          </Card>
        )}
        <aside className="space-y-6 lg:sticky lg:top-24">
          {item.body && item.url && <Card title="Material">{openLink}</Card>}
          <Card title="Quizzes">
            {linkedQuizzes.length === 0 ? (
              <EmptyState>No quizzes for this yet.</EmptyState>
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
        </aside>
      </div>
    </>
  );
}
