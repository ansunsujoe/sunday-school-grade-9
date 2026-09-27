import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { Badge, Card, EmptyState, PageHeader, TextLink, buttonClass } from "@/components/ui";
import { getContentItem } from "@/lib/content";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { quizzes } from "@/lib/db/schema";

/**
 * The frame around every content page: title, the page itself, and a sidebar
 * with the item's outside link, anything in `aside`, and its quizzes.
 */
export async function ContentPage({
  slug,
  aside,
  children,
}: {
  slug: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const item = getContentItem(slug);
  if (!item) notFound();

  const user = await requireUser();
  const linkedQuizzes = await db
    .select()
    .from(quizzes)
    .where(
      user.role === "teacher"
        ? eq(quizzes.lessonSlug, slug)
        : and(eq(quizzes.lessonSlug, slug), eq(quizzes.published, true)),
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
        description={item.summary}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <article className="min-w-0 rounded-2xl border border-line bg-night-900/70 p-4 sm:p-8">
          {children}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24">
          {aside}
          {item.url && (
            <Card title="Material">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className={buttonClass}>
                Open link <Icon name="external" className="size-4" />
              </a>
            </Card>
          )}
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
